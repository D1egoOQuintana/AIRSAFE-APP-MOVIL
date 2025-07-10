// src/services/MqttManager.js
// Gestor de conexión MQTT para datos en tiempo real (Paho MQTT compatible web y móvil)

import { Client, Message } from 'paho-mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { MQTT_CONFIG } from '../constants/mqtt';

// EventEmitter compatible con web y móvil
class EventEmitter {
  constructor() {
    this.events = {};
  }
  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }
  emit(event, ...args) {
    if (this.events[event]) this.events[event].forEach(cb => cb(...args));
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
    this.alertService = null;
    this.topics = [
      MQTT_CONFIG.topics.pm1,
      MQTT_CONFIG.topics.pm25,
      MQTT_CONFIG.topics.pm10,
      MQTT_CONFIG.topics.humidity,
      MQTT_CONFIG.topics.wifi_signal,
      MQTT_CONFIG.topics.air_quality,
      MQTT_CONFIG.topics.alert_level,
      MQTT_CONFIG.topics.status,
      MQTT_CONFIG.topics.emergency,
      MQTT_CONFIG.topics.health_level,
      MQTT_CONFIG.topics.action,
      MQTT_CONFIG.topics.aqi_pm25,
      MQTT_CONFIG.topics.aqi_pm10,
      MQTT_CONFIG.topics.aqi_combined,
      MQTT_CONFIG.topics.all_data,
      MQTT_CONFIG.topics.device_info,
      MQTT_CONFIG.topics.all
    ];
    this.sensorData = {
      pm1: null,
      pm25: null,
      pm10: null,
      temperature: null,
      humidity: null,
      wifi_signal: null,
      air_quality: null,
      alert_level: null,
      status: null,
      emergency: null,
      health_level: null,
      action: null,
      aqi_pm25: null,
      aqi_pm10: null,
      aqi_combined: null,
      all_data: null,
      device_info: null,
      lastUpdate: null
    };
  }

  getBrokerConfig() {
    // Fuerza WebSocket en todos los entornos (web y móvil)
    // Usa clientId único y keepalive alto
    return {
      hostname: MQTT_CONFIG.brokerUrl,
      port: MQTT_CONFIG.webSocketPort, // Siempre WebSocket
      clientId: 'airsafe-' + Math.random().toString(16).substr(2, 8),
      username: MQTT_CONFIG.username || '',
      password: MQTT_CONFIG.password || '',
      useSSL: false,
      keepAliveInterval: 120, // keepalive alto
      cleanSession: MQTT_CONFIG.options.clean,
      reconnectPeriod: 15000, // reconexión más lenta
      isWeb: true // Siempre WebSocket
    };
  }

  async connect() {
    try {
      const config = this.getBrokerConfig();
      console.log(`🔌 Conectando a MQTT (${config.isWeb ? 'WebSocket' : 'TCP'}):`, {
        host: config.hostname,
        port: config.port,
        clientId: config.clientId
      });
      this.client = new Client(config.hostname, Number(config.port), config.clientId);
      this.client.onConnectionLost = this.onConnectionLost.bind(this);
      this.client.onMessageArrived = this.onMessageArrived.bind(this);
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

  onConnected() {
    console.log('✅ Conectado al broker MQTT');
    this.isConnected = true;
    this.connectionAttempts = 0;
    this.emit('connected');
    this.subscribeToTopics();
  }

  onConnectionFailed(error) {
    console.error('❌ Fallo en conexión MQTT:', error);
    this.isConnected = false;
    this.emit('connectionFailed', error);
    this.scheduleReconnect();
  }

  onConnectionLost(responseObject) {
    // Manejo especial para evitar bucles rápidos de reconexión
    if (responseObject?.errorMessage && responseObject.errorMessage.includes('Socket closed')) {
      console.warn('⚠️ Conexión MQTT perdida por socket cerrado. Esperando antes de reconectar...');
      setTimeout(() => {
        this.scheduleReconnect();
      }, 15000); // Espera 15s antes de intentar reconectar
      this.isConnected = false;
      this.emit('connectionLost', responseObject);
      return;
    }
    console.warn('⚠️ Conexión MQTT perdida:', responseObject?.errorMessage || 'Sin mensaje');
    this.isConnected = false;
    this.emit('connectionLost', responseObject);
    this.scheduleReconnect();
  }

  subscribeToTopics() {
    if (!this.client || !this.isConnected) {
      console.warn('⚠️ Cliente no conectado, no se puede suscribir');
      return;
    }
    this.topics.forEach(topic => {
      try {
        this.client.subscribe(topic);
        console.log(`📡 Suscrito a topic: ${topic}`);
      } catch (error) {
        console.error(`❌ Error al suscribirse a ${topic}:`, error);
      }
    });
  }

  onMessageArrived(message) {
    try {
      const topic = message.destinationName;
      const payload = message.payloadString;
      console.log(`📨 Mensaje recibido - Topic: ${topic}, Payload: ${payload}`);
      const topicKey = topic.split('/').pop();
      if (topicKey === 'all_data') {
        try {
          const allData = JSON.parse(payload);
          this.sensorData = { ...this.sensorData, ...allData };
        } catch (e) {
          console.error('❌ Error parsing all_data JSON:', e);
          this.sensorData.all_data = payload;
        }
      } else if (topicKey === 'device_info') {
        try {
          const deviceInfo = JSON.parse(payload);
          this.sensorData.device_info = deviceInfo;
        } catch (e) {
          this.sensorData.device_info = payload;
        }
      } else {
        if (this.sensorData.hasOwnProperty(topicKey)) {
          let processedValue = payload;
          if (!isNaN(payload) && payload !== '') {
            processedValue = parseFloat(payload);
          }
          this.sensorData[topicKey] = processedValue;
        } else {
          this.sensorData[topicKey] = payload;
        }
      }
      this.sensorData.lastUpdate = new Date().toISOString();
      if (this.alertService) {
        this.alertService.processData(this.sensorData);
      }
      this.emit('dataUpdate', {
        topic,
        payload,
        sensorData: this.sensorData
      });
      this.saveDataToStorage();
    } catch (error) {
      console.error('❌ Error procesando mensaje:', error);
    }
  }

  async saveDataToStorage() {
    try {
      await AsyncStorage.setItem('@airsafe_data', JSON.stringify(this.sensorData));
    } catch (error) {
      console.error('❌ Error guardando datos:', error);
    }
  }

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

  reconnect() {
    console.log('🔄 Reconexión manual iniciada...');
    this.connectionAttempts = 0;
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  setAlertService(alertService) {
    this.alertService = alertService;
    console.log('🔔 Servicio de alertas conectado al MQTT Manager');
  }

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

  getCurrentData() {
    return this.sensorData;
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      connectionAttempts: this.connectionAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      broker: MQTT_CONFIG.brokerUrl,
      topics: this.topics.length
    };
  }

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

const mqttManager = new MqttManager();
export default mqttManager;
