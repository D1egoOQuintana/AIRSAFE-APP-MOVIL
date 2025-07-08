// src/services/MqttManager.js
// Gestor de conexión MQTT para datos en tiempo real

import { Client, Message } from 'paho-mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { MQTT_CONFIG } from '../constants/mqtt';

// EventEmitter compatible con web
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args));
    }
  }
  
  removeAllListeners() {
    this.events = {};
  }
}

class MqttManager extends EventEmitter {
  constructor() {
    super();
    this.client = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.alertService = null; // Referencia al servicio de alertas
    this.topics = [
      MQTT_CONFIG.topics.pm25,
      MQTT_CONFIG.topics.pm10,
      MQTT_CONFIG.topics.temperature,
      MQTT_CONFIG.topics.humidity,
      MQTT_CONFIG.topics.wifi_signal,
      MQTT_CONFIG.topics.air_quality,
      MQTT_CONFIG.topics.status,
      MQTT_CONFIG.topics.all
    ];
    
    this.sensorData = {
      pm25: null,
      pm10: null,
      temperature: null,
      humidity: null,
      wifi_signal: null,
      air_quality: null,
      status: null,
      all_data: null,
      lastUpdate: null
    };
  }

  // Configuración del broker MQTT
  getBrokerConfig() {
    // Para web necesitamos WebSocket, para nativo usamos TCP
    const isWeb = Platform.OS === 'web';
    
    return {
      hostname: MQTT_CONFIG.brokerUrl,
      port: isWeb ? MQTT_CONFIG.webSocketPort : MQTT_CONFIG.port,
      clientId: MQTT_CONFIG.options.clientId,
      username: MQTT_CONFIG.username || '',
      password: MQTT_CONFIG.password || '',
      useSSL: false,
      keepAliveInterval: MQTT_CONFIG.options.keepalive,
      cleanSession: MQTT_CONFIG.options.clean,
      reconnectPeriod: MQTT_CONFIG.options.reconnectPeriod,
      isWeb: isWeb
    };
  }

  // Inicializar conexión MQTT
  async connect() {
    try {
      const config = this.getBrokerConfig();
      
      console.log(`🔌 Conectando a MQTT (${config.isWeb ? 'WebSocket' : 'TCP'}):`, {
        host: config.hostname,
        port: config.port,
        clientId: config.clientId
      });
      
      this.client = new Client(config.hostname, config.port, config.clientId);
      
      // Configurar eventos
      this.client.onConnectionLost = this.onConnectionLost.bind(this);
      this.client.onMessageArrived = this.onMessageArrived.bind(this);
      
      // Opciones de conexión
      const connectOptions = {
        useSSL: config.useSSL,
        userName: config.username,
        password: config.password,
        keepAliveInterval: config.keepAliveInterval,
        cleanSession: config.cleanSession,
        onSuccess: this.onConnected.bind(this),
        onFailure: this.onConnectionFailed.bind(this)
      };

      this.client.connect(connectOptions);
      
    } catch (error) {
      console.error('❌ Error al conectar MQTT:', error);
      this.emit('error', error);
      this.scheduleReconnect();
    }
  }

  // Conexión exitosa
  onConnected() {
    console.log('✅ Conectado al broker MQTT');
    this.isConnected = true;
    this.connectionAttempts = 0;
    this.emit('connected');
    this.subscribeToTopics();
  }

  // Error de conexión
  onConnectionFailed(error) {
    console.error('❌ Fallo en conexión MQTT:', error);
    this.isConnected = false;
    this.emit('connectionFailed', error);
    this.scheduleReconnect();
  }

  // Conexión perdida
  onConnectionLost(responseObject) {
    console.warn('⚠️ Conexión MQTT perdida:', responseObject.errorMessage);
    this.isConnected = false;
    this.emit('connectionLost', responseObject);
    this.scheduleReconnect();
  }

  // Suscribirse a todos los topics
  subscribeToTopics() {
    this.topics.forEach(topic => {
      try {
        this.client.subscribe(topic);
        console.log(`📡 Suscrito a topic: ${topic}`);
      } catch (error) {
        console.error(`❌ Error al suscribirse a ${topic}:`, error);
      }
    });
  }

  // Mensaje recibido
  onMessageArrived(message) {
    try {
      const topic = message.destinationName;
      const payload = message.payloadString;
      
      console.log(`📨 Mensaje recibido - Topic: ${topic}, Payload: ${payload}`);
      
      // Procesar según el topic
      const topicKey = topic.split('/').pop();
      
      if (topicKey === 'all_data') {
        try {
          const allData = JSON.parse(payload);
          this.sensorData = { ...this.sensorData, ...allData };
        } catch (e) {
          console.error('❌ Error parsing JSON:', e);
        }
      } else {
        this.sensorData[topicKey] = payload;
      }
      
      this.sensorData.lastUpdate = new Date().toISOString();
      
      // Procesar alertas si el servicio está disponible
      if (this.alertService) {
        this.alertService.processData(this.sensorData);
      }
      
      // Emitir evento con datos actualizados
      this.emit('dataUpdate', {
        topic,
        payload,
        sensorData: this.sensorData
      });
      
      // Guardar en AsyncStorage para persistencia
      this.saveDataToStorage();
      
    } catch (error) {
      console.error('❌ Error procesando mensaje:', error);
    }
  }

  // Guardar datos en AsyncStorage
  async saveDataToStorage() {
    try {
      await AsyncStorage.setItem('@airsafe_data', JSON.stringify(this.sensorData));
    } catch (error) {
      console.error('❌ Error guardando datos:', error);
    }
  }

  // Cargar datos desde AsyncStorage
  async loadDataFromStorage() {
    try {
      const data = await AsyncStorage.getItem('@airsafe_data');
      if (data) {
        this.sensorData = JSON.parse(data);
        this.emit('dataLoaded', this.sensorData);
      }
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
    }
  }

  // Programar reconexión
  scheduleReconnect() {
    if (this.connectionAttempts < this.maxReconnectAttempts) {
      this.connectionAttempts++;
      console.log(`🔄 Programando reconexión (${this.connectionAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('❌ Máximo de intentos de reconexión alcanzado');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  // Reconectar manualmente
  reconnect() {
    console.log('🔄 Reconexión manual iniciada...');
    this.connectionAttempts = 0;
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  // Establecer servicio de alertas
  setAlertService(alertService) {
    this.alertService = alertService;
    console.log('🔔 Servicio de alertas conectado al MQTT Manager');
  }

  // Desconectar
  disconnect() {
    if (this.client && this.isConnected) {
      try {
        this.client.disconnect();
        console.log('🔌 Desconectado del broker MQTT');
      } catch (error) {
        console.error('❌ Error al desconectar:', error);
      }
    }
    this.isConnected = false;
    this.emit('disconnected');
  }

  // Obtener datos actuales
  getCurrentData() {
    return this.sensorData;
  }

  // Obtener estado de conexión
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      connectionAttempts: this.connectionAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // Publicar mensaje (opcional)
  publish(topic, message) {
    if (this.client && this.isConnected) {
      try {
        const msg = new Message(message);
        msg.destinationName = topic;
        this.client.send(msg);
        console.log(`📤 Mensaje enviado a ${topic}: ${message}`);
      } catch (error) {
        console.error('❌ Error enviando mensaje:', error);
      }
    } else {
      console.warn('⚠️ No conectado, no se puede enviar mensaje');
    }
  }
}

// Singleton instance
const mqttManager = new MqttManager();

export default mqttManager;
