// src/screens/dashboard/DashboardScreenPro.tsx
// Dashboard profesional con simulación de datos en tiempo real

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface AirQualityData {
  pm25: number;
  pm10: number;
  pm1: number;
  temperature: number;
  humidity: number;
  aqi: number;
  status: 'good' | 'moderate' | 'unhealthy' | 'dangerous';
  location: string;
  lastUpdate: string;
}

export default function DashboardScreenPro() {  const [data, setData] = useState<AirQualityData>({
    pm25: 15,
    pm10: 25,
    pm1: 8,
    temperature: 22,
    humidity: 65,
    aqi: 42,
    status: 'good',
    location: 'Centro de Lima',
    lastUpdate: new Date().toLocaleTimeString(),
  });
  
  const [refreshing, setRefreshing] = useState(false);
  
  const [userInfo] = useState({
    name: 'Usuario AirSafe',
    phone: '+51 987 654 321',
    role: 'Operador',
    lastLogin: '24/06/2025 14:30',
  });

  // Simulador de datos en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const newPM25 = Math.round(Math.random() * 50 + 10);
      const newPM10 = Math.round(Math.random() * 80 + 20);
      const newPM1 = Math.round(Math.random() * 30 + 5);
      const newTemp = Math.round((Math.random() * 15 + 15) * 10) / 10;
      const newHumidity = Math.round(Math.random() * 40 + 40);
      
      let status: 'good' | 'moderate' | 'unhealthy' | 'dangerous' = 'good';
      let aqi = newPM25 * 2;
      
      if (aqi > 100) status = 'dangerous';
      else if (aqi > 75) status = 'unhealthy';
      else if (aqi > 50) status = 'moderate';

      setData({
        pm25: newPM25,
        pm10: newPM10,
        pm1: newPM1,
        temperature: newTemp,        humidity: newHumidity,
        aqi,
        status,
        location: 'Centro de Lima',
        lastUpdate: new Date().toLocaleTimeString(),
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };
  const getStatusColor = (status: string): [string, string] => {
    switch (status) {
      case 'good': return ['#10B981', '#059669'];
      case 'moderate': return ['#F59E0B', '#D97706'];
      case 'unhealthy': return ['#EF4444', '#DC2626'];
      case 'dangerous': return ['#7C2D12', '#991B1B'];
      default: return ['#6B7280', '#4B5563'];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good': return 'Buena';
      case 'moderate': return 'Moderada';
      case 'unhealthy': return 'Dañina';
      case 'dangerous': return 'Peligrosa';
      default: return 'Sin datos';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return 'checkmark-circle';
      case 'moderate': return 'warning';
      case 'unhealthy': return 'alert-circle';
      case 'dangerous': return 'skull';
      default: return 'help-circle';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >      {/* Header */}
      <LinearGradient
        colors={['#1ABC9C', '#16A085']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>¡Hola, {userInfo.name}!</Text>
            <Text style={styles.location}>📍 {data.location}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.lastUpdate}>
          Última actualización: {data.lastUpdate}
        </Text>
      </LinearGradient>

      {/* Status Principal */}
      <View style={styles.mainStatusCard}>
        <LinearGradient
          colors={getStatusColor(data.status)}
          style={styles.statusGradient}
        >
          <View style={styles.statusContent}>
            <Ionicons 
              name={getStatusIcon(data.status)} 
              size={50} 
              color="#FFFFFF" 
            />
            <Text style={styles.statusTitle}>Calidad del Aire</Text>
            <Text style={styles.statusValue}>{getStatusText(data.status)}</Text>
            <Text style={styles.aqiValue}>AQI: {data.aqi}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Métricas principales */}
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Mediciones en Tiempo Real</Text>
        
        <View style={styles.metricsGrid}>
          <MetricCard
            title="PM2.5"
            value={data.pm25}
            unit="μg/m³"
            icon="radio-button-on"
            color="#E74C3C"
            description="Partículas finas"
          />
          <MetricCard
            title="PM10"
            value={data.pm10}
            unit="μg/m³"
            icon="radio-button-off"
            color="#F39C12"
            description="Partículas gruesas"
          />
          <MetricCard
            title="PM1.0"
            value={data.pm1}
            unit="μg/m³"
            icon="ellipse"
            color="#9B59B6"
            description="Partículas ultrafinas"
          />
          <MetricCard
            title="Temperatura"
            value={data.temperature}
            unit="°C"
            icon="thermometer"
            color="#3498DB"
            description="Ambiente actual"
          />
        </View>
      </View>

      {/* Información adicional */}
      <View style={styles.additionalInfo}>
        <Text style={styles.sectionTitle}>Condiciones Ambientales</Text>
        
        <View style={styles.environmentCard}>
          <View style={styles.environmentItem}>
            <Ionicons name="water" size={24} color="#3498DB" />
            <Text style={styles.environmentLabel}>Humedad</Text>
            <Text style={styles.environmentValue}>{data.humidity}%</Text>
          </View>
          
          <View style={styles.environmentDivider} />
          
          <View style={styles.environmentItem}>
            <Ionicons name="eye" size={24} color="#2ECC71" />
            <Text style={styles.environmentLabel}>Visibilidad</Text>
            <Text style={styles.environmentValue}>Buena</Text>
          </View>
          
          <View style={styles.environmentDivider} />
          
          <View style={styles.environmentItem}>
            <Ionicons name="leaf" size={24} color="#27AE60" />
            <Text style={styles.environmentLabel}>Tendencia</Text>
            <Text style={styles.environmentValue}>Estable</Text>
          </View>
        </View>
      </View>

      {/* Acciones rápidas */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        
        <View style={styles.actionsGrid}>
          <QuickActionButton
            title="Ver Historial"
            icon="analytics"
            color="#3498DB"
            onPress={() => {}}
          />
          <QuickActionButton
            title="Configurar Alertas"
            icon="notifications"
            color="#E74C3C"
            onPress={() => {}}
          />
          <QuickActionButton
            title="Exportar Datos"
            icon="download"
            color="#27AE60"
            onPress={() => {}}
          />
          <QuickActionButton
            title="Compartir Reporte"
            icon="share"
            color="#F39C12"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

// Componente para las tarjetas de métricas
function MetricCard({ title, value, unit, icon, color, description }: {
  title: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
  description: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricUnit}>{unit}</Text>
      <Text style={styles.metricDescription}>{description}</Text>
    </View>
  );
}

// Componente para botones de acción rápida
function QuickActionButton({ title, icon, color, onPress }: {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#E8F5E8',
    opacity: 0.9,
  },  profileButton: {
    padding: 5,
  },lastUpdate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  mainStatusCard: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statusGradient: {
    padding: 30,
    alignItems: 'center',
  },
  statusContent: {
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },  aqiValue: {
    fontSize: 16,
    color: '#E8F5E8',
    opacity: 0.9,
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    width: (width - 60) / 2,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  metricUnit: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 5,
  },  metricDescription: {
    fontSize: 11,
    color: '#95A5A6',
    textAlign: 'center',
  },
  additionalInfo: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  environmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  environmentItem: {
    alignItems: 'center',
    flex: 1,
  },
  environmentDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 10,
  },
  environmentLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 8,
    marginBottom: 4,
  },
  environmentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    width: (width - 60) / 2,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});
