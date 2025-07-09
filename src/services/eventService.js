// src/services/eventService.js
// Servicio para gestionar eventos recientes únicos

import AsyncStorage from '@react-native-async-storage/async-storage';

class EventService {
  constructor() {
    this.events = [];
    this.loadEvents();
  }

  async loadEvents() {
    try {
      const stored = await AsyncStorage.getItem('@airsafe_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }

  async saveEvents() {
    try {
      await AsyncStorage.setItem('@airsafe_events', JSON.stringify(this.events));
    } catch (error) {
      console.error('Error saving events:', error);
    }
  }

  // Generar evento único basado en datos del sensor
  generateEvent(sensorData) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Generar ID único combinando timestamp y un número aleatorio
    const uniqueId = `${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determinar tipo de evento basado en los datos
    const pm25 = parseFloat(sensorData.pm25) || 0;
    const pm10 = parseFloat(sensorData.pm10) || 0;
    const temperature = parseFloat(sensorData.temperature) || 0;
    const humidity = parseFloat(sensorData.humidity) || 0;
    
    // Calcular AQI simple
    const aqi = Math.max(pm25 * 2, pm10 * 1.5);
    
    let event = {
      id: uniqueId,
      timestamp: now.toISOString(),
      time: timeString,
      type: 'info',
      title: '',
      description: '',
      data: sensorData
    };

    // Determinar el evento más relevante
    if (pm25 > 75) {
      event = {
        ...event,
        type: 'danger',
        title: `PM2.5 Muy Alto: ${pm25.toFixed(1)} μg/m³`,
        description: `Estado: Insalubre • AQI: ${Math.round(aqi)}`
      };
    } else if (pm25 > 35) {
      event = {
        ...event,
        type: 'warning',
        title: `PM2.5 Alto: ${pm25.toFixed(1)} μg/m³`,
        description: `Estado: Insalubre para sensibles • AQI: ${Math.round(aqi)}`
      };
    } else if (pm10 > 50) {
      event = {
        ...event,
        type: 'warning',
        title: `PM10 Elevado: ${pm10.toFixed(1)} μg/m³`,
        description: `Estado: Moderada • AQI: ${Math.round(aqi)}`
      };
    } else if (temperature > 30) {
      event = {
        ...event,
        type: 'warning',
        title: `Temperatura Alta: ${temperature.toFixed(1)}°C`,
        description: `Condición: Calurosa • Humedad: ${humidity.toFixed(1)}%`
      };
    } else if (temperature < 10) {
      event = {
        ...event,
        type: 'info',
        title: `Temperatura Baja: ${temperature.toFixed(1)}°C`,
        description: `Condición: Fría • Humedad: ${humidity.toFixed(1)}%`
      };
    } else if (humidity > 70) {
      event = {
        ...event,
        type: 'info',
        title: `Humedad Alta: ${humidity.toFixed(1)}%`,
        description: `Condición: Húmeda • Temperatura: ${temperature.toFixed(1)}°C`
      };
    } else {
      event = {
        ...event,
        type: 'success',
        title: `Calidad Buena: PM2.5 ${pm25.toFixed(1)} μg/m³`,
        description: `Estado: Saludable • AQI: ${Math.round(aqi)}`
      };
    }

    return event;
  }

  // Agregar evento único
  addEvent(sensorData) {
    const newEvent = this.generateEvent(sensorData);
    
    // Verificar si ya existe un evento similar reciente (últimos 5 minutos)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const recentSimilar = this.events.find(event => 
      new Date(event.timestamp).getTime() > fiveMinutesAgo &&
      event.title.includes(newEvent.title.split(':')[0]) // Mismo tipo de evento
    );

    if (!recentSimilar) {
      // Agregar nuevo evento al principio
      this.events.unshift(newEvent);
      
      // Mantener solo los últimos 20 eventos
      this.events = this.events.slice(0, 20);
      
      this.saveEvents();
    }
  }

  // Obtener eventos recientes
  getRecentEvents(count = 5) {
    return this.events.slice(0, count);
  }

  // Obtener eventos del día
  getTodayEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.events.filter(event => 
      new Date(event.timestamp) >= today
    );
  }

  // Limpiar eventos antiguos (más de 24 horas)
  cleanOldEvents() {
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.events = this.events.filter(event => 
      new Date(event.timestamp).getTime() > dayAgo
    );
    this.saveEvents();
  }

  // Generar eventos de muestra si no hay datos
  generateSampleEvents() {
    const now = new Date();
    const sampleEvents = [
      {
        id: `sample-${now.getTime()}-1`,
        timestamp: new Date(now.getTime() - 60000).toISOString(),
        time: new Date(now.getTime() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'warning',
        title: 'PM2.5 Alto: 45.2 μg/m³',
        description: 'Estado: Insalubre para sensibles • AQI: 90'
      },
      {
        id: `sample-${now.getTime()}-2`,
        timestamp: new Date(now.getTime() - 300000).toISOString(),
        time: new Date(now.getTime() - 300000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'success',
        title: 'Calidad Mejorada: PM2.5 22.1 μg/m³',
        description: 'Estado: Saludable • AQI: 44'
      },
      {
        id: `sample-${now.getTime()}-3`,
        timestamp: new Date(now.getTime() - 600000).toISOString(),
        time: new Date(now.getTime() - 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'info',
        title: 'Temperatura: 24.5°C',
        description: 'Condición: Ideal • Humedad: 52%'
      },
      {
        id: `sample-${now.getTime()}-4`,
        timestamp: new Date(now.getTime() - 900000).toISOString(),
        time: new Date(now.getTime() - 900000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'warning',
        title: 'PM10 Elevado: 65.8 μg/m³',
        description: 'Estado: Moderada • AQI: 98'
      },
      {
        id: `sample-${now.getTime()}-5`,
        timestamp: new Date(now.getTime() - 1200000).toISOString(),
        time: new Date(now.getTime() - 1200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'success',
        title: 'Sistema iniciado',
        description: 'Todos los sensores funcionando correctamente'
      }
    ];

    if (this.events.length < 3) {
      this.events = sampleEvents;
      this.saveEvents();
    }
  }
}

export default new EventService();
