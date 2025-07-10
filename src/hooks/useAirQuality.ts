// src/hooks/useAirQuality.ts
// Hook para obtener y calcular datos de calidad del aire desde MQTT

import { useState, useEffect, useCallback } from 'react';
import { getAirQualityReading } from '../constants/airQuality';
import { AirQualityReading } from '../types';
import mqttManager from '../services/MqttManager';

export function useAirQuality() {
  const [reading, setReading] = useState<AirQualityReading | null>(null);
  const [rawData, setRawData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Actualizar lectura manualmente
  const updateReading = useCallback((pm25: number, pm10: number, pm1?: number) => {
    const result = getAirQualityReading(pm25, pm10, pm1);
    setReading(result);
  }, []);

  // Actualizar desde datos MQTT
  const updateFromMqttData = useCallback((data: any) => {
    if (data.pm25 && data.pm10) {
      const pm25 = parseFloat(data.pm25);
      const pm10 = parseFloat(data.pm10);
      const pm1 = data.pm1 ? parseFloat(data.pm1) : undefined;
      
      if (!isNaN(pm25) && !isNaN(pm10)) {
        const result = getAirQualityReading(pm25, pm10, pm1);
        setReading(result);
        setRawData(data);
      }
    }
  }, []);

  useEffect(() => {
    // Cargar datos iniciales desde el storage
    mqttManager.loadDataFromStorage();
    
    // Listener para nuevos datos
    const handleDataUpdate = (data: any) => {
      updateFromMqttData(data.sensorData);
    };

    // Listener para conexión
    const handleConnected = () => {
      setIsConnected(true);
      console.log('✅ useAirQuality: Conectado a MQTT');
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      console.log('❌ useAirQuality: Desconectado de MQTT');
    };

    // Suscribirse a eventos
    mqttManager.on('dataUpdate', handleDataUpdate);
    mqttManager.on('connected', handleConnected);
    mqttManager.on('disconnected', handleDisconnected);
    mqttManager.on('connectionLost', handleDisconnected);

    // Obtener datos actuales si existen
    const currentData = mqttManager.getCurrentData();
    if (currentData) {
      updateFromMqttData(currentData);
    }

    // Cleanup
    return () => {
      mqttManager.removeAllListeners();
    };
  }, [updateFromMqttData]);

  return { 
    reading, 
    rawData, 
    isConnected, 
    updateReading,
    updateFromMqttData 
  };
}
