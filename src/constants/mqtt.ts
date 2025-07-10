// src/constants/mqtt.ts
// Configuración centralizada para MQTT AirSafe
// ✅ Configurado para broker público con soporte WebSocket

export const MQTT_CONFIG = {
  // Broker EMQX público con soporte WebSocket
  brokerUrl: 'broker.emqx.io',

  // Puerto estándar MQTT (TCP) - para aplicaciones nativas
  port: 1883,

  // Puerto WebSocket para aplicaciones web - EMQX público soporta ambos
  webSocketPort: 8083, // WebSocket estándar para EMQX

  // Sin credenciales para broker público
  username: null,
  password: null,

  // Topics MQTT AIRSAFE D1EGO EPA - 100% REALES (exactamente como en firmware C++)
  topics: {
    // Sensores individuales
    pm1: 'd1ego/airsafe/pm1',
    pm25: 'd1ego/airsafe/pm25', 
    pm10: 'd1ego/airsafe/pm10',
    humidity: 'd1ego/airsafe/humidity',
    
    // Estado del sistema
    wifi_signal: 'd1ego/airsafe/wifi_signal',
    alert_level: 'd1ego/airsafe/alert_level',
    status: 'd1ego/airsafe/status',
    health_level: 'd1ego/airsafe/health_level',
    action: 'd1ego/airsafe/action',
    emergency: 'd1ego/airsafe/emergency',
    
    // Calidad del aire
    air_quality: 'd1ego/airsafe/air_quality',
    aqi_pm25: 'd1ego/airsafe/aqi_pm25',
    aqi_pm10: 'd1ego/airsafe/aqi_pm10',
    aqi_combined: 'd1ego/airsafe/aqi_combined',
    
    // Datos agrupados
    all_data: 'd1ego/airsafe/all_data',
    device_info: 'd1ego/airsafe/device_info',

    // Topic comodín para suscribirse a todos
    all: 'd1ego/airsafe/#'
  },

  // Configuración de conexión
  options: {
    keepalive: 60,
    reschedulePings: true,
    clientId: 'mqtt-explorer-132be959',
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
  },
};

// ✅ Configurado para broker EMQX público (broker.emqx.io) - 100% REAL
// ✅ Topics exactos del firmware AirSafe D1EGO EPA
