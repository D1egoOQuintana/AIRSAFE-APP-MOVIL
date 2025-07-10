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
        handleNotification: async (notification) => {
          // Verificar si el sonido está habilitado en configuración
          try {
            const alertSettings = await AsyncStorage.getItem('@airsafe_alert_settings');
            const settings = alertSettings ? JSON.parse(alertSettings) : {};
            const soundEnabled = settings.soundAlerts !== false; // Por defecto habilitado
            
            return {
              shouldShowAlert: true,
              shouldPlaySound: soundEnabled,
              shouldSetBadge: true,
            };
          } catch (error) {
            console.error('Error leyendo configuración de sonido:', error);
            return {
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: true,
            };
          }
        },
      });

      // Solicitar permisos
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
      });
      
      if (status !== 'granted') {
        console.warn('⚠️ Permisos de notificación no otorgados:', status);
        return;
      }
      
      console.log('✅ Permisos de notificación otorgados');

      // Configurar canal de notificaciones para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('air-quality', {
          name: 'Calidad del Aire',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          description: 'Alertas sobre la calidad del aire',
          sound: 'default', // Sonido predeterminado
          enableVibrate: true,
          enableLights: true,
          showBadge: true,
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
            icon: '/assets/favicon.png',
            badge: '/assets/favicon.png',
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
          badge: 1,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
        },
        trigger: null, // Inmediata
        channelId: Platform.OS === 'android' ? 'air-quality' : undefined,
      });
      
      console.log('📱 Notificación programada:', notification.title);
      
    } catch (error) {
      console.error('❌ Error enviando notificación:', error);
    }
  }

  // Método para enviar notificación push desde alertService
  async sendPushNotification(notification) {
    if (!this.isInitialized) {
      console.log('🔄 Servicio de notificaciones no inicializado');
      return;
    }

    try {
      // Verificar cooldown para evitar spam
      const now = Date.now();
      const alertId = notification.data?.alertId || 'unknown';
      const lastAlert = this.lastNotificationTime[alertId] || 0;
      
      if (now - lastAlert < this.notificationCooldown) {
        console.log('⏱️ Cooldown activo para alerta:', alertId);
        return;
      }

      // Enviar notificación con sonido
      await this.sendNotificationWithSound(notification);
      
      // Actualizar tiempo de última notificación
      this.lastNotificationTime[alertId] = now;
      await this.saveLastNotificationTimes();
      
      console.log('📢 Notificación push enviada:', notification.title);
      
    } catch (error) {
      console.error('❌ Error enviando notificación push:', error);
    }
  }

  async sendNotificationWithSound(notification) {
    try {
      // Para web, usar notificaciones del navegador con sonido
      if (Platform.OS === 'web') {
        if ('Notification' in window && Notification.permission === 'granted') {
          const webNotification = new Notification(notification.title, {
            body: notification.body,
            icon: '/assets/favicon.png',
            badge: '/assets/favicon.png',
            data: notification.data,
            requireInteraction: true, // Mantener la notificación visible
          });
          
          // Reproducir sonido en web usando Web Audio API
          try {
            // Crear un sonido simple usando Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800; // Frecuencia del sonido
            gainNode.gain.value = 0.1; // Volumen bajo
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2); // Sonido de 200ms
            
            console.log('✅ Sonido web reproducido');
          } catch (audioError) {
            console.log('Audio no disponible en web:', audioError);
          }
          
          console.log('📱 Notificación web enviada con sonido:', notification.title);
        } else {
          console.warn('⚠️ Notificaciones web no disponibles');
        }
        return;
      }

      // Para móvil, usar Expo Notifications con sonido
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: 'default', // Sonido predeterminado
          badge: 1,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250], // Patrón de vibración
        },
        trigger: null, // Inmediata
        channelId: Platform.OS === 'android' ? 'air-quality' : undefined,
      });
      
      console.log('📱 Notificación móvil enviada con sonido:', notification.title);
      
    } catch (error) {
      console.error('❌ Error enviando notificación con sonido:', error);
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

  // Método para probar notificaciones con sonido
  async testNotificationSound() {
    if (!this.isInitialized) {
      console.log('🔄 Servicio de notificaciones no inicializado');
      return;
    }

    try {
      const testNotification = {
        title: '🔔 Prueba de Sonido',
        body: 'Esta es una notificación de prueba con sonido',
        data: {
          type: 'test',
          timestamp: new Date().toISOString()
        }
      };

      await this.sendNotificationWithSound(testNotification);
      console.log('✅ Notificación de prueba enviada');
      
    } catch (error) {
      console.error('❌ Error enviando notificación de prueba:', error);
    }
  }
}

// Singleton instance
const notificationService = new NotificationService();

export default notificationService;
export { notificationService };
