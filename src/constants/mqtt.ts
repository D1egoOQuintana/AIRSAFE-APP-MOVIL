// src/constants/mqtt.ts
// Configuración centralizada para MQTT AirSafe
// ✅ Configurado para broker público con soporte WebSocket

export const MQTT_CONFIG = {
  // Broker MQTT público con soporte WebSocket
  brokerUrl: 'broker.emqx.io',

  // Puerto estándar MQTT (TCP) - para aplicaciones nativas
  port: 1883,

  // Puerto WebSocket para aplicaciones web
  webSocketPort: 8083,

  // Sin credenciales para broker público
  username: null,
  password: null,

  // Topics reales del sistema d1ego/airsafe
  topics: {
    // Topic principal con todos los datos de sensores
    sensors: 'd1ego/airsafe/sensors',
    
    // Topics específicos individuales
    pm1: 'd1ego/airsafe/pm1',
    pm25: 'd1ego/airsafe/pm25', 
    pm10: 'd1ego/airsafe/pm10',
    temperature: 'd1ego/airsafe/temperature',
    humidity: 'd1ego/airsafe/humidity',
    wifi_signal: 'd1ego/airsafe/wifi_signal',
    alert_level: 'd1ego/airsafe/alert_level',
    status: 'd1ego/airsafe/status',
    action: 'd1ego/airsafe/action',
    air_quality: 'd1ego/airsafe/air_quality',
    emergency: 'd1ego/airsafe/emergency',

    // Topic comodín para suscribirse a todos
    all: 'd1ego/airsafe/#'
  },

  // Configuración de conexión
  options: {
    keepalive: 60,
    reschedulePings: true,
    clientId: `airsafe_${Math.random().toString(16).substr(2, 8)}`,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
  },
};

// ✅ Configurado para broker real test.mosquitto.org
