// src/services/notificationService.js
// Manejo de notificaciones push para alertas de calidad del aire

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shouldSendAlert, calculateOverallAirQuality } from '../utils/airQuality';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.lastNotificationTime = {};
    this.notificationCooldown = 5 * 60 * 1000; // 5 minutos
    this.configure();
  }

  async configure() {
    try {
      // Para web, usar notificaciones del navegador
      if (Platform.OS === 'web') {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            this.isInitialized = true;
            console.log('✅ Notificaciones web configuradas');
          } else {
            console.warn('⚠️ Permisos de notificación web no otorgados');
          }
        } else {
          console.warn('⚠️ Navegador no soporta notificaciones');
        }
        return;
      }

      // Configurar comportamiento de notificaciones para móvil
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // Solicitar permisos
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('⚠️ Permisos de notificación no otorgados');
        return;
      }

      // Configurar canal de notificaciones para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('air-quality', {
          name: 'Calidad del Aire',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          description: 'Alertas sobre la calidad del aire',
        });
      }

      this.isInitialized = true;
      console.log('✅ Servicio de notificaciones configurado');
      
      // Cargar tiempos de última notificación
      await this.loadLastNotificationTimes();
      
    } catch (error) {
      console.error('❌ Error configurando notificaciones:', error);
    }
  }

  async loadLastNotificationTimes() {
    try {
      const data = await AsyncStorage.getItem('@airsafe_notifications');
      if (data) {
        this.lastNotificationTime = JSON.parse(data);
      }
    } catch (error) {
      console.error('❌ Error cargando tiempos de notificación:', error);
    }
  }

  async saveLastNotificationTimes() {
    try {
      await AsyncStorage.setItem('@airsafe_notifications', JSON.stringify(this.lastNotificationTime));
    } catch (error) {
      console.error('❌ Error guardando tiempos de notificación:', error);
    }
  }

  async checkAndSendAirQualityAlert(currentData, previousData) {
    if (!this.isInitialized) {
      console.log('🔄 Servicio de notificaciones no inicializado');
      return;
    }

    try {
      const { pm25, pm10 } = currentData;
      const { pm25: prevPM25, pm10: prevPM10 } = previousData || {};

      // Verificar si debe enviar alerta
      if (!shouldSendAlert(pm25, pm10, prevPM25, prevPM10)) {
        return;
      }

      // Verificar cooldown
      const now = Date.now();
      const lastAlert = this.lastNotificationTime['air-quality'] || 0;
      
      if (now - lastAlert < this.notificationCooldown) {
        console.log('⏱️ Cooldown activo, no enviando notificación');
        return;
      }

      // Calcular calidad del aire
      const airQuality = calculateOverallAirQuality(pm25, pm10);
      if (!airQuality) return;

      // Preparar contenido de notificación
      const notification = this.createAirQualityNotification(airQuality, pm25, pm10);
      
      // Enviar notificación
      await this.sendNotification(notification);
      
      // Actualizar tiempo de última notificación
      this.lastNotificationTime['air-quality'] = now;
      await this.saveLastNotificationTimes();
      
      console.log('📢 Notificación de calidad del aire enviada');
      
    } catch (error) {
      console.error('❌ Error enviando alerta de calidad del aire:', error);
    }
  }

  createAirQualityNotification(airQuality, pm25, pm10) {
    const { category, label, icon, color } = airQuality;
    
    let title = '';
    let body = '';
    
    switch (category) {
      case 'INSALUBRE':
        title = `🚨 Alerta: Calidad del Aire ${label}`;
        body = `PM2.5: ${pm25} μg/m³, PM10: ${pm10} μg/m³. Evita actividades al aire libre.`;
        break;
        
      case 'INSALUBRE_SENSIBLES':
        title = `⚠️ Calidad del Aire ${label}`;
        body = `PM2.5: ${pm25} μg/m³, PM10: ${pm10} μg/m³. Grupos sensibles deben tomar precauciones.`;
        break;
        
      case 'MODERADO':
        title = `${icon} Calidad del Aire ${label}`;
        body = `PM2.5: ${pm25} μg/m³, PM10: ${pm10} μg/m³. Aceptable para la mayoría.`;
        break;
        
      default:
        title = `${icon} Calidad del Aire ${label}`;
        body = `PM2.5: ${pm25} μg/m³, PM10: ${pm10} μg/m³. Excelente para actividades al aire libre.`;
    }
    
    return {
      title,
      body,
      data: {
        type: 'air-quality',
        pm25,
        pm10,
        category,
        timestamp: new Date().toISOString()
      }
    };
  }

  async sendNotification(notification) {
    try {
      // Para web, usar notificaciones del navegador
      if (Platform.OS === 'web') {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.body,
            icon: '/assets/icon.png',
            badge: '/assets/icon.png',
            data: notification.data,
          });
          console.log('📱 Notificación web enviada:', notification.title);
        } else {
          console.warn('⚠️ Notificaciones web no disponibles');
        }
        return;
      }

      // Para móvil, usar Expo Notifications
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: 'default',
        },
        trigger: null, // Inmediata
        channelId: Platform.OS === 'android' ? 'air-quality' : undefined,
      });
      
      console.log('📱 Notificación programada:', notification.title);
      
    } catch (error) {
      console.error('❌ Error enviando notificación:', error);
    }
  }

  async sendConnectionAlert(isConnected) {
    if (!this.isInitialized) return;
    
    try {
      const now = Date.now();
      const lastAlert = this.lastNotificationTime['connection'] || 0;
      
      // Cooldown más largo para alertas de conexión
      if (now - lastAlert < this.notificationCooldown * 2) {
        return;
      }
      
      const notification = {
        title: isConnected ? '✅ Conectado' : '❌ Desconectado',
        body: isConnected 
          ? 'Conexión con sensores restablecida'
          : 'Perdida la conexión con los sensores',
        data: {
          type: 'connection',
          isConnected,
          timestamp: new Date().toISOString()
        }
      };
      
      await this.sendNotification(notification);
      
      this.lastNotificationTime['connection'] = now;
      await this.saveLastNotificationTimes();
      
    } catch (error) {
      console.error('❌ Error enviando alerta de conexión:', error);
    }
  }

  async sendCustomAlert(title, body, data = {}) {
    if (!this.isInitialized) return;
    
    try {
      const notification = {
        title,
        body,
        data: {
          type: 'custom',
          ...data,
          timestamp: new Date().toISOString()
        }
      };
      
      await this.sendNotification(notification);
      
    } catch (error) {
      console.error('❌ Error enviando alerta personalizada:', error);
    }
  }

  async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('🗑️ Todas las notificaciones eliminadas');
    } catch (error) {
      console.error('❌ Error eliminando notificaciones:', error);
    }
  }

  async getNotificationHistory() {
    try {
      const notifications = await Notifications.getPresentedNotificationsAsync();
      return notifications.map(notification => ({
        id: notification.request.identifier,
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data,
        date: new Date(notification.date)
      }));
    } catch (error) {
      console.error('❌ Error obteniendo historial de notificaciones:', error);
      return [];
    }
  }

  // Configurar listener para notificaciones recibidas
  addNotificationListener(handler) {
    return Notifications.addNotificationReceivedListener(handler);
  }

  // Configurar listener para notificaciones tocadas
  addNotificationResponseListener(handler) {
    return Notifications.addNotificationResponseReceivedListener(handler);
  }
}

// Singleton instance
const notificationService = new NotificationService();

export default notificationService;
