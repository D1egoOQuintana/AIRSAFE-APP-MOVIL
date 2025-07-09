// src/screens/dashboard/DashboardScreenPro.tsx
// Dashboard principal con datos MQTT en tiempo real

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import SensorCard from '../../components/SensorCard';
import mqttManager from '../../services/MqttManager';
import alertService from '../../services/alertService';
import notificationService from '../../services/notificationService';
import {
  calculateOverallAirQuality,
  calculatePM25Quality,
  calculatePM10Quality,
  getTemperatureColor,
  getHumidityColor,
  getWifiSignalColor,
  getAirQualityRecommendations,
  formatSensorValue,
} from '../../utils/airQuality';

const { width } = Dimensions.get('window');

export default function DashboardScreenPro() {
  const [sensorData, setSensorData] = useState<any>({
    pm25: null,
    pm10: null,
    temperature: null,
    humidity: null,
    wifi_signal: null,
    air_quality: null,
    status: null,
    lastUpdate: null,
  });
  
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    connectionAttempts: 0,
    maxReconnectAttempts: 5,
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartData, setChartData] = useState<{
    pm25: number[];
    pm10: number[];
    temperature: number[];
    timestamps: string[];
  }>({
    pm25: [],
    pm10: [],
    temperature: [],
    timestamps: [],
  });
  
  const previousDataRef = useRef<any>(null);
  const chartUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeMQTT();
    setupNotificationListeners();
    
    return () => {
      cleanupMQTT();
      if (chartUpdateIntervalRef.current) {
        clearInterval(chartUpdateIntervalRef.current);
      }
    };
  }, []);

  const initializeMQTT = async () => {
    try {
      console.log('🔄 Inicializando MQTT...');
      
      // Conectar servicio de alertas con MQTT Manager
      mqttManager.setAlertService(alertService);
      
      // Cargar datos previos
      await mqttManager.loadDataFromStorage();
      
      // Configurar listeners
      mqttManager.on('connected', handleMQTTConnected);
      mqttManager.on('disconnected', handleMQTTDisconnected);
      mqttManager.on('connectionFailed', handleMQTTConnectionFailed);
      mqttManager.on('connectionLost', handleMQTTConnectionLost);
      mqttManager.on('dataUpdate', handleDataUpdate);
      mqttManager.on('dataLoaded', handleDataLoaded);
      mqttManager.on('error', handleMQTTError);
      
      // Conectar
      await mqttManager.connect();
      
      // Configurar actualización de gráficos
      chartUpdateIntervalRef.current = setInterval(updateChartData, 30000); // Cada 30 segundos
      
    } catch (error) {
      console.error('❌ Error inicializando MQTT:', error);
      Alert.alert('Error', 'No se pudo conectar a los sensores');
    }
  };

  const cleanupMQTT = () => {
    mqttManager.removeAllListeners();
    mqttManager.disconnect();
  };

  const setupNotificationListeners = () => {
    // Configurar listeners para notificaciones
    notificationService.addNotificationListener((notification: any) => {
      console.log('📱 Notificación recibida:', notification);
    });

    notificationService.addNotificationResponseListener((response: any) => {
      console.log('👆 Notificación tocada:', response);
    });
  };

  const handleMQTTConnected = () => {
    console.log('✅ MQTT conectado');
    setConnectionStatus({
      isConnected: true,
      connectionAttempts: 0,
      maxReconnectAttempts: 5,
    });
    notificationService.sendConnectionAlert(true);
  };

  const handleMQTTDisconnected = () => {
    console.log('⚠️ MQTT desconectado');
    setConnectionStatus(prev => ({ ...prev, isConnected: false }));
  };

  const handleMQTTConnectionFailed = (error: any) => {
    console.error('❌ Error de conexión MQTT:', error);
    const status = mqttManager.getConnectionStatus();
    setConnectionStatus(status);
    
    if (status.connectionAttempts >= status.maxReconnectAttempts) {
      Alert.alert(
        'Error de Conexión',
        'No se pudo conectar a los sensores. Verifica tu conexión a internet.',
        [
          { text: 'Reintentar', onPress: handleManualReconnect },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    }
  };

  const handleMQTTConnectionLost = (error: any) => {
    console.warn('⚠️ Conexión MQTT perdida:', error);
    setConnectionStatus(prev => ({ ...prev, isConnected: false }));
    notificationService.sendConnectionAlert(false);
  };

  const handleDataUpdate = ({ sensorData: newData }: { sensorData: any }) => {
    console.log('📊 Datos actualizados:', newData);
    
    // Verificar alertas
    if (previousDataRef.current) {
      notificationService.checkAndSendAirQualityAlert(
        newData,
        previousDataRef.current
      );
    }
    
    // Actualizar datos
    previousDataRef.current = sensorData;
    setSensorData(newData);
    
    // Actualizar gráficos
    updateChartData(newData);
  };

  const handleDataLoaded = (data: any) => {
    console.log('📂 Datos cargados desde storage:', data);
    setSensorData(data);
  };

  const handleMQTTError = (error: any) => {
    console.error('❌ Error MQTT:', error);
    Alert.alert('Error', 'Error en la conexión con los sensores');
  };

  const updateChartData = (newData = sensorData) => {
    const now = new Date();
    const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setChartData(prev => {
      const maxDataPoints = 12; // Últimas 6 horas (cada 30 min)
      
      const newChartData = {
        pm25: [...prev.pm25, parseFloat(newData.pm25 || '0') || 0].slice(-maxDataPoints),
        pm10: [...prev.pm10, parseFloat(newData.pm10 || '0') || 0].slice(-maxDataPoints),
        temperature: [...prev.temperature, parseFloat(newData.temperature || '0') || 0].slice(-maxDataPoints),
        timestamps: [...prev.timestamps, timeLabel].slice(-maxDataPoints),
      };
      
      return newChartData;
    });
  };

  const handleSensorCardPress = (sensorType: string) => {
    Alert.alert(
      `Sensor ${sensorType}`,
      `Ver detalles del sensor ${sensorType}`,
      [
        { text: 'Ver Historial', onPress: () => console.log(`Historial ${sensorType}`) },
        { text: 'Configurar', onPress: () => console.log(`Configurar ${sensorType}`) },
        { text: 'Cerrar', style: 'cancel' },
      ]
    );
  };

  const handleManualReconnect = async () => {
    try {
      setIsRefreshing(true);
      await mqttManager.reconnect();
    } catch (error) {
      console.error('❌ Error en reconexión manual:', error);
      Alert.alert('Error', 'No se pudo reconectar');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await handleManualReconnect();
  };

  const renderConnectionStatus = () => {
    const { isConnected, connectionAttempts, maxReconnectAttempts } = connectionStatus;
    
    return (
      <View style={styles.connectionStatus}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#22C55E' : '#EF4444' }]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </Text>
          {!isConnected && connectionAttempts > 0 && (
            <Text style={styles.attemptsText}>
              ({connectionAttempts}/{maxReconnectAttempts})
            </Text>
          )}
        </View>
        
        {!isConnected && (
          <TouchableOpacity style={styles.reconnectButton} onPress={handleManualReconnect}>
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.reconnectButtonText}>Reconectar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderMainAirQualityCard = () => {
    const overallQuality = calculateOverallAirQuality(sensorData.pm25, sensorData.pm10);
    
    if (!overallQuality) {
      return (
        <View style={styles.mainCard}>
          <Text style={styles.mainCardTitle}>Calidad del Aire</Text>
          <Text style={styles.noDataText}>Sin datos disponibles</Text>
        </View>
      );
    }
    
    return (
      <LinearGradient
        colors={[overallQuality.bgColor, overallQuality.bgColor + '80']}
        style={styles.mainCard}
      >
        <View style={styles.mainCardHeader}>
          <Text style={styles.mainCardTitle}>Calidad del Aire</Text>
          <Text style={styles.mainCardIcon}>{overallQuality.icon}</Text>
        </View>
        
        <View style={styles.mainCardContent}>
          <Text style={[styles.mainCardLabel, { color: overallQuality.color }]}>
            {overallQuality.label}
          </Text>
          <Text style={styles.mainCardDescription}>
            {overallQuality.description}
          </Text>
        </View>
        
        <View style={styles.mainCardValues}>
          <View style={styles.valueItem}>
            <Text style={styles.valueLabel}>PM2.5</Text>
            <Text style={[styles.valueText, { color: overallQuality.color }]}>
              {formatSensorValue(sensorData.pm25, 'μg/m³')}
            </Text>
          </View>
          <View style={styles.valueItem}>
            <Text style={styles.valueLabel}>PM10</Text>
            <Text style={[styles.valueText, { color: overallQuality.color }]}>
              {formatSensorValue(sensorData.pm10, 'μg/m³')}
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderSensorCards = () => {
    const pm25Quality = calculatePM25Quality(sensorData.pm25);
    const pm10Quality = calculatePM10Quality(sensorData.pm10);
    const overallQuality = calculateOverallAirQuality(sensorData.pm25, sensorData.pm10);
    
    return (
      <View style={styles.sensorGrid}>
        <SensorCard
          title="PM2.5"
          value={sensorData.pm25}
          unit="μg/m³"
          icon="💨"
          color={pm25Quality?.color || '#6B7280'}
          bgColor={pm25Quality?.bgColor || '#F3F4F6'}
          description={pm25Quality?.description || 'Sin datos'}
          isConnected={connectionStatus.isConnected}
          lastUpdate={sensorData.lastUpdate}
          onPress={() => handleSensorCardPress('PM2.5')}
        />
        
        <SensorCard
          title="PM10"
          value={sensorData.pm10}
          unit="μg/m³"
          icon="🌫️"
          color={pm10Quality?.color || '#6B7280'}
          bgColor={pm10Quality?.bgColor || '#F3F4F6'}
          description={pm10Quality?.description || 'Sin datos'}
          isConnected={connectionStatus.isConnected}
          lastUpdate={sensorData.lastUpdate}
          onPress={() => handleSensorCardPress('PM10')}
        />
        
        <SensorCard
          title="ICA/AQI"
          value={overallQuality?.aqi || '--'}
          unit=""
          icon={overallQuality?.icon || '📊'}
          color={overallQuality?.color || '#6B7280'}
          bgColor={overallQuality?.bgColor || '#F3F4F6'}
          description={overallQuality?.label || 'Sin datos'}
          isConnected={connectionStatus.isConnected}
          lastUpdate={sensorData.lastUpdate}
          onPress={() => handleSensorCardPress('AQI')}
        />
        
        <SensorCard
          title="Humedad"
          value={sensorData.humidity}
          unit="%"
          icon="💧"
          color={getHumidityColor(sensorData.humidity)}
          bgColor={getHumidityColor(sensorData.humidity) + '20'}
          description="Humedad relativa"
          isConnected={connectionStatus.isConnected}
          lastUpdate={sensorData.lastUpdate}
          onPress={() => handleSensorCardPress('Humedad')}
        />
        
        <SensorCard
          title="Señal WiFi"
          value={sensorData.wifi_signal}
          unit="dBm"
          icon="📶"
          color={getWifiSignalColor(sensorData.wifi_signal)}
          bgColor={getWifiSignalColor(sensorData.wifi_signal) + '20'}
          description="Intensidad de señal"
          isConnected={connectionStatus.isConnected}
          lastUpdate={sensorData.lastUpdate}
          onPress={() => handleSensorCardPress('WiFi')}
        />
        
        <SensorCard
          title="Estado"
          value={sensorData.status || 'Desconocido'}
          unit=""
          icon="⚡"
          color={sensorData.status === 'online' ? '#22C55E' : '#EF4444'}
          bgColor={sensorData.status === 'online' ? '#22C55E20' : '#EF444420'}
          description="Estado del sensor"
          isConnected={connectionStatus.isConnected}
          lastUpdate={sensorData.lastUpdate}
          onPress={() => handleSensorCardPress('Estado')}
        />
      </View>
    );
  };

  const renderChart = () => {
    if (chartData.timestamps.length < 2) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Tendencia (últimas 6 horas)</Text>
          <View style={styles.noChartData}>
            <Text style={styles.noDataText}>Recopilando datos...</Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tendencia PM2.5 (últimas 6 horas)</Text>
        <LineChart
          data={{
            labels: chartData.timestamps,
            datasets: [
              {
                data: chartData.pm25,
                color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          }}
          width={width - 32}
          height={180}
          yAxisSuffix="μg/m³"
          chartConfig={{
            backgroundColor: '#FFFFFF',
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#22C55E',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderRecommendations = () => {
    const recommendations = getAirQualityRecommendations(sensorData.pm25, sensorData.pm10);
    
    if (recommendations.length === 0) return null;
    
    return (
      <View style={styles.recommendationsContainer}>
        <Text style={styles.recommendationsTitle}>Recomendaciones</Text>
        {recommendations.map((recommendation, index) => (
          <View key={`recommendation-${Date.now()}-${index}-${recommendation.slice(0, 20).replace(/\s/g, '')}`} style={styles.recommendationItem}>
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderEPAScale = () => {
    const scaleData = [
      { category: 'Buena', pm25: '0-12', pm10: '0-54', color: '#22C55E', description: 'Sin riesgo' },
      { category: 'Moderada', pm25: '12.1-35.4', pm10: '55-154', color: '#EAB308', description: 'Riesgo leve para sensibles' },
      { category: 'Insalubre para sensibles', pm25: '35.5-55.4', pm10: '155-254', color: '#F97316', description: 'Riesgo para asmáticos, ancianos' },
      { category: 'Insalubre', pm25: '55.5-150.4', pm10: '255-354', color: '#EF4444', description: 'Riesgo para todos' },
      { category: 'Muy insalubre', pm25: '150.5-250.4', pm10: '355-424', color: '#8B5CF6', description: 'Riesgo severo' },
      { category: 'Peligroso', pm25: '>250.5', pm10: '>425', color: '#7F1D1D', description: 'Riesgo grave para todos' }
    ];

    return (
      <View style={styles.epaScaleContainer}>
        <Text style={styles.epaScaleTitle}>📊 Escala del Índice de Calidad del Aire (ICA / AQI)</Text>
        <Text style={styles.epaScaleSubtitle}>Basado en la EPA de EE. UU.</Text>
        
        <View style={styles.epaScaleTable}>
          {scaleData.map((item, index) => (
            <View key={`epa-scale-${item.category.replace(/\s+/g, '-')}-${Date.now()}-${index}`} style={styles.epaScaleRow}>
              <View style={[styles.epaScaleColorDot, { backgroundColor: item.color }]} />
              <View style={styles.epaScaleContent}>
                <Text style={styles.epaScaleCategory}>{item.category}</Text>
                <Text style={styles.epaScaleDescription}>{item.description}</Text>
                <View style={styles.epaScaleValues}>
                  <Text style={styles.epaScaleValue}>PM2.5: {item.pm25} μg/m³</Text>
                  <Text style={styles.epaScaleValue}>PM10: {item.pm10} μg/m³</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#1ABC9C']}
            tintColor="#1ABC9C"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>AirSafe Dashboard</Text>
            <Text style={styles.headerSubtitle}>Centro de Lima • Datos en tiempo real</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        {/* Connection Status */}
        {renderConnectionStatus()}
        
        {/* Debug/Test Section - Solo para desarrollo */}
        <View style={styles.debugContainer}>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => {
              // Test notification
              notificationService.sendCustomAlert(
                '🧪 Prueba de Notificación',
                'Esta es una notificación de prueba desde la app web',
                { type: 'test' }
              );
            }}
          >
            <Ionicons name="flask" size={16} color="#FFFFFF" />
            <Text style={styles.testButtonText}>Probar Notificación</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => {
              // Test MQTT publish
              mqttManager.publish('d1ego/airsafe/test', JSON.stringify({
                test: true,
                timestamp: new Date().toISOString(),
                message: 'Test desde app web'
              }));
              Alert.alert('✅ Test', 'Mensaje de prueba enviado a MQTT');
            }}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
            <Text style={styles.testButtonText}>Test MQTT</Text>
          </TouchableOpacity>
        </View>
        
        {/* Main Air Quality Card */}
        {renderMainAirQualityCard()}
        
        {/* Sensor Cards */}
        {renderSensorCards()}
        
        {/* Chart */}
        {renderChart()}
        
        {/* Recommendations */}
        {renderRecommendations()}
        
        {/* EPA Scale Information */}
        {renderEPAScale()}
        
        {/* Last Update */}
        {sensorData.lastUpdate && (
          <View style={styles.lastUpdateContainer}>
            <Ionicons name="time" size={16} color="#6B7280" />
            <Text style={styles.lastUpdateText}>
              Última actualización: {new Date(sensorData.lastUpdate).toLocaleString()}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  attemptsText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  reconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reconnectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  mainCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  mainCardIcon: {
    fontSize: 24,
  },
  mainCardContent: {
    marginBottom: 16,
  },
  mainCardLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mainCardDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  mainCardValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueItem: {
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  chartContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noChartData: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationsContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  lastUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  debugContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  // EPA Scale Styles
  epaScaleContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  epaScaleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  epaScaleSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  epaScaleTable: {
    gap: 12,
  },
  epaScaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  epaScaleColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  epaScaleContent: {
    flex: 1,
  },
  epaScaleCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  epaScaleDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  epaScaleValues: {
    flexDirection: 'row',
    gap: 16,
  },
  epaScaleValue: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
});
