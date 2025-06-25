// src/constants/CONFIG.ts
// Configuración centralizada de variables de entorno y servicios
// 🔧 COMPLETAR: Reemplaza los valores PLACEHOLDER por los reales antes de producción

export const CONFIG = {
  mqtt: {
    broker: process.env.EXPO_PUBLIC_MQTT_BROKER || 'PLACEHOLDER',
    port: process.env.EXPO_PUBLIC_MQTT_PORT || 'PLACEHOLDER',
    username: process.env.EXPO_PUBLIC_MQTT_USER || 'PLACEHOLDER',
    password: process.env.EXPO_PUBLIC_MQTT_PASS || 'PLACEHOLDER',
  },
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'PLACEHOLDER',
    apiKey: process.env.EXPO_PUBLIC_API_KEY || 'PLACEHOLDER',
  },
  notifications: {
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID || 'PLACEHOLDER',
  },
};

// 📝 IMPORTANTE: Reemplaza los valores PLACEHOLDER antes de producción.
