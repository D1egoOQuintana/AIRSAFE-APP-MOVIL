// src/hooks/useAirQuality.ts
// Hook para obtener y calcular datos de calidad del aire

import { useState, useCallback } from 'react';
import { getAirQualityReading } from '../constants/airQuality';
import { AirQualityReading } from '../types';

export function useAirQuality() {
  const [reading, setReading] = useState<AirQualityReading | null>(null);

  const updateReading = useCallback((pm25: number, pm10: number, pm1?: number) => {
    const result = getAirQualityReading(pm25, pm10, pm1);
    setReading(result);
  }, []);

  return { reading, updateReading };
}
