// src/services/alertService.js
// Sistema de alertas completamente funcional

import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './notificationService';

class AlertService {
  constructor() {
    this.alerts = [];
    this.alertSettings = {
      pm25Alerts: true,
      pm25Threshold: 25,
      pm10Alerts: true,
      pm10Threshold: 50,
      aqiAlerts: true,
      aqiThreshold: 75,
      pushNotifications: true,
      emailAlerts: false,
      soundAlerts: true,
    };
    this.listeners = [];
    this.lastAlertTime = {};
    this.loadAlerts();
    this.loadSettings();
  }

  // Cargar alertas desde AsyncStorage
  async loadAlerts() {
    try {
      const stored = await AsyncStorage.getItem('@airsafe_alerts');
      if (stored) {
        this.alerts = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  }

  // Guardar alertas
  async saveAlerts() {
    try {
      await AsyncStorage.setItem('@airsafe_alerts', JSON.stringify(this.alerts));
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  }

  // Cargar configuración de alertas
  async loadSettings() {
    try {
      const stored = await AsyncStorage.getItem('@airsafe_alert_settings');
      if (stored) {
        this.alertSettings = { ...this.alertSettings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading alert settings:', error);
    }
  }

  // Guardar configuración de alertas
  async saveSettings() {
    try {
      await AsyncStorage.setItem('@airsafe_alert_settings', JSON.stringify(this.alertSettings));
    } catch (error) {
      console.error('Error saving alert settings:', error);
    }
  }

  // Actualizar configuración
  updateSettings(newSettings) {
    this.alertSettings = { ...this.alertSettings, ...newSettings };
    this.saveSettings();
  }

  // Procesar datos de sensores para generar alertas
  processData(sensorData) {
    const now = Date.now();
    const pm25 = parseFloat(sensorData.pm25) || 0;
    const pm10 = parseFloat(sensorData.pm10) || 0;
    const aqi = this.calculateAQI(pm25, pm10);

    // Verificar alerta PM2.5
    if (this.alertSettings.pm25Alerts && pm25 > this.alertSettings.pm25Threshold) {
      this.createAlert({
        type: 'warning',
        title: 'PM2.5 Alto',
        message: `Los niveles de PM2.5 han superado el umbral recomendado (${pm25.toFixed(1)} μg/m³)`,
        value: pm25,
        threshold: this.alertSettings.pm25Threshold,
        parameter: 'PM2.5'
      });
    }

    // Verificar alerta PM10
    if (this.alertSettings.pm10Alerts && pm10 > this.alertSettings.pm10Threshold) {
      this.createAlert({
        type: 'warning',
        title: 'PM10 Alto',
        message: `Los niveles de PM10 han superado el umbral recomendado (${pm10.toFixed(1)} μg/m³)`,
        value: pm10,
        threshold: this.alertSettings.pm10Threshold,
        parameter: 'PM10'
      });
    }

    // Verificar alerta AQI
    if (this.alertSettings.aqiAlerts && aqi > this.alertSettings.aqiThreshold) {
      const severity = aqi > 150 ? 'danger' : aqi > 100 ? 'warning' : 'info';
      this.createAlert({
        type: severity,
        title: severity === 'danger' ? 'AQI Crítico' : 'AQI Alto',
        message: `Índice de calidad del aire en nivel ${severity === 'danger' ? 'peligroso' : 'alto'} (AQI: ${aqi})`,
        value: aqi,
        threshold: this.alertSettings.aqiThreshold,
        parameter: 'AQI'
      });
    }

    // Alertas de mejora (cuando los valores bajan)
    if (pm25 <= this.alertSettings.pm25Threshold && this.wasAboveThreshold('PM2.5')) {
      this.createAlert({
        type: 'success',
        title: 'Calidad Mejorada',
        message: 'Los niveles de PM2.5 han vuelto a niveles saludables',
        value: pm25,
        threshold: this.alertSettings.pm25Threshold,
        parameter: 'PM2.5'
      });
    }
  }

  // Crear nueva alerta
  createAlert(alertData) {
    const alertKey = `${alertData.parameter}_${alertData.type}`;
    const now = Date.now();

    // Evitar spam - solo una alerta del mismo tipo cada 5 minutos
    if (this.lastAlertTime[alertKey] && (now - this.lastAlertTime[alertKey]) < 300000) {
      return;
    }

    const alert = {
      id: Date.now().toString(),
      ...alertData,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      location: 'Sensor Principal',
      acknowledged: false,
      created: now
    };

    this.alerts.unshift(alert);
    this.lastAlertTime[alertKey] = now;

    // Mantener solo las últimas 50 alertas
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }

    this.saveAlerts();
    this.notifyListeners();

    // Enviar notificación push si está habilitada
    if (this.alertSettings.pushNotifications) {
      notificationService.sendPushNotification({
        title: alert.title,
        body: alert.message,
        data: { alertId: alert.id }
      });
    }
  }

  // Verificar si un parámetro estaba sobre el umbral
  wasAboveThreshold(parameter) {
    const recentAlerts = this.alerts.filter(alert => 
      alert.parameter === parameter && 
      alert.type === 'warning' && 
      (Date.now() - new Date(alert.timestamp).getTime()) < 600000 // últimos 10 minutos
    );
    return recentAlerts.length > 0;
  }

  // Calcular AQI básico
  calculateAQI(pm25, pm10) {
    // Fórmula simplificada para AQI basada en PM2.5 y PM10
    const aqi25 = pm25 * 2; // Aproximación simple
    const aqi10 = pm10 * 1.5; // Aproximación simple
    return Math.max(aqi25, aqi10);
  }

  // Marcar alerta como leída
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.saveAlerts();
      this.notifyListeners();
    }
  }

  // Obtener estadísticas de alertas
  getAlertStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAlerts = this.alerts.filter(alert => 
      new Date(alert.timestamp) >= today
    );

    const active = this.alerts.filter(alert => !alert.acknowledged).length;
    const acknowledged = this.alerts.filter(alert => alert.acknowledged).length;

    return {
      active,
      acknowledged,
      totalToday: todayAlerts.length,
      all: this.alerts
    };
  }

  // Obtener alertas filtradas
  getAlerts(filter = 'all') {
    switch (filter) {
      case 'active':
        return this.alerts.filter(alert => !alert.acknowledged);
      case 'acknowledged':
        return this.alerts.filter(alert => alert.acknowledged);
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.alerts.filter(alert => new Date(alert.timestamp) >= today);
      default:
        return this.alerts;
    }
  }

  // Agregar listener para cambios
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remover listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notificar a todos los listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  // Limpiar alertas antiguas (más de 7 días)
  cleanOldAlerts() {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > weekAgo
    );
    this.saveAlerts();
  }
}

export default new AlertService();
