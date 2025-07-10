// src/utils/mqttTest.js
// Script de prueba para verificar conectividad MQTT real

import mqttManager from '../services/MqttManager';

class MqttTest {
  constructor() {
    this.isRunning = false;
    this.messagesReceived = [];
    this.testStartTime = null;
  }

  async startTest() {
    if (this.isRunning) {
      console.log('⚠️ Test ya está ejecutándose');
      return;
    }

    this.isRunning = true;
    this.messagesReceived = [];
    this.testStartTime = Date.now();
    
    console.log('🧪 Iniciando test de conectividad MQTT...');
    console.log('🔗 Broker: broker.emqx.io');
    console.log('📡 Topics: d1ego/airsafe/#');

    // Configurar listeners
    mqttManager.on('connected', this.onConnected.bind(this));
    mqttManager.on('dataUpdate', this.onDataUpdate.bind(this));
    mqttManager.on('error', this.onError.bind(this));
    mqttManager.on('connectionFailed', this.onConnectionFailed.bind(this));

    try {
      await mqttManager.connect();
      
      // Timeout para el test
      setTimeout(() => {
        this.stopTest();
      }, 30000); // 30 segundos

    } catch (error) {
      console.error('❌ Error iniciando test:', error);
      this.stopTest();
    }
  }

  onConnected() {
    console.log('✅ MQTT Test - Conectado exitosamente');
    console.log('⏱️ Tiempo de conexión:', Date.now() - this.testStartTime, 'ms');
    
    // Obtener estado de conexión
    const status = mqttManager.getConnectionStatus();
    console.log('📊 Estado de conexión:', status);
  }

  onDataUpdate(data) {
    const message = {
      topic: data.topic,
      payload: data.payload,
      timestamp: new Date().toISOString()
    };
    
    this.messagesReceived.push(message);
    
    console.log(`📨 Mensaje ${this.messagesReceived.length}:`, {
      topic: data.topic,
      payload: data.payload,
      data: data.sensorData
    });
  }

  onError(error) {
    console.error('❌ MQTT Test - Error:', error);
  }

  onConnectionFailed(error) {
    console.error('❌ MQTT Test - Conexión fallida:', error);
    this.stopTest();
  }

  stopTest() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    const testDuration = Date.now() - this.testStartTime;
    
    console.log('🏁 Test finalizado');
    console.log('📊 Resumen del test:');
    console.log('⏱️ Duración:', testDuration, 'ms');
    console.log('📨 Mensajes recibidos:', this.messagesReceived.length);
    
    if (this.messagesReceived.length > 0) {
      console.log('✅ Conectividad MQTT: OK');
      console.log('📋 Últimos mensajes:');
      this.messagesReceived.slice(-5).forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.topic}: ${msg.payload}`);
      });
    } else {
      console.log('⚠️ No se recibieron mensajes - puede ser que el dispositivo no esté enviando datos');
    }
    
    // Limpiar listeners
    mqttManager.removeAllListeners();
  }

  getResults() {
    return {
      isRunning: this.isRunning,
      messagesReceived: this.messagesReceived,
      testDuration: this.testStartTime ? Date.now() - this.testStartTime : 0
    };
  }
}

// Singleton para uso global
const mqttTest = new MqttTest();

export default mqttTest;

// Función helper para iniciar test desde consola
export function startMqttTest() {
  return mqttTest.startTest();
}

export function stopMqttTest() {
  return mqttTest.stopTest();
}

export function getMqttTestResults() {
  return mqttTest.getResults();
}
