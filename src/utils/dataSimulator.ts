// src/utils/dataSimulator.ts
// Simulador realista de datos de calidad del aire para desarrollo
// Genera datos de PM1, PM2.5, PM10 con patrones diurnos y simula alertas

import { AirQualityData } from '../types';

const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

export function generateSimulatedData(deviceId: string): AirQualityData {
  const hour = new Date().getHours();
  // Patrón diurno: más contaminación en horas pico
  const base = hour >= 6 && hour <= 9 ? 60 : hour >= 18 && hour <= 21 ? 80 : 30;
  const pm25 = getRandom(base, base + 40);
  const pm10 = getRandom(base, base + 60);
  const pm1 = getRandom(base / 2, base + 10);

  return {
    id: `${deviceId}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    deviceId,
    pm1: Math.round(pm1 * 10) / 10,
    pm25: Math.round(pm25 * 10) / 10,
    pm10: Math.round(pm10 * 10) / 10,
    temperature: getRandom(18, 28),
    humidity: getRandom(40, 70),
    pressure: getRandom(1000, 1020),
    aqi: Math.round(Math.max(pm25, pm10)), // Simplificado para simulador
    location: { name: 'Simulado' },
  };
}

// Para desactivar el simulador, simplemente no lo importes o usa un flag en mqttService.
