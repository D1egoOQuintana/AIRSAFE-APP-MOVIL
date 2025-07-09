// src/utils/airQuality.js
// Funciones para calcular y categorizar la calidad del aire según EPA

// Rangos de calidad del aire según EPA (ICA/AQI)
export const AIR_QUALITY_RANGES = {
  PM25: {
    BUENO: { min: 0, max: 12, color: '#22C55E', bgColor: '#DCFCE7', aqi: 50 },
    MODERADO: { min: 12.1, max: 35.4, color: '#EAB308', bgColor: '#FEF3C7', aqi: 100 },
    INSALUBRE_SENSIBLES: { min: 35.5, max: 55.4, color: '#F97316', bgColor: '#FED7AA', aqi: 150 },
    INSALUBRE: { min: 55.5, max: 150.4, color: '#EF4444', bgColor: '#FEE2E2', aqi: 200 },
    MUY_INSALUBRE: { min: 150.5, max: 250.4, color: '#8B5CF6', bgColor: '#F3E8FF', aqi: 300 },
    PELIGROSO: { min: 250.5, max: 999, color: '#7F1D1D', bgColor: '#FEF2F2', aqi: 500 }
  },
  PM10: {
    BUENO: { min: 0, max: 54, color: '#22C55E', bgColor: '#DCFCE7', aqi: 50 },
    MODERADO: { min: 55, max: 154, color: '#EAB308', bgColor: '#FEF3C7', aqi: 100 },
    INSALUBRE_SENSIBLES: { min: 155, max: 254, color: '#F97316', bgColor: '#FED7AA', aqi: 150 },
    INSALUBRE: { min: 255, max: 354, color: '#EF4444', bgColor: '#FEE2E2', aqi: 200 },
    MUY_INSALUBRE: { min: 355, max: 424, color: '#8B5CF6', bgColor: '#F3E8FF', aqi: 300 },
    PELIGROSO: { min: 425, max: 999, color: '#7F1D1D', bgColor: '#FEF2F2', aqi: 500 }
  }
};

// Íconos para cada tipo de calidad
export const AIR_QUALITY_ICONS = {
  BUENO: '😊',
  MODERADO: '😐',
  INSALUBRE_SENSIBLES: '😷',
  INSALUBRE: '🚨',
  MUY_INSALUBRE: '☠️',
  PELIGROSO: '💀'
};

// Descripción detallada de cada categoría
export const AIR_QUALITY_DESCRIPTIONS = {
  BUENO: 'Sin riesgo',
  MODERADO: 'Riesgo leve para sensibles',
  INSALUBRE_SENSIBLES: 'Riesgo para asmáticos, ancianos',
  INSALUBRE: 'Riesgo para todos',
  MUY_INSALUBRE: 'Riesgo severo',
  PELIGROSO: 'Riesgo grave para todos'
};

// Calcular calidad del aire para PM2.5
export function calculatePM25Quality(value) {
  if (value == null || isNaN(value)) return null;
  
  const numValue = parseFloat(value);
  
  if (numValue >= 0 && numValue <= 12) {
    return {
      category: 'BUENO',
      label: 'Buena',
      description: AIR_QUALITY_DESCRIPTIONS.BUENO,
      color: AIR_QUALITY_RANGES.PM25.BUENO.color,
      bgColor: AIR_QUALITY_RANGES.PM25.BUENO.bgColor,
      icon: AIR_QUALITY_ICONS.BUENO,
      value: numValue,
      aqi: Math.round((numValue / 12) * 50)
    };
  } else if (numValue > 12 && numValue <= 35.4) {
    return {
      category: 'MODERADO',
      label: 'Moderada',
      description: AIR_QUALITY_DESCRIPTIONS.MODERADO,
      color: AIR_QUALITY_RANGES.PM25.MODERADO.color,
      bgColor: AIR_QUALITY_RANGES.PM25.MODERADO.bgColor,
      icon: AIR_QUALITY_ICONS.MODERADO,
      value: numValue,
      aqi: Math.round(50 + ((numValue - 12) / (35.4 - 12)) * 50)
    };
  } else if (numValue > 35.4 && numValue <= 55.4) {
    return {
      category: 'INSALUBRE_SENSIBLES',
      label: 'Insalubre para sensibles',
      description: AIR_QUALITY_DESCRIPTIONS.INSALUBRE_SENSIBLES,
      color: AIR_QUALITY_RANGES.PM25.INSALUBRE_SENSIBLES.color,
      bgColor: AIR_QUALITY_RANGES.PM25.INSALUBRE_SENSIBLES.bgColor,
      icon: AIR_QUALITY_ICONS.INSALUBRE_SENSIBLES,
      value: numValue,
      aqi: Math.round(100 + ((numValue - 35.4) / (55.4 - 35.4)) * 50)
    };
  } else if (numValue > 55.4 && numValue <= 150.4) {
    return {
      category: 'INSALUBRE',
      label: 'Insalubre',
      description: AIR_QUALITY_DESCRIPTIONS.INSALUBRE,
      color: AIR_QUALITY_RANGES.PM25.INSALUBRE.color,
      bgColor: AIR_QUALITY_RANGES.PM25.INSALUBRE.bgColor,
      icon: AIR_QUALITY_ICONS.INSALUBRE,
      value: numValue,
      aqi: Math.round(150 + ((numValue - 55.4) / (150.4 - 55.4)) * 50)
    };
  } else if (numValue > 150.4 && numValue <= 250.4) {
    return {
      category: 'MUY_INSALUBRE',
      label: 'Muy insalubre',
      description: AIR_QUALITY_DESCRIPTIONS.MUY_INSALUBRE,
      color: AIR_QUALITY_RANGES.PM25.MUY_INSALUBRE.color,
      bgColor: AIR_QUALITY_RANGES.PM25.MUY_INSALUBRE.bgColor,
      icon: AIR_QUALITY_ICONS.MUY_INSALUBRE,
      value: numValue,
      aqi: Math.round(200 + ((numValue - 150.4) / (250.4 - 150.4)) * 100)
    };
  } else {
    return {
      category: 'PELIGROSO',
      label: 'Peligroso',
      description: AIR_QUALITY_DESCRIPTIONS.PELIGROSO,
      color: AIR_QUALITY_RANGES.PM25.PELIGROSO.color,
      bgColor: AIR_QUALITY_RANGES.PM25.PELIGROSO.bgColor,
      icon: AIR_QUALITY_ICONS.PELIGROSO,
      value: numValue,
      aqi: Math.round(300 + ((numValue - 250.4) / 249.6) * 200)
    };
  }
}

// Calcular calidad del aire para PM10
export function calculatePM10Quality(value) {
  if (value == null || isNaN(value)) return null;
  
  const numValue = parseFloat(value);
  
  if (numValue >= 0 && numValue <= 54) {
    return {
      category: 'BUENO',
      label: 'Buena',
      description: AIR_QUALITY_DESCRIPTIONS.BUENO,
      color: AIR_QUALITY_RANGES.PM10.BUENO.color,
      bgColor: AIR_QUALITY_RANGES.PM10.BUENO.bgColor,
      icon: AIR_QUALITY_ICONS.BUENO,
      value: numValue,
      aqi: Math.round((numValue / 54) * 50)
    };
  } else if (numValue > 54 && numValue <= 154) {
    return {
      category: 'MODERADO',
      label: 'Moderada',
      description: AIR_QUALITY_DESCRIPTIONS.MODERADO,
      color: AIR_QUALITY_RANGES.PM10.MODERADO.color,
      bgColor: AIR_QUALITY_RANGES.PM10.MODERADO.bgColor,
      icon: AIR_QUALITY_ICONS.MODERADO,
      value: numValue,
      aqi: Math.round(50 + ((numValue - 54) / (154 - 54)) * 50)
    };
  } else if (numValue > 154 && numValue <= 254) {
    return {
      category: 'INSALUBRE_SENSIBLES',
      label: 'Insalubre para sensibles',
      description: AIR_QUALITY_DESCRIPTIONS.INSALUBRE_SENSIBLES,
      color: AIR_QUALITY_RANGES.PM10.INSALUBRE_SENSIBLES.color,
      bgColor: AIR_QUALITY_RANGES.PM10.INSALUBRE_SENSIBLES.bgColor,
      icon: AIR_QUALITY_ICONS.INSALUBRE_SENSIBLES,
      value: numValue,
      aqi: Math.round(100 + ((numValue - 154) / (254 - 154)) * 50)
    };
  } else if (numValue > 254 && numValue <= 354) {
    return {
      category: 'INSALUBRE',
      label: 'Insalubre',
      description: AIR_QUALITY_DESCRIPTIONS.INSALUBRE,
      color: AIR_QUALITY_RANGES.PM10.INSALUBRE.color,
      bgColor: AIR_QUALITY_RANGES.PM10.INSALUBRE.bgColor,
      icon: AIR_QUALITY_ICONS.INSALUBRE,
      value: numValue,
      aqi: Math.round(150 + ((numValue - 254) / (354 - 254)) * 50)
    };
  } else if (numValue > 354 && numValue <= 424) {
    return {
      category: 'MUY_INSALUBRE',
      label: 'Muy insalubre',
      description: AIR_QUALITY_DESCRIPTIONS.MUY_INSALUBRE,
      color: AIR_QUALITY_RANGES.PM10.MUY_INSALUBRE.color,
      bgColor: AIR_QUALITY_RANGES.PM10.MUY_INSALUBRE.bgColor,
      icon: AIR_QUALITY_ICONS.MUY_INSALUBRE,
      value: numValue,
      aqi: Math.round(200 + ((numValue - 354) / (424 - 354)) * 100)
    };
  } else {
    return {
      category: 'PELIGROSO',
      label: 'Peligroso',
      description: AIR_QUALITY_DESCRIPTIONS.PELIGROSO,
      color: AIR_QUALITY_RANGES.PM10.PELIGROSO.color,
      bgColor: AIR_QUALITY_RANGES.PM10.PELIGROSO.bgColor,
      icon: AIR_QUALITY_ICONS.PELIGROSO,
      value: numValue,
      aqi: Math.round(300 + ((numValue - 424) / 575) * 200)
    };
  }
}

// Calcular calidad general del aire
export function calculateOverallAirQuality(pm25, pm10) {
  const pm25Quality = calculatePM25Quality(pm25);
  const pm10Quality = calculatePM10Quality(pm10);
  
  if (!pm25Quality && !pm10Quality) return null;
  
  // Usar la peor calidad entre PM2.5 y PM10
  const qualities = [pm25Quality, pm10Quality].filter(q => q !== null);
  
  if (qualities.length === 0) return null;
  
  // Orden de severidad: BUENO < MODERADO < INSALUBRE_SENSIBLES < INSALUBRE < MUY_INSALUBRE < PELIGROSO
  const severityOrder = ['BUENO', 'MODERADO', 'INSALUBRE_SENSIBLES', 'INSALUBRE', 'MUY_INSALUBRE', 'PELIGROSO'];
  
  let worstQuality = qualities[0];
  qualities.forEach(quality => {
    if (severityOrder.indexOf(quality.category) > severityOrder.indexOf(worstQuality.category)) {
      worstQuality = quality;
    }
  });
  
  // Calcular AQI combinado (usar el mayor)
  const combinedAQI = Math.max(
    pm25Quality ? pm25Quality.aqi : 0,
    pm10Quality ? pm10Quality.aqi : 0
  );
  
  return {
    ...worstQuality,
    aqi: combinedAQI,
    pm25: pm25Quality,
    pm10: pm10Quality
  };
}

// Formatear valor de sensor
export function formatSensorValue(value, unit = '') {
  if (value == null || isNaN(value)) {
    return '-- ' + unit;
  }
  
  const numValue = parseFloat(value);
  
  // Formatear con decimales apropiados
  if (numValue >= 100) {
    return Math.round(numValue).toString() + ' ' + unit;
  } else if (numValue >= 10) {
    return numValue.toFixed(1) + ' ' + unit;
  } else {
    return numValue.toFixed(2) + ' ' + unit;
  }
}

// Obtener color de temperatura
export function getTemperatureColor(temp) {
  if (temp == null || isNaN(temp)) return '#6B7280';
  
  const numTemp = parseFloat(temp);
  
  if (numTemp < 15) return '#60A5FA'; // Frío - Azul
  if (numTemp < 25) return '#22C55E'; // Templado - Verde
  if (numTemp < 35) return '#EAB308'; // Cálido - Amarillo
  return '#EF4444'; // Caliente - Rojo
}

// Obtener color de humedad
export function getHumidityColor(humidity) {
  if (humidity == null || isNaN(humidity)) return '#6B7280';
  
  const numHumidity = parseFloat(humidity);
  
  if (numHumidity < 30) return '#EF4444'; // Muy seco - Rojo
  if (numHumidity < 60) return '#22C55E'; // Ideal - Verde
  if (numHumidity < 80) return '#EAB308'; // Húmedo - Amarillo
  return '#F97316'; // Muy húmedo - Naranja
}

// Obtener color de señal WiFi
export function getWifiSignalColor(signal) {
  if (signal == null || isNaN(signal)) return '#6B7280';
  
  const numSignal = parseFloat(signal);
  
  if (numSignal > -50) return '#22C55E'; // Excelente - Verde
  if (numSignal > -70) return '#EAB308'; // Buena - Amarillo
  if (numSignal > -80) return '#F97316'; // Regular - Naranja
  return '#EF4444'; // Mala - Rojo
}

// Obtener icono de señal WiFi
export function getWifiSignalIcon(signal) {
  if (signal == null || isNaN(signal)) return '📶';
  
  const numSignal = parseFloat(signal);
  
  if (numSignal > -50) return '📶'; // Excelente
  if (numSignal > -70) return '📶'; // Buena
  if (numSignal > -80) return '📶'; // Regular
  return '📶'; // Mala
}

// Verificar si se debe enviar alerta
export function shouldSendAlert(pm25, pm10, previousPM25, previousPM10) {
  const currentQuality = calculateOverallAirQuality(pm25, pm10);
  const previousQuality = calculateOverallAirQuality(previousPM25, previousPM10);
  
  if (!currentQuality) return false;
  
  // Enviar alerta si:
  // 1. No había datos anteriores y la calidad es mala
  // 2. La calidad empeoró significativamente
  if (!previousQuality && ['INSALUBRE_SENSIBLES', 'INSALUBRE', 'MUY_INSALUBRE', 'PELIGROSO'].includes(currentQuality.category)) {
    return true;
  }
  
  if (previousQuality && currentQuality.category !== previousQuality.category) {
    const severityOrder = ['BUENO', 'MODERADO', 'INSALUBRE_SENSIBLES', 'INSALUBRE', 'MUY_INSALUBRE', 'PELIGROSO'];
    const currentSeverity = severityOrder.indexOf(currentQuality.category);
    const previousSeverity = severityOrder.indexOf(previousQuality.category);
    
    // Alerta si empeoró
    return currentSeverity > previousSeverity;
  }
  
  return false;
}

// Obtener recomendaciones basadas en calidad del aire
export function getAirQualityRecommendations(pm25, pm10) {
  const overallQuality = calculateOverallAirQuality(pm25, pm10);
  
  if (!overallQuality) return [];
  
  const recommendations = [];
  
  switch (overallQuality.category) {
    case 'BUENO':
      recommendations.push('✅ Excelente momento para actividades al aire libre');
      recommendations.push('🏃 Ideal para ejercicio exterior');
      recommendations.push('🌱 Ventila tu hogar para aire fresco');
      break;
      
    case 'MODERADO':
      recommendations.push('⚠️ Personas sensibles deben limitar actividades prolongadas');
      recommendations.push('🚶 Actividades moderadas al aire libre son aceptables');
      recommendations.push('🏠 Mantén ventanas cerradas si eres sensible');
      break;
      
    case 'INSALUBRE_SENSIBLES':
      recommendations.push('🚨 Grupos sensibles eviten actividades al aire libre');
      recommendations.push('😷 Considera usar mascarilla si debes salir');
      recommendations.push('🏠 Mantén ventanas cerradas');
      recommendations.push('🌡️ Usa purificador de aire si lo tienes');
      break;
      
    case 'INSALUBRE':
      recommendations.push('🚨 Evita actividades al aire libre');
      recommendations.push('😷 Usa mascarilla N95 si debes salir');
      recommendations.push('🏠 Permanece en interiores');
      recommendations.push('🌡️ Usa purificador de aire');
      recommendations.push('🏥 Consulta médico si tienes síntomas');
      break;
      
    case 'MUY_INSALUBRE':
      recommendations.push('🚨 ALERTA: Permanece en interiores');
      recommendations.push('😷 Usa mascarilla N95 obligatoriamente');
      recommendations.push('🏠 Sella ventanas y puertas');
      recommendations.push('🌡️ Usa purificador de aire en máxima potencia');
      recommendations.push('🏥 Evita ejercicio, consulta médico');
      recommendations.push('👶 Especial cuidado con niños y ancianos');
      break;
      
    case 'PELIGROSO':
      recommendations.push('🚨 EMERGENCIA: No salgas bajo ningún motivo');
      recommendations.push('😷 Mascarilla N95 + protección ocular');
      recommendations.push('🏠 Refugio hermético, aire acondicionado');
      recommendations.push('🌡️ Múltiples purificadores de aire');
      recommendations.push('🏥 Contacta servicios médicos si tienes síntomas');
      recommendations.push('👶 Evacúa niños y ancianos si es posible');
      recommendations.push('📞 Mantente alerta a evacuaciones');
      break;
  }
  
  return recommendations;
}
