// src/screens/history/HistoryScreenPro.tsx
// Pantalla de historial con gráficos y análisis

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HistoryScreenPro() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // Datos simulados de historial
  const historyData = {
    today: [
      { time: '08:00', pm25: 15, aqi: 30 },
      { time: '10:00', pm25: 18, aqi: 36 },
      { time: '12:00', pm25: 22, aqi: 44 },
      { time: '14:00', pm25: 28, aqi: 56 },
      { time: '16:00', pm25: 25, aqi: 50 },
      { time: '18:00', pm25: 20, aqi: 40 },
    ],
    week: [
      { time: 'Lun', pm25: 18, aqi: 36 },
      { time: 'Mar', pm25: 22, aqi: 44 },
      { time: 'Mié', pm25: 25, aqi: 50 },
      { time: 'Jue', pm25: 20, aqi: 40 },
      { time: 'Vie', pm25: 28, aqi: 56 },
      { time: 'Sáb', pm25: 15, aqi: 30 },
      { time: 'Dom', pm25: 12, aqi: 24 },
    ],
  };

  const periods = [
    { key: 'today', label: 'Hoy', icon: 'today' },
    { key: 'week', label: 'Semana', icon: 'calendar' },
    { key: 'month', label: 'Mes', icon: 'calendar-outline' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3498DB', '#2980B9']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Historial de Mediciones</Text>
        <Text style={styles.headerSubtitle}>
          Análisis y tendencias de calidad del aire
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

      {/* Chart Simulation */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Gráfico PM2.5</Text>
        <View style={styles.chartCard}>
          <View style={styles.chart}>
            {(historyData[selectedPeriod as keyof typeof historyData] || historyData.today).map((point, index) => (
              <View key={index} style={styles.chartPoint}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: (point.pm25 / 30) * 100,
                      backgroundColor: point.pm25 > 25 ? '#E74C3C' : point.pm25 > 15 ? '#F39C12' : '#2ECC71',
                    },
                  ]}
                />
                <Text style={styles.chartLabel}>{point.time}</Text>
                <Text style={styles.chartValue}>{point.pm25}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Estadísticas del Período</Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="Promedio PM2.5"
            value="21"
            unit="μg/m³"
            icon="stats-chart"
            color="#3498DB"
            trend="+5%"
            trendUp={false}
          />
          <StatCard
            title="Máximo AQI"
            value="56"
            unit=""
            icon="trending-up"
            color="#E74C3C"
            trend="+12%"
            trendUp={false}
          />
          <StatCard
            title="Horas Saludables"
            value="18"
            unit="hrs"
            icon="checkmark-circle"
            color="#2ECC71"
            trend="+3h"
            trendUp={true}
          />
          <StatCard
            title="Calidad Promedio"
            value="Buena"
            unit=""
            icon="leaf"
            color="#27AE60"
            trend="Estable"
            trendUp={true}
          />
        </View>
      </View>

      {/* Historical Events */}
      <View style={styles.eventsContainer}>
        <Text style={styles.sectionTitle}>Eventos Destacados</Text>
        
        <EventCard
          time="14:30"
          title="Pico de contaminación"
          description="PM2.5 alcanzó 28 μg/m³"
          type="warning"
        />
        <EventCard
          time="08:00"
          title="Calidad óptima"
          description="Mejor calidad de aire del día"
          type="success"
        />
        <EventCard
          time="16:45"
          title="Alerta configurada"
          description="Se activó notificación por umbral"
          type="info"
        />
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
  type: 'success' | 'warning' | 'info';
}) {
  const getEventColor = (type: string) => {
    switch (type) {
      case 'success': return '#2ECC71';
      case 'warning': return '#F39C12';
      case 'info': return '#3498DB';
      default: return '#6B7280';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
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
});
