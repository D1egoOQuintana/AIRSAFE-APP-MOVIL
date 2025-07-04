# 📱 AirSafe Mobile App - React Native

Una aplicación móvil profesional para monitoreo de calidad del aire en tiempo real, desarrollada con React Native/Expo y conectada a sensores IoT ESP32 con PMS5003.

## 🚀 Estado del Proyecto

✅ **Completado:**
- Estructura base del proyecto con TypeScript
- Sistema de tipos y interfaces completo
- Configuración de Redux Toolkit con slices
- Componentes UI reutilizables (Card, Button, AirQualityCard)
- Sistema de navegación con tabs y stack
- Hooks personalizados (useMQTT, useAirQuality, useNotifications)
- Servicios base (MQTT, API, Storage)
- Simulador de datos realista para desarrollo
- Sistema de colores y tema moderno 2025
- Cálculo de AQI según estándares EPA/OMS
- Configuración de path aliases (@/*)

🔧 **Pendiente de Configuración:**
- Variables de entorno MQTT (ver sección "Configuración MQTT")
- Dependencias npm (ver package.json sugerido)
- Notificaciones push con Expo
- Gráficos interactivos con Victory Native

## 🛠️ Configuración para Desarrollo

### 1. Instalar Dependencias

```bash
npm install @reduxjs/toolkit react-redux @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage expo-notifications
```

### 2. Configuración MQTT

Edita `src/constants/CONFIG.ts` y `src/constants/mqtt.ts`:

```typescript
// Reemplaza los PLACEHOLDER por tus valores reales
export const CONFIG = {
  mqtt: {
    broker: 'wss://tu-broker-mqtt.com',
    port: 8884,
    username: 'tu-usuario',
    password: 'tu-contraseña',
  },
  // ...
};
```

### 3. Variables de Entorno

Crea un archivo `.env` en la raíz:

```env
EXPO_PUBLIC_MQTT_BROKER=wss://tu-broker-mqtt.com
EXPO_PUBLIC_MQTT_PORT=8884
EXPO_PUBLIC_MQTT_USER=tu-usuario
EXPO_PUBLIC_MQTT_PASS=tu-contraseña
```

### 4. Ejecutar en Modo Simulador

El proyecto incluye un simulador de datos que genera información realista:

```bash
npm start
```

**Importante:** El simulador está activado por defecto en `DashboardScreen.tsx`. Para usar MQTT real, cambia `useSimulator: false` en el hook `useMQTT`.

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
│   ├── mqtt.ts         # Configuración MQTT
│   └── CONFIG.ts       # Variables de entorno
├── hooks/              # Hooks personalizados
│   ├── useMQTT.ts      # Conexión MQTT + simulador
│   ├── useAirQuality.ts # Cálculos de calidad del aire
│   └── useNotifications.ts # Notificaciones
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
- `<AirQualityCard>`: Métricas de calidad del aire

## 🔌 Integración MQTT

### Modo Simulador (Desarrollo)
```typescript
// En DashboardScreen.tsx
useMQTT({
  deviceId: 'airsafe-001',
  onData: (data) => {/* ... */},
  useSimulator: true, // ✅ Datos simulados
});
```

### Modo Producción
```typescript
// Para conectar a MQTT real
useMQTT({
  deviceId: 'airsafe-001',
  onData: (data) => {/* ... */},
  useSimulator: false, // ❌ MQTT real
});
```

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
