// src/screens/history/HistoryScreenPro.tsx
// Pantalla de historial con datos MQTT reales y gráficos

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mqttManager from '../../services/MqttManager';
import eventService from '../../services/eventService';
import { calculateOverallAirQuality } from '../../utils/airQuality';

const { width } = Dimensions.get('window');

interface HistoryDataPoint {
  timestamp: string;
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  aqi: number;
  status: string;
}

export default function HistoryScreenPro() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historyData, setHistoryData] = useState<HistoryDataPoint[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgPM25: 0,
    maxAQI: 0,
    healthyHours: 0,
    avgQuality: 'Buena'
  });

  useEffect(() => {
    loadHistoryData();
    loadRecentEvents();
    setupMQTTListener();
    
    // Generar eventos de muestra si no hay datos
    eventService.generateSampleEvents();
    
    return () => {
      mqttManager.removeAllListeners();
    };
  }, []);

  const loadRecentEvents = async () => {
    await eventService.loadEvents();
    const events = eventService.getRecentEvents(5);
    setRecentEvents(events);
  };

  const setupMQTTListener = () => {
    mqttManager.on('dataUpdate', handleNewData);
  };

  const handleNewData = async ({ sensorData }: { sensorData: any }) => {
    const airQuality = calculateOverallAirQuality(sensorData.pm25, sensorData.pm10);
    
    const newDataPoint: HistoryDataPoint = {
      timestamp: new Date().toISOString(),
      pm25: parseFloat(sensorData.pm25) || 0,
      pm10: parseFloat(sensorData.pm10) || 0,
      temperature: parseFloat(sensorData.temperature) || 0,
      humidity: parseFloat(sensorData.humidity) || 0,
      aqi: airQuality?.value || 0,
      status: airQuality?.label || 'Desconocido'
    };

    // Agregar a historial solo si hay cambios significativos o ha pasado tiempo suficiente
    setHistoryData(prevHistory => {
      const lastPoint = prevHistory[0];
      const now = new Date();
      const lastTime = lastPoint ? new Date(lastPoint.timestamp) : new Date(0);
      const timeDiff = (now.getTime() - lastTime.getTime()) / 1000 / 60; // minutos
      
      // Solo agregar si:
      // 1. No hay datos previos
      // 2. Han pasado al menos 2 minutos
      // 3. Hay cambio significativo en PM2.5 (±2 μg/m³)
      const shouldAdd = !lastPoint || 
                       timeDiff >= 2 || 
                       Math.abs(newDataPoint.pm25 - lastPoint.pm25) >= 2;
      
      if (shouldAdd) {
        const updatedHistory = [newDataPoint, ...prevHistory];
        // Mantener máximo 1000 puntos pero mínimo 3
        const finalHistory = updatedHistory.slice(0, Math.max(1000, 3));
        saveHistoryData(finalHistory);
        calculateStats(finalHistory);
        
        // Agregar evento al servicio de eventos
        eventService.addEvent(sensorData);
        loadRecentEvents(); // Actualizar eventos recientes
        
        return finalHistory;
      }
      
      // Si no se debe agregar, solo actualizar el último punto con timestamp más reciente
      if (lastPoint) {
        const updatedHistory = [...prevHistory];
        updatedHistory[0] = { ...updatedHistory[0], timestamp: newDataPoint.timestamp };
        return updatedHistory;
      }
      
      return prevHistory;
    });
  };

  const loadHistoryData = async () => {
    try {
      const stored = await AsyncStorage.getItem('@airsafe_history');
      if (stored) {
        const data = JSON.parse(stored);
        setHistoryData(data);
        calculateStats(data);
      } else {
        // Inicializar con datos por defecto si no hay historial
        const defaultData: HistoryDataPoint[] = [
          {
            timestamp: new Date(Date.now() - 120000).toISOString(), // -2 min
            pm25: 25,
            pm10: 40,
            temperature: 22,
            humidity: 45,
            aqi: 25,
            status: 'Buena'
          },
          {
            timestamp: new Date(Date.now() - 60000).toISOString(), // -1 min
            pm25: 30,
            pm10: 45,
            temperature: 23,
            humidity: 47,
            aqi: 30,
            status: 'Buena'
          },
          {
            timestamp: new Date().toISOString(), // ahora
            pm25: 35,
            pm10: 50,
            temperature: 24,
            humidity: 50,
            aqi: 35,
            status: 'Moderada'
          }
        ];
        setHistoryData(defaultData);
        await saveHistoryData(defaultData);
        calculateStats(defaultData);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const saveHistoryData = async (data: HistoryDataPoint[]) => {
    try {
      await AsyncStorage.setItem('@airsafe_history', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const calculateStats = (data: HistoryDataPoint[]) => {
    if (data.length === 0) return;

    const avgPM25 = data.reduce((sum, point) => sum + point.pm25, 0) / data.length;
    const maxAQI = Math.max(...data.map(point => point.aqi));
    const healthyHours = data.filter(point => point.aqi <= 50).length;
    const avgQuality = avgPM25 <= 35 ? 'Buena' : avgPM25 <= 75 ? 'Moderada' : 'Mala';

    setStats({
      avgPM25: Math.round(avgPM25),
      maxAQI,
      healthyHours,
      avgQuality
    });
  };

  const getFilteredData = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const month = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return historyData.filter(point => {
      const pointDate = new Date(point.timestamp);
      switch (selectedPeriod) {
        case 'today':
          return pointDate >= today;
        case 'week':
          return pointDate >= week;
        case 'month':
          return pointDate >= month;
        default:
          return true;
      }
    });
  };

  const getChartData = () => {
    const filteredData = getFilteredData();
    
    // Asegurar que siempre haya al menos 3 puntos para el gráfico
    if (filteredData.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          data: [0],
          strokeWidth: 2,
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`
        }]
      };
    }

    // Si hay menos de 3 puntos, usar todos los disponibles
    let chartPoints = filteredData;
    
    // Si hay más de 20 puntos, tomar una muestra representativa
    if (filteredData.length > 20) {
      const step = Math.max(1, Math.floor(filteredData.length / 20));
      chartPoints = filteredData.filter((_, index) => index % step === 0).slice(0, 20);
    }
    
    // Invertir para que el tiempo vaya de izquierda a derecha
    chartPoints = [...chartPoints].reverse();

    return {
      labels: chartPoints.map(point => 
        new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      ),
      datasets: [{
        data: chartPoints.map(point => point.pm25),
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`
      }]
    };
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadHistoryData();
    await loadRecentEvents();
    setIsRefreshing(false);
  };

  const periods = [
    { key: 'today', label: 'Hoy', icon: 'today' },
    { key: 'week', label: 'Semana', icon: 'calendar' },
    { key: 'month', label: 'Mes', icon: 'calendar-outline' },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#3498DB', '#2980B9']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Historial de Mediciones</Text>
        <Text style={styles.headerSubtitle}>
          Datos reales MQTT • {historyData.length} puntos guardados
        </Text>
      </LinearGradient>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Ionicons
              name={period.icon as any}
              size={18}
              color={selectedPeriod === period.key ? '#FFFFFF' : '#6B7280'}
            />
            <Text
              style={[
                styles.periodText,
                selectedPeriod === period.key && styles.periodTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Gráfico Real con React Native Chart Kit */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Gráfico PM2.5 (Tiempo Real)</Text>
        <View style={styles.chartCard}>
          {historyData.length > 0 ? (
            <LineChart
              data={getChartData()}
              width={width - 64}
              height={220}
              chartConfig={{
                backgroundColor: '#1e2923',
                backgroundGradientFrom: '#08130D',
                backgroundGradientTo: '#1e2923',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#ffa726"
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="analytics-outline" size={48} color="#9CA3AF" />
              <Text style={styles.noDataText}>Sin datos históricos</Text>
              <Text style={styles.noDataSubtext}>Los datos aparecerán cuando lleguen de MQTT</Text>
            </View>
          )}
        </View>
      </View>

      {/* Statistics Reales */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Estadísticas del Período</Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="Promedio PM2.5"
            value={stats.avgPM25.toString()}
            unit="μg/m³"
            icon="stats-chart"
            color="#3498DB"
            trend={historyData.length > 1 ? "Datos reales" : "Calculando..."}
            trendUp={stats.avgPM25 <= 35}
          />
          <StatCard
            title="Máximo AQI"
            value={stats.maxAQI.toString()}
            unit=""
            icon="trending-up"
            color={stats.maxAQI > 100 ? "#E74C3C" : "#27AE60"}
            trend={`${getFilteredData().length} mediciones`}
            trendUp={stats.maxAQI <= 50}
          />
          <StatCard
            title="Mediciones OK"
            value={stats.healthyHours.toString()}
            unit="puntos"
            icon="checkmark-circle"
            color="#2ECC71"
            trend={`${Math.round((stats.healthyHours/getFilteredData().length)*100)}%`}
            trendUp={true}
          />
          <StatCard
            title="Calidad Promedio"
            value={stats.avgQuality}
            unit=""
            icon="leaf"
            color="#27AE60"
            trend="En tiempo real"
            trendUp={true}
          />
        </View>
      </View>

      {/* Recent Events from Event Service */}
      <View style={styles.eventsContainer}>
        <Text style={styles.sectionTitle}>Eventos Recientes</Text>
        
        {recentEvents.length > 0 ? (
          recentEvents.map((event, index) => (
            <EventCard
              key={`event-${event.id}-${Date.now()}-${index}`}
              time={event.time}
              title={event.title}
              description={event.description}
              type={event.type as 'success' | 'warning' | 'info' | 'danger'}
            />
          ))
        ) : (
          <View style={styles.noEventsContainer}>
            <Ionicons name="time-outline" size={32} color="#9CA3AF" />
            <Text style={styles.noEventsText}>No hay eventos recientes</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

function StatCard({ title, value, unit, icon, color, trend, trendUp }: {
  title: string;
  value: string;
  unit: string;
  icon: string;
  color: string;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <View style={styles.statValueContainer}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
      </View>
      <View style={styles.statTrend}>
        <Ionicons
          name={trendUp ? 'trending-up' : 'trending-down'}
          size={12}
          color={trendUp ? '#2ECC71' : '#E74C3C'}
        />
        <Text style={[styles.statTrendText, { color: trendUp ? '#2ECC71' : '#E74C3C' }]}>
          {trend}
        </Text>
      </View>
    </View>
  );
}

function EventCard({ time, title, description, type }: {
  time: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'danger';
}) {
  const getEventColor = (type: string) => {
    switch (type) {
      case 'success': return '#2ECC71';
      case 'warning': return '#F39C12';
      case 'info': return '#3498DB';
      case 'danger': return '#E74C3C';
      default: return '#6B7280';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      case 'danger': return 'alert-circle';
      default: return 'ellipse';
    }
  };

  return (
    <View style={styles.eventCard}>
      <View style={[styles.eventIndicator, { backgroundColor: getEventColor(type) }]}>
        <Ionicons name={getEventIcon(type) as any} size={16} color="#FFFFFF" />
      </View>
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{title}</Text>
          <Text style={styles.eventTime}>{time}</Text>
        </View>
        <Text style={styles.eventDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  periodSelector: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  periodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  periodButtonActive: {
    backgroundColor: '#3498DB',
  },
  periodText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartPoint: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  chartValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statUnit: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  statTrendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  eventsContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  eventIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  eventTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 30,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 12,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noEventsText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
  },
});
