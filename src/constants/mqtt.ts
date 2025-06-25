// src/constants/mqtt.ts
// Configuración centralizada para MQTT AirSafe
// 🔧 COMPLETAR: Reemplaza los valores PLACEHOLDER por los de tu broker real

export const MQTT_CONFIG = {
  // URL del broker MQTT (ejemplo: 'wss://broker.hivemq.com')
  brokerUrl: 'PLACEHOLDER_BROKER_URL',

  // Puerto WebSocket (ejemplo: 8884)
  port: 'PLACEHOLDER_PORT',

  // Credenciales (si aplica)
  username: 'PLACEHOLDER_USERNAME',
  password: 'PLACEHOLDER_PASSWORD',

  // Topics específicos del sistema AirSafe
  topics: {
    airQuality: 'airsafe/{deviceId}/air_quality',
    alerts: 'airsafe/{deviceId}/alerts',
    status: 'airsafe/{deviceId}/status',
    emergency: 'airsafe/broadcast/emergency',
  },
};

// 📝 IMPORTANTE: Reemplaza los valores PLACEHOLDER antes de producción.
