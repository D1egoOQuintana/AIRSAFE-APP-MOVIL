// src/screens/alerts/AlertsScreenPro.tsx
// Pantalla de alertas y notificaciones completamente funcional

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import alertService from '../../services/alertService';

interface AlertData {
  id: string;
  type: 'warning' | 'info' | 'danger' | 'success';
  title: string;
  message: string;
  time: string;
  location: string;
  acknowledged: boolean;
  timestamp?: string;
  value?: number;
  threshold?: number;
  parameter?: string;
}

export default function AlertsScreenPro() {
  const [alertSettings, setAlertSettings] = useState(alertService.alertSettings);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [stats, setStats] = useState({ active: 0, acknowledged: 0, totalToday: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAlerts();
    
    // Escuchar cambios en las alertas
    const handleAlertsUpdate = () => {
      loadAlerts();
    };
    
    alertService.addListener(handleAlertsUpdate);
    
    return () => {
      alertService.removeListener(handleAlertsUpdate);
    };
  }, [filter]);

  const loadAlerts = () => {
    const alertStats = alertService.getAlertStats();
    const filteredAlerts = alertService.getAlerts(filter);
    
    setStats(alertStats);
    setAlerts(filteredAlerts);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await alertService.loadAlerts();
    loadAlerts();
    setIsRefreshing(false);
  };

  const toggleSetting = (key: keyof typeof alertSettings, value?: any) => {
    const newSettings = {
      ...alertSettings,
      [key]: value !== undefined ? value : !alertSettings[key],
    };
    setAlertSettings(newSettings);
    alertService.updateSettings(newSettings);
  };

  const acknowledgeAlert = (alertId: string) => {
    alertService.acknowledgeAlert(alertId);
    loadAlerts();
  };

  const testAlert = () => {
    Alert.alert(
      'Probar Alertas',
      '¿Qué tipo de alerta quieres probar?',
      [
        { text: 'PM2.5 Alto', onPress: () => testSpecificAlert('PM2.5', 45) },
        { text: 'AQI Crítico', onPress: () => testSpecificAlert('AQI', 120) },
        { text: 'Calidad Mejorada', onPress: () => testImprovementAlert() },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const testSpecificAlert = (type: string, value: number) => {
    if (type === 'PM2.5') {
      alertService.processData({ pm25: value, pm10: 30, temperature: 22, humidity: 45 });
    } else if (type === 'AQI') {
      alertService.processData({ pm25: 80, pm10: 120, temperature: 22, humidity: 45 });
    }
  };

  const testImprovementAlert = () => {
    alertService.processData({ pm25: 15, pm10: 25, temperature: 22, humidity: 45 });
  };

  const markAllAsRead = () => {
    Alert.alert(
      'Marcar todas como leídas',
      '¿Estás seguro de que quieres marcar todas las alertas como leídas?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sí, marcar todas',
          onPress: () => {
            alertService.markAllAsRead();
            loadAlerts();
          }
        }
      ]
    );
  };

  const clearAllAlerts = () => {
    Alert.alert(
      'Eliminar todas las alertas',
      '¿Estás seguro de que quieres eliminar permanentemente todas las alertas? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sí, eliminar todas',
          style: 'destructive',
          onPress: () => {
            alertService.clearAllAlerts();
            loadAlerts();
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#E74C3C', '#C0392B']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Alertas y Notificaciones</Text>
        <Text style={styles.headerSubtitle}>
          Gestiona tus alertas de calidad del aire
        </Text>
        <TouchableOpacity style={styles.testButton} onPress={testAlert}>
          <Ionicons name="flask" size={16} color="#FFFFFF" />
          <Text style={styles.testButtonText}>Probar</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{stats.active}</Text>
            <Text style={styles.summaryLabel}>Activas</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{stats.acknowledged}</Text>
            <Text style={styles.summaryLabel}>Leídas</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{stats.totalToday}</Text>
            <Text style={styles.summaryLabel}>Total Hoy</Text>
          </View>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {['all', 'active', 'acknowledged'].map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterButton,
              filter === filterType && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text
              style={[
                styles.filterText,
                filter === filterType && styles.filterTextActive,
              ]}
            >
              {filterType === 'all' ? 'Todas' : 
               filterType === 'active' ? 'Activas' : 'Leídas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Alert Settings */}
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Configuración de Alertas</Text>
        
        <View style={styles.settingsCard}>
          <SettingItem
            title="Alertas PM2.5"
            description={`Notificar cuando PM2.5 > ${alertSettings.pm25Threshold} μg/m³`}
            icon="radio-button-on"
            value={alertSettings.pm25Alerts}
            onToggle={() => toggleSetting('pm25Alerts')}
          />
          <SettingItem
            title="Alertas PM10"
            description={`Notificar cuando PM10 > ${alertSettings.pm10Threshold} μg/m³`}
            icon="radio-button-off"
            value={alertSettings.pm10Alerts}
            onToggle={() => toggleSetting('pm10Alerts')}
          />
          <SettingItem
            title="Alertas AQI"
            description={`Notificar cuando AQI > ${alertSettings.aqiThreshold}`}
            icon="stats-chart"
            value={alertSettings.aqiAlerts}
            onToggle={() => toggleSetting('aqiAlerts')}
          />
        </View>

        <View style={styles.settingsCard}>
          <SettingItem
            title="Notificaciones Push"
            description="Recibir notificaciones en el dispositivo"
            icon="notifications"
            value={alertSettings.pushNotifications}
            onToggle={() => toggleSetting('pushNotifications')}
          />
          <SettingItem
            title="Sonido de Alertas"
            description="Reproducir sonido con las notificaciones"
            icon="volume-high"
            value={alertSettings.soundAlerts}
            onToggle={() => toggleSetting('soundAlerts')}
          />
        </View>
      </View>

      {/* Alerts List */}
      <View style={styles.alertsContainer}>
        <View style={styles.alertsHeader}>
          <Text style={styles.sectionTitle}>Alertas Recientes</Text>
          
          {alerts.length > 0 && (
            <View style={styles.alertsActions}>
              <TouchableOpacity style={styles.actionButton} onPress={markAllAsRead}>
                <Ionicons name="checkmark-done" size={16} color="#3498DB" />
                <Text style={styles.actionButtonText}>Marcar todas</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.actionButtonDanger]} 
                onPress={clearAllAlerts}
              >
                <Ionicons name="trash" size={16} color="#EF4444" />
                <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>Eliminar todas</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <AlertCard 
              key={alert.id} 
              alert={alert} 
              onAcknowledge={() => acknowledgeAlert(alert.id)}
            />
          ))
        ) : (
          <View style={styles.noAlertsContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#27AE60" />
            <Text style={styles.noAlertsText}>Sin alertas</Text>
            <Text style={styles.noAlertsSubtext}>
              {filter === 'all' ? 'No hay alertas registradas' :
               filter === 'active' ? 'No hay alertas activas' : 'No hay alertas leídas'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

function SettingItem({ title, description, icon, value, onToggle }: {
  title: string;
  description: string;
  icon: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={20} color="#3498DB" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
        thumbColor={value ? '#3498DB' : '#F3F4F6'}
      />
    </View>
  );
}

function AlertCard({ alert, onAcknowledge }: { alert: AlertData; onAcknowledge: () => void }) {
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'danger': return '#E74C3C';
      case 'warning': return '#F39C12';
      case 'info': return '#3498DB';
      case 'success': return '#2ECC71';
      default: return '#6B7280';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger': return 'alert-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      case 'success': return 'checkmark-circle';
      default: return 'ellipse';
    }
  };

  return (
    <View style={[styles.alertCard, !alert.acknowledged && styles.alertCardUnread]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertIndicator}>
          <View style={[styles.alertIcon, { backgroundColor: getAlertColor(alert.type) }]}>
            <Ionicons name={getAlertIcon(alert.type) as any} size={16} color="#FFFFFF" />
          </View>
          {!alert.acknowledged && <View style={styles.unreadDot} />}
        </View>
        
        <View style={styles.alertInfo}>
          <Text style={styles.alertTitle}>{alert.title}</Text>
          <Text style={styles.alertTime}>{alert.time} • {alert.location}</Text>
        </View>
      </View>
      
      <Text style={styles.alertMessage}>{alert.message}</Text>
      
      {!alert.acknowledged && (
        <TouchableOpacity style={styles.acknowledgeButton} onPress={onAcknowledge}>
          <Text style={styles.acknowledgeText}>Marcar como leída</Text>
        </TouchableOpacity>
      )}
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
    position: 'relative',
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
  testButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  summaryContainer: {
    marginHorizontal: 20,
    marginTop: -20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3498DB',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  settingsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  alertsContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  noAlertsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noAlertsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  noAlertsSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  alertCardUnread: {
    borderLeftColor: '#E74C3C',
    backgroundColor: '#FFFBFB',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertIndicator: {
    position: 'relative',
    marginRight: 15,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  alertMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 15,
  },
  acknowledgeButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#EBF8FF',
    borderRadius: 20,
  },
  acknowledgeText: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '600',
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  alertsActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3498DB',
    marginLeft: 4,
  },
  actionButtonTextDanger: {
    color: '#EF4444',
  },
  bottomSpacing: {
    height: 40,
  },
});
