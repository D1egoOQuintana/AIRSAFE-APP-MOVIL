# 🧪 Guía de Prueba - AirSafe App

## 📱 **Métodos de Prueba Disponibles**

### 1. **Expo Go (Más Rápido - Recomendado para pruebas)**
```bash
# En la terminal del proyecto
npm start
```
- Escanea el código QR con la app Expo Go
- Disponible en Play Store/App Store
- Ideal para pruebas rápidas

### 2. **Simulador iOS (Mac)**
```bash
npm run ios
```

### 3. **Emulador Android**
```bash
npm run android
```

### 4. **Web Browser**
```bash
npm run web
```

## 🔧 **Configuración Previa**

### Verificar Instalación de Expo CLI
```bash
npm install -g @expo/cli
```

### Instalar Expo Go en tu teléfono
- **Android:** [Expo Go en Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS:** [Expo Go en App Store](https://apps.apple.com/app/expo-go/id982107779)

## 🚀 **Pasos para Probar la App**

### 1. **Abrir Terminal en el Directorio del Proyecto**
```bash
cd "c:\Users\Luis\Desktop\Trabajos\CICLO 4 2025\App react native AIRSEF\AirSafeApp"
```

### 2. **Ejecutar la Aplicación**
```bash
npm start
```

### 3. **Que Verás al Ejecutar**
- Se abrirá Expo DevTools en tu navegador
- Aparecerá un código QR en la terminal
- URLs para diferentes plataformas

### 4. **Conectar tu Dispositivo**
- Abre Expo Go en tu teléfono
- Escanea el código QR
- La app se cargará automáticamente

## 📊 **Funcionalidades que Puedes Probar**

### ✅ **Dashboard Principal**
- **Simulador activado:** Verás datos de PM2.5, PM10, PM1 cambiando cada 5 segundos
- **Métricas en tiempo real:** Temperatura, humedad, presión
- **Cálculo de AQI:** Índice de calidad del aire según EPA
- **Colores dinámicos:** Verde (bueno) a Rojo/Púrpura (peligroso)

### ✅ **Navegación por Tabs**
- **Inicio:** Dashboard con simulador
- **Historial:** Pantalla placeholder (para gráficos futuros)
- **Alertas:** Pantalla placeholder (para notificaciones)

### ✅ **Características Técnicas**
- **Redux funcional:** Estado global manejado correctamente
- **Hooks personalizados:** useMQTT, useAirQuality funcionando
- **Componentes UI:** Cards, Buttons con diseño moderno
- **TypeScript:** Tipado estricto funcionando

## 🎯 **Qué Esperar Ver**

### **Pantalla Principal (Dashboard)**
```
┌─────────────────────────────┐
│     AirSafe Dashboard       │
│   Monitoreo en tiempo real  │
│                             │
│  ┌─────────────────────────┐ │
│  │    Calidad del Aire     │ │
│  │         [AQI: XX]       │ │
│  │       EXCELENTE         │ │
│  └─────────────────────────┘ │
│                             │
│      Métricas Actuales      │
│  ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ XX.X │ │ XX.X │ │ XX.X │  │
│  │PM2.5 │ │ PM10 │ │ PM1  │  │
│  └──────┘ └──────┘ └──────┘  │
└─────────────────────────────┘
```

### **Datos del Simulador**
- **PM2.5:** 30-100 µg/m³ (varía según hora del día)
- **PM10:** 30-120 µg/m³ 
- **PM1:** 15-80 µg/m³
- **Temperatura:** 18-28°C
- **Humedad:** 40-70%
- **Patrones realistas:** Más contaminación en horas pico (6-9 AM, 6-9 PM)

## 🐛 **Solución de Problemas Comunes**

### **Error: Metro bundler not starting**
```bash
npx expo start --clear
```

### **Error: Expo Go not connecting**
- Verificar que estés en la misma red WiFi
- Reiniciar Expo Go
- Probar con túnel: `npx expo start --tunnel`

### **Error: Module not found**
```bash
npm install
npx expo start --clear
```

### **La app no carga**
1. Verificar que todas las dependencias estén instaladas
2. Comprobar errores en la terminal
3. Reiniciar el bundler con `--clear`

## 📝 **Logs y Debugging**

### **Ver Logs en Tiempo Real**
- En Expo Go: Agita el dispositivo → "Show Dev Menu" → "Remote JS Debugging"
- En la terminal: Los logs aparecen automáticamente
- En DevTools: Pestaña "Logs"

### **Cambiar Configuración del Simulador**
En `src/screens/dashboard/DashboardScreen.tsx`, línea ~21:
```typescript
useMQTT({
  deviceId: 'airsafe-001',
  onData: (data) => {/* ... */},
  useSimulator: true, // ← Cambiar a false para MQTT real
});
```

## 🚀 **Próximos Pasos Después de la Prueba**

1. **Configurar MQTT real:** Reemplazar placeholders en CONFIG.ts
2. **Agregar gráficos:** Implementar Victory Native en History
3. **Push notifications:** Configurar Expo Notifications
4. **Persistencia:** Agregar Redux Persist para offline
5. **Testing:** Jest para unit tests

---

**¡Tu app AirSafe está lista para probar! 🎉**
