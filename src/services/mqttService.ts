// src/services/mqttService.ts
// Servicio MQTT para AirSafeApp - Proxy para MqttManager
// Compatibilidad con el MqttManager existente

// Importar el MqttManager existente que ya está completamente implementado
import mqttManager from './MqttManager';

// Clase wrapper para mantener compatibilidad con la API antigua
export class MqttService {
  private manager: any;

  constructor() {
    this.manager = mqttManager;
  }

  async connect() {
    try {
      await this.manager.connect();
      console.log('✅ MQTT Service conectado via MqttManager');
    } catch (error) {
      console.error('❌ Error conectando MQTT Service:', error);
    }
  }

  subscribe(topic: string, callback: (msg: any) => void) {
    // El MqttManager ya maneja la suscripción automática a todos los topics
    this.manager.on('dataUpdate', callback);
  }

  publish(topic: string, message: string) {
    this.manager.publish(topic, message);
  }

  disconnect() {
    this.manager.disconnect();
  }

  // Métodos adicionales para acceder al MqttManager
  on(event: string, callback: any) {
    this.manager.on(event, callback);
  }

  removeAllListeners() {
    this.manager.removeAllListeners();
  }

  getCurrentData() {
    return this.manager.getCurrentData();
  }

  getConnectionStatus() {
    return this.manager.getConnectionStatus();
  }

  reconnect() {
    return this.manager.reconnect();
  }
}

export const mqttService = new MqttService();

// También exportar el MqttManager directamente para uso en componentes
export { mqttManager };
export default mqttService;
