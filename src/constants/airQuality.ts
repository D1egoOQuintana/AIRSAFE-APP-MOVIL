import { AirQualityLevel, AirQualityReading } from '../types';
import { COLORS } from './theme';

// Umbrales oficiales según EPA y OMS
export const AIR_QUALITY_THRESHOLDS = {
  PM25: {
    excellent: { min: 0, max: 12, aqi: { min: 0, max: 50 } },
    good: { min: 12.1, max: 35.4, aqi: { min: 51, max: 100 } },
    moderate: { min: 35.5, max: 55.4, aqi: { min: 101, max: 150 } },
    unhealthySensitive: { min: 55.5, max: 150.4, aqi: { min: 151, max: 200 } },
    unhealthy: { min: 150.5, max: 250.4, aqi: { min: 201, max: 300 } },
    veryUnhealthy: { min: 250.5, max: 350.4, aqi: { min: 301, max: 400 } },
    hazardous: { min: 350.5, max: 999, aqi: { min: 401, max: 500 } },
  },
  
  PM10: {
    excellent: { min: 0, max: 54, aqi: { min: 0, max: 50 } },
    good: { min: 55, max: 154, aqi: { min: 51, max: 100 } },
    moderate: { min: 155, max: 254, aqi: { min: 101, max: 150 } },
    unhealthySensitive: { min: 255, max: 354, aqi: { min: 151, max: 200 } },
    unhealthy: { min: 355, max: 424, aqi: { min: 201, max: 300 } },
    veryUnhealthy: { min: 425, max: 504, aqi: { min: 301, max: 400 } },
    hazardous: { min: 505, max: 999, aqi: { min: 401, max: 500 } },
  },
} as const;

export const AIR_QUALITY_LABELS = {
  excellent: 'Excelente',
  good: 'Bueno',
  moderate: 'Moderado',
  unhealthySensitive: 'No saludable para grupos sensibles',
  unhealthy: 'No saludable',
  veryUnhealthy: 'Muy no saludable',
  hazardous: 'Peligroso',
} as const;

export const AIR_QUALITY_DESCRIPTIONS = {
  excellent: 'La calidad del aire es ideal para todas las actividades al aire libre.',
  good: 'La calidad del aire es aceptable para la mayoría de personas.',
  moderate: 'Grupos sensibles pueden experimentar síntomas menores.',
  unhealthySensitive: 'Grupos sensibles pueden experimentar problemas de salud.',
  unhealthy: 'Todos pueden experimentar problemas de salud.',
  veryUnhealthy: 'Alerta de salud: todos pueden experimentar efectos más graves.',
  hazardous: 'Emergencia de salud: todos deben evitar actividades al aire libre.',
} as const;

export const HEALTH_RECOMMENDATIONS = {
  excellent: {
    general: ['Excelente día para todas las actividades al aire libre', 'Disfrute del aire limpio'],
    sensitive: ['Ideal para personas con sensibilidad respiratoria', 'Sin restricciones'],
    exercise: ['Perfecto para ejercicio al aire libre', 'Todas las actividades deportivas'],
  },
  good: {
    general: ['Buen día para actividades al aire libre', 'Calidad del aire aceptable'],
    sensitive: ['Aceptable para personas sensibles', 'Sin mayores restricciones'],
    exercise: ['Bueno para ejercicio moderado', 'Actividades al aire libre recomendadas'],
  },
  moderate: {
    general: ['Calidad del aire aceptable para la mayoría', 'Considere reducir tiempo prolongado al aire libre'],
    sensitive: ['Limite actividades prolongadas al aire libre', 'Monitoree síntomas'],
    exercise: ['Reduzca ejercicio intenso al aire libre', 'Prefiera actividades en interiores'],
  },
  unhealthySensitive: {
    general: ['Limite tiempo al aire libre si es sensible', 'Considere actividades en interiores'],
    sensitive: ['Evite actividades prolongadas al aire libre', 'Permanezca en interiores si es posible'],
    exercise: ['Evite ejercicio al aire libre', 'Actividades en interiores únicamente'],
  },
  unhealthy: {
    general: ['Limite todas las actividades al aire libre', 'Use mascarilla si debe salir'],
    sensitive: ['Permanezca en interiores', 'Evite cualquier actividad al aire libre'],
    exercise: ['No haga ejercicio al aire libre', 'Solo actividades en interiores'],
  },
  veryUnhealthy: {
    general: ['Evite salir al aire libre', 'Use purificadores de aire en casa'],
    sensitive: ['Emergencia para grupos sensibles', 'Busque espacios con aire filtrado'],
    exercise: ['Cancele todo ejercicio al aire libre', 'Solo ejercicio ligero en interiores'],
  },
  hazardous: {
    general: ['Emergencia de salud pública', 'Permanezca en interiores con ventanas cerradas'],
    sensitive: ['Situación de emergencia', 'Busque atención médica si presenta síntomas'],
    exercise: ['Prohibido cualquier ejercicio al aire libre', 'Evite esfuerzo físico'],
  },
} as const;

// Funciones utilitarias
export function calculateAQI(pm25: number, pm10: number): number {
  const pm25AQI = calculatePM25AQI(pm25);
  const pm10AQI = calculatePM10AQI(pm10);
  return Math.max(pm25AQI, pm10AQI);
}

export function calculatePM25AQI(pm25: number): number {
  const thresholds = AIR_QUALITY_THRESHOLDS.PM25;
  
  for (const [level, threshold] of Object.entries(thresholds)) {
    if (pm25 >= threshold.min && pm25 <= threshold.max) {
      return Math.round(
        ((threshold.aqi.max - threshold.aqi.min) / (threshold.max - threshold.min)) * 
        (pm25 - threshold.min) + threshold.aqi.min
      );
    }
  }
  return 500; // Valor máximo si excede todos los rangos
}

export function calculatePM10AQI(pm10: number): number {
  const thresholds = AIR_QUALITY_THRESHOLDS.PM10;
  
  for (const [level, threshold] of Object.entries(thresholds)) {
    if (pm10 >= threshold.min && pm10 <= threshold.max) {
      return Math.round(
        ((threshold.aqi.max - threshold.aqi.min) / (threshold.max - threshold.min)) * 
        (pm10 - threshold.min) + threshold.aqi.min
      );
    }
  }
  return 500;
}

export function getAirQualityLevel(pm25: number, pm10: number): AirQualityLevel {
  const aqi = calculateAQI(pm25, pm10);
  
  if (aqi <= 50) return 'excellent';
  if (aqi <= 100) return 'good';
  if (aqi <= 150) return 'moderate';
  if (aqi <= 200) return 'unhealthySensitive';
  if (aqi <= 300) return 'unhealthy';
  if (aqi <= 400) return 'veryUnhealthy';
  return 'hazardous';
}

export function getAirQualityReading(pm25: number, pm10: number, pm1?: number): AirQualityReading {
  const level = getAirQualityLevel(pm25, pm10);
  const aqi = calculateAQI(pm25, pm10);
  
  return {
    level,
    value: aqi,
    aqi,
    color: COLORS.airQuality[level],
    label: AIR_QUALITY_LABELS[level],
    description: AIR_QUALITY_DESCRIPTIONS[level],
    recommendations: [...HEALTH_RECOMMENDATIONS[level].general],
    healthEffects: getHealthEffects(level),
  };
}

function getHealthEffects(level: AirQualityLevel): string[] {
  const effects = {
    excellent: ['Sin efectos en la salud'],
    good: ['Efectos mínimos en la salud'],
    moderate: ['Síntomas leves en personas sensibles'],
    unhealthySensitive: ['Síntomas en grupos sensibles', 'Irritación respiratoria leve'],
    unhealthy: ['Síntomas en población general', 'Problemas respiratorios'],
    veryUnhealthy: ['Síntomas graves en todos', 'Problemas cardiovasculares'],
    hazardous: ['Efectos graves en la salud', 'Emergencia médica potencial'],
  };
  
  return effects[level];
}

// Constantes para notificaciones
export const NOTIFICATION_THRESHOLDS = {
  moderate: 101,
  unhealthySensitive: 151,
  unhealthy: 201,
  veryUnhealthy: 301,
  hazardous: 401,
} as const;