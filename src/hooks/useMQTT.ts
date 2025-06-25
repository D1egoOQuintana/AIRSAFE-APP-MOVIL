// src/hooks/useMQTT.ts
// Hook personalizado para conexión y suscripción MQTT (con soporte de simulador)

import { useEffect, useRef } from 'react';
import { mqttService } from '../services/mqttService';
import { generateSimulatedData } from '../utils/dataSimulator';

interface UseMQTTOptions {
  deviceId: string;
  onData: (data: any) => void;
  useSimulator?: boolean;
}

export function useMQTT({ deviceId, onData, useSimulator = true }: UseMQTTOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (useSimulator) {
      // Simula datos cada 5 segundos
      intervalRef.current = setInterval(() => {
        const data = generateSimulatedData(deviceId);
        onData(data);
      }, 5000);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
    // Conexión real
    mqttService.connect();
    mqttService.subscribe(`airsafe/${deviceId}/air_quality`, onData);
    return () => mqttService.disconnect();
  }, [deviceId, onData, useSimulator]);
}
