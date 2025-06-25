// src/services/mqttService.ts
// Servicio MQTT para AirSafeApp
// Usa Paho MQTT y soporta modo simulador para desarrollo sin hardware

import { MQTT_CONFIG } from '../constants/mqtt';
// import { Client } from 'paho-mqtt'; // Descomenta si ya tienes la dependencia

const USE_SIMULATOR = true; // Cambia a false para usar MQTT real

export class MqttService {
  // client: Client | null = null;

  connect() {
    if (USE_SIMULATOR) {
      console.log('[MQTT] Modo simulador activado');
      return;
    }
    // TODO: Implementar conexión real con Paho MQTT
    // this.client = new Client(...)
  }

  subscribe(topic: string, callback: (msg: any) => void) {
    if (USE_SIMULATOR) return;
    // TODO: Suscribirse a topic real
  }

  publish(topic: string, message: string) {
    if (USE_SIMULATOR) return;
    // TODO: Publicar mensaje real
  }

  disconnect() {
    if (USE_SIMULATOR) return;
    // TODO: Desconectar cliente real
  }
}

export const mqttService = new MqttService();
