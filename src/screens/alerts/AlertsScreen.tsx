// src/screens/alerts/AlertsScreen.tsx
// Pantalla de gestión de alertas y notificaciones con MQTT

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mqttManager from '../../services/MqttManager';
import notificationService from '../../services/notificationService';
import { calculateOverallAirQuality } from '../../utils/airQuality';

interface AlertHistory {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  acknowledged: boolean;
  pm25?: number;
  pm10?: number;
}

interface AlertSettings {
  enabled: boolean;
  pm25Threshold: number;
  pm10Threshold: number;
  temperatureThreshold: number;
  connectionAlerts: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export default function AlertsScreen() {
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    enabled: true,
    pm25Threshold: 35,
    pm10Threshold: 150,
    temperatureThreshold: 35,
    connectionAlerts: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentAirQuality, setCurrentAirQuality] = useState<any>(null);

  useEffect(() => {
    loadAlertHistory();
    loadAlertSettings();
    setupMQTTListeners();
    
    return () => {
      mqttManager.removeAllListeners();
    };
  }, []);

  const loadAlertHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('@airsafe_alert_history');
      if (history) {
        setAlertHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading alert history:', error);
    }
  };

  const loadAlertSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('@airsafe_alert_settings');
      if (settings) {
        setAlertSettings(JSON.parse(settings));
      }
    } catch (error) {
      console.error('Error loading alert settings:', error);
    }
  };

  const saveAlertHistory = async (history: AlertHistory[]) => {
    try {
      await AsyncStorage.setItem('@airsafe_alert_history', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving alert history:', error);
    }
  };

  const saveAlertSettings = async (settings: AlertSettings) => {
    try {
      await AsyncStorage.setItem('@airsafe_alert_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving alert settings:', error);
    }
  };

  const setupMQTTListeners = () => {
    mqttManager.on('dataUpdate', handleDataUpdate);
    mqttManager.on('connectionLost', handleConnectionLost);
    mqttManager.on('connected', handleConnectionRestored);
  };

  const handleDataUpdate = ({ sensorData }: { sensorData: any }) => {
    const airQuality = calculateOverallAirQuality(sensorData.pm25, sensorData.pm10);
    setCurrentAirQuality(airQuality);
    
    // Verificar si se debe generar una alerta
    checkForAlerts(sensorData);
  };

  const handleConnectionLost = () => {
    if (alertSettings.connectionAlerts) {
      addAlert(
        'Conexión perdida',
        'Se ha perdido la conexión con los sensores',
        'high',
        new Date().toISOString()
      );
    }
  };

  const handleConnectionRestored = () => {
    if (alertSettings.connectionAlerts) {
      addAlert(
        'Conexión restablecida',
        'La conexión con los sensores se ha restablecido',
        'low',
        new Date().toISOString()
      );
    }
  };

  const checkForAlerts = (sensorData: any) => {
    if (!alertSettings.enabled) return;

    const { pm25, pm10, temperature } = sensorData;
    const now = new Date().toISOString();

    // Verificar PM2.5
    if (pm25 && parseFloat(pm25) > alertSettings.pm25Threshold) {
      addAlert(
        'PM2.5 elevado',
        `Nivel de PM2.5: ${pm25} μg/m³ (límite: ${alertSettings.pm25Threshold})`,
        parseFloat(pm25) > alertSettings.pm25Threshold * 1.5 ? 'critical' : 'high',
        now,
        parseFloat(pm25),
        pm10 ? parseFloat(pm10) : undefined
      );
    }

    // Verificar PM10
    if (pm10 && parseFloat(pm10) > alertSettings.pm10Threshold) {
      addAlert(
        'PM10 elevado',
        `Nivel de PM10: ${pm10} μg/m³ (límite: ${alertSettings.pm10Threshold})`,
        parseFloat(pm10) > alertSettings.pm10Threshold * 1.5 ? 'critical' : 'high',
        now,
        pm25 ? parseFloat(pm25) : undefined,
        parseFloat(pm10)
      );
    }

    // Verificar temperatura
    if (temperature && parseFloat(temperature) > alertSettings.temperatureThreshold) {
      addAlert(
        'Temperatura alta',
        `Temperatura: ${temperature}°C (límite: ${alertSettings.temperatureThreshold}°C)`,
        'medium',
        now
      );
    }
  };

  const addAlert = (
    title: string,
    description: string,
    severity: AlertHistory['severity'],
    timestamp: string,
    pm25?: number,
    pm10?: number
  ) => {
    const newAlert: AlertHistory = {
      id: Date.now().toString(),
      title,
      description,
      severity,
      timestamp,
      acknowledged: false,
      pm25,
      pm10,
    };

    const updatedHistory = [newAlert, ...alertHistory].slice(0, 50); // Mantener solo las últimas 50 alertas
    setAlertHistory(updatedHistory);
    saveAlertHistory(updatedHistory);

    // Enviar notificación push si está habilitada
    if (alertSettings.enabled) {
      notificationService.sendCustomAlert(title, description, { severity });
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    const updatedHistory = alertHistory.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    );
    setAlertHistory(updatedHistory);
    saveAlertHistory(updatedHistory);
  };

  const clearAllAlerts = () => {
    Alert.alert(
      'Limpiar Alertas',
      '¿Estás seguro de que quieres eliminar todas las alertas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: () => {
            setAlertHistory([]);
            saveAlertHistory([]);
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAlertHistory();
    setIsRefreshing(false);
  };

  const updateAlertSettings = (key: keyof AlertSettings, value: any) => {
    const newSettings = { ...alertSettings, [key]: value };
    setAlertSettings(newSettings);
    saveAlertSettings(newSettings);
  };

  const getSeverityColor = (severity: AlertHistory['severity']) => {
    switch (severity) {
      case 'low':
        return '#22C55E';
      case 'medium':
        return '#EAB308';
      case 'high':
        return '#F97316';
      case 'critical':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getSeverityIcon = (severity: AlertHistory['severity']) => {
    switch (severity) {
      case 'low':
        return 'information-circle';
      case 'medium':
        return 'warning';
      case 'high':
        return 'alert-circle';
      case 'critical':
        return 'nuclear';
      default:
        return 'help-circle';
    }
  };

  const renderAlertItem = (alert: AlertHistory) => (
    <View key={alert.id} style={[styles.alertItem, !alert.acknowledged && styles.unacknowledgedAlert]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <Ionicons
            name={getSeverityIcon(alert.severity)}
            size={20}
            color={getSeverityColor(alert.severity)}
          />
          <Text style={[styles.alertTitle, { color: getSeverityColor(alert.severity) }]}>
            {alert.title}
          </Text>
        </View>
        <Text style={styles.alertTime}>
          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      
      <Text style={styles.alertDescription}>{alert.description}</Text>
      
      {(alert.pm25 || alert.pm10) && (
        <View style={styles.alertMetrics}>
          {alert.pm25 && (
            <Text style={styles.alertMetric}>PM2.5: {alert.pm25} μg/m³</Text>
          )}
          {alert.pm10 && (
            <Text style={styles.alertMetric}>PM10: {alert.pm10} μg/m³</Text>
          )}
        </View>
      )}
      
      <View style={styles.alertActions}>
        <Text style={styles.alertDate}>
          {new Date(alert.timestamp).toLocaleDateString()}
        </Text>
        {!alert.acknowledged && (
          <TouchableOpacity
            style={styles.acknowledgeButton}
            onPress={() => acknowledgeAlert(alert.id)}
          >
            <Text style={styles.acknowledgeButtonText}>Reconocer</Text>
          </TouchableOpacity>
        )}
        {alert.acknowledged && (
          <Text style={styles.acknowledgedText}>✓ Reconocido</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Alertas</Text>
            <Text style={styles.headerSubtitle}>
              {alertHistory.filter(a => !a.acknowledged).length} alertas pendientes
            </Text>
          </View>
          <TouchableOpacity style={styles.clearButton} onPress={clearAllAlerts}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Current Air Quality Status */}
        {currentAirQuality && (
          <View style={styles.currentStatusContainer}>
            <LinearGradient
              colors={[currentAirQuality.bgColor, currentAirQuality.bgColor + '80']}
              style={styles.currentStatusCard}
            >
              <View style={styles.statusHeader}>
                <Text style={styles.statusTitle}>Estado Actual</Text>
                <Text style={styles.statusIcon}>{currentAirQuality.icon}</Text>
              </View>
              <Text style={[styles.statusLabel, { color: currentAirQuality.color }]}>
                {currentAirQuality.label}
              </Text>
              <Text style={styles.statusDescription}>
                {currentAirQuality.description}
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Alert History */}
        <View style={styles.alertsContainer}>
          <Text style={styles.sectionTitle}>Historial de Alertas</Text>
          {alertHistory.length === 0 ? (
            <View style={styles.noAlertsContainer}>
              <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
              <Text style={styles.noAlertsText}>No hay alertas</Text>
              <Text style={styles.noAlertsSubtext}>
                Todas las lecturas están dentro de los rangos normales
              </Text>
            </View>
          ) : (
            alertHistory.map(renderAlertItem)
          )}
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Alertas habilitadas</Text>
            <Switch
              value={alertSettings.enabled}
              onValueChange={(value) => updateAlertSettings('enabled', value)}
              trackColor={{ false: '#E5E7EB', true: '#22C55E' }}
              thumbColor={alertSettings.enabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Alertas de conexión</Text>
            <Switch
              value={alertSettings.connectionAlerts}
              onValueChange={(value) => updateAlertSettings('connectionAlerts', value)}
              trackColor={{ false: '#E5E7EB', true: '#22C55E' }}
              thumbColor={alertSettings.connectionAlerts ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
          
          <View style={styles.thresholdContainer}>
            <Text style={styles.thresholdTitle}>Umbrales de Alerta</Text>
            <Text style={styles.thresholdItem}>PM2.5: {alertSettings.pm25Threshold} μg/m³</Text>
            <Text style={styles.thresholdItem}>PM10: {alertSettings.pm10Threshold} μg/m³</Text>
            <Text style={styles.thresholdItem}>Temperatura: {alertSettings.temperatureThreshold}°C</Text>
          </View>
        </View>
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
  clearButton: {
    padding: 8,
  },
  currentStatusContainer: {
    margin: 16,
  },
  currentStatusCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusIcon: {
    fontSize: 24,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  alertsContainer: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  alertItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
  },
  unacknowledgedAlert: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  alertTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  alertDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  alertMetrics: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  alertMetric: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 16,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  acknowledgeButton: {
    backgroundColor: '#1ABC9C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acknowledgeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  acknowledgedText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  noAlertsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noAlertsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
  },
  noAlertsSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  settingsContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  thresholdContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  thresholdTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  thresholdItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
});
