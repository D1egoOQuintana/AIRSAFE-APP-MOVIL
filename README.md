# 📱 AirSafe Mobile App - React Native

Una aplicación móvil profesional para monitoreo de calidad del aire en tiempo real, desarrollada con React Native/Expo y conectada a sensores IoT ESP32 con PMS5003 a través de MQTT.

## 🚀 Estado del Proyecto

✅ **Completado:**
- Estructura base del proyecto con TypeScript
- Sistema de tipos y interfaces completo
- Configuración de Redux Toolkit con slices
- Componentes UI reutilizables (Card, Button, AirQualityCard)
- Sistema de navegación con tabs y stack
- Servicios MQTT en tiempo real con MqttManager
- Sistema de notificaciones push automáticas
- Sistema de colores y tema moderno 2025
- Cálculo de AQI según estándares EPA/OMS
- Configuración de path aliases (@/*)
- Dashboard en tiempo real con datos MQTT
- Sistema de alertas y notificaciones
- Historial de datos con gráficos

🔧 **Configuración MQTT:**
- Broker: test.mosquitto.org:1883
- Topics: d1ego/airsafe/#
- Conexión TCP sin autenticación

## 🛠️ Configuración para Desarrollo

### 1. Instalar Dependencias

```bash
npm install @reduxjs/toolkit react-redux @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage expo-notifications react-native-chart-kit react-native-svg paho-mqtt
```

### 2. Configuración MQTT

La aplicación está configurada para conectarse automáticamente a:

```typescript
// Configuración actual en src/constants/mqtt.ts
export const MQTT_CONFIG = {
  brokerUrl: 'test.mosquitto.org',
  port: 1883,
  topics: {
    pm25: 'd1ego/airsafe/pm25',
    pm10: 'd1ego/airsafe/pm10',
    temperature: 'd1ego/airsafe/temperature',
    humidity: 'd1ego/airsafe/humidity',
    wifi_signal: 'd1ego/airsafe/wifi_signal',
    air_quality: 'd1ego/airsafe/air_quality',
    status: 'd1ego/airsafe/status',
    all: 'd1ego/airsafe/#'
  }
};
```

### 3. Ejecutar la Aplicación

```bash
npm start
```

La aplicación se conectará automáticamente al broker MQTT y comenzará a recibir datos en tiempo real.

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base (Card, Button)
│   ├── cards/          # Cards específicas (AirQualityCard)
│   └── common/         # Componentes comunes
├── constants/          # Configuraciones y constantes
│   ├── airQuality.ts   # Cálculos AQI y umbrales EPA
│   ├── theme.ts        # Sistema de diseño completo
│   └── mqtt.ts         # Configuración MQTT
├── services/           # Servicios principales
│   ├── MqttManager.js  # Gestor MQTT en tiempo real
│   ├── mqttService.ts  # Wrapper del MqttManager
│   └── notificationService.js # Notificaciones push
├── utils/              # Utilidades
│   └── airQuality.js   # Cálculos de calidad del aire
├── navigation/         # Configuración de navegación
├── screens/            # Pantallas de la app
│   ├── dashboard/      # Dashboard principal
│   ├── history/        # Historial y gráficos
│   ├── alerts/         # Gestión de alertas
│   └── settings/       # Configuraciones
├── services/           # Servicios externos
│   ├── mqttService.ts  # Cliente MQTT
│   ├── apiService.ts   # Cliente REST
│   └── storageService.ts # AsyncStorage
├── store/              # Redux store
│   ├── slices/         # Slices de Redux Toolkit
│   └── index.ts        # Configuración del store
├── types/              # Definiciones TypeScript
├── utils/              # Utilidades
│   └── dataSimulator.ts # Simulador de datos
```

## 🎨 Sistema de Diseño

### Colores de Calidad del Aire (Según EPA)
- **Excelente (0-50 AQI):** Verde #00E400
- **Bueno (51-100 AQI):** Amarillo #FFFF00
- **Moderado (101-150 AQI):** Naranja #FF7E00
- **No Saludable Sensibles (151-200 AQI):** Rojo #FF0000
- **No Saludable (201-300 AQI):** Púrpura #8F3F97
- **Muy No Saludable (301-400 AQI):** Marrón #7E0023
- **Peligroso (401-500 AQI):** Marrón oscuro #7E0023

### Componentes Disponibles
- `<Card>`: Contenedor con sombras y variantes
- `<Button>`: Botón moderno con estados
- `<SensorCard>`: Métricas de sensores en tiempo real

## 🔌 Integración MQTT

La aplicación está configurada para recibir datos MQTT en tiempo real del broker `test.mosquitto.org:1883` en los siguientes topics:

- `d1ego/airsafe/pm25` - Concentración PM2.5
- `d1ego/airsafe/pm10` - Concentración PM10  
- `d1ego/airsafe/temperature` - Temperatura
- `d1ego/airsafe/humidity` - Humedad
- `d1ego/airsafe/wifi_signal` - Señal WiFi
- `d1ego/airsafe/air_quality` - Categoría de calidad
- `d1ego/airsafe/status` - Estado del dispositivo

### Características MQTT
- **Reconexión automática:** Hasta 5 intentos con intervalos de 5s
- **Persistencia:** Datos guardados en AsyncStorage
- **Notificaciones:** Alertas automáticas por mala calidad del aire
- **Estado de conexión:** Indicador visual en tiempo real

## 📊 Pantallas Implementadas

### Dashboard Principal
- Métricas en tiempo real de todos los sensores
- Gráficos de tendencias y historial 24h
- Estado de conexión MQTT
- Recomendaciones automáticas según AQI

### Sistema de Alertas
- Historial de alertas con timestamp
- Configuración de umbrales personalizados
- Notificaciones push automáticas
- Filtros y búsqueda de alertas

### Historial y Gráficos
- Tendencias de hasta 24 horas
- Gráficos interactivos con Chart Kit
- Exportación de datos
- Análisis de patrones

## 🚀 Próximos Pasos

1. **Optimizar gráficos:** Mejorar rendimiento de Chart Kit
2. **Exportar datos:** Funcionalidad de backup/restore
3. **Notificaciones push:** Expo Notifications
4. **Offline storage:** Persistencia con Redux Persist
5. **Testing:** Jest y React Native Testing Library

## 📝 Notas de Desarrollo

- Todos los placeholders están marcados con `PLACEHOLDER_` para fácil identificación
- El sistema soporta modo offline y online
- Los path aliases `@/*` están configurados para imports limpios
- El código sigue las mejores prácticas de React Native 2025

## 🔧 Troubleshooting

### Error: "Cannot find module @/..."
Asegúrate de que `tsconfig.json` y `metro.config.js` tengan configurados los path aliases.

### MQTT no conecta
Verifica que:
1. Los valores PLACEHOLDER en CONFIG.ts estén reemplazados
2. El broker MQTT soporte WebSockets (puerto 8884 típicamente)
3. Las credenciales sean correctas


---

**Desarrollado por:** Diego Quintana, Luis - Equipo AirSafe IoT 2025
