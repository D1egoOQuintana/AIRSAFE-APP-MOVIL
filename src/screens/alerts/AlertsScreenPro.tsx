// src/screens/alerts/AlertsScreenPro.tsx
// Pantalla de alertas y notificaciones

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function AlertsScreenPro() {
  const [alertSettings, setAlertSettings] = useState({
    pm25Alerts: true,
    pm10Alerts: true,
    aqiAlerts: true,
    pushNotifications: true,
    emailAlerts: false,
    soundAlerts: true,
  });

  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'PM2.5 Alto',
      message: 'Los niveles de PM2.5 han superado el umbral recomendado (28 μg/m³)',
      time: '14:30',
      location: 'Centro de Santiago',
      acknowledged: false,
    },
    {
      id: 2,
      type: 'info',
      title: 'Calidad Mejorada',
      message: 'La calidad del aire ha vuelto a niveles saludables',
      time: '12:15',
      location: 'Centro de Santiago',
      acknowledged: true,
    },
    {
      id: 3,
      type: 'danger',
      title: 'AQI Crítico',
      message: 'Índice de calidad del aire en nivel peligroso (AQI: 95)',
      time: '11:45',
      location: 'Zona Industrial',
      acknowledged: false,
    },
    {
      id: 4,
      type: 'success',
      title: 'Sistema Operativo',
      message: 'Todos los sensores funcionando correctamente',
      time: '08:00',
      location: 'Red de Sensores',
      acknowledged: true,
    },
  ];

  const toggleSetting = (key: keyof typeof alertSettings) => {
    setAlertSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#E74C3C', '#C0392B']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Alertas y Notificaciones</Text>
        <Text style={styles.headerSubtitle}>
          Gestiona tus alertas de calidad del aire
        </Text>
      </LinearGradient>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>2</Text>
            <Text style={styles.summaryLabel}>Activas</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>2</Text>
            <Text style={styles.summaryLabel}>Leídas</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>4</Text>
            <Text style={styles.summaryLabel}>Total Hoy</Text>
          </View>
        </View>
      </View>

      {/* Alert Settings */}
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Configuración de Alertas</Text>
        
        <View style={styles.settingsCard}>
          <SettingItem
            title="Alertas PM2.5"
            description="Notificar cuando PM2.5 > 25 μg/m³"
            icon="radio-button-on"
            value={alertSettings.pm25Alerts}
            onToggle={() => toggleSetting('pm25Alerts')}
          />
          <SettingItem
            title="Alertas PM10"
            description="Notificar cuando PM10 > 50 μg/m³"
            icon="radio-button-off"
            value={alertSettings.pm10Alerts}
            onToggle={() => toggleSetting('pm10Alerts')}
          />
          <SettingItem
            title="Alertas AQI"
            description="Notificar cuando AQI > 75"
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
            title="Alertas por Email"
            description="Enviar alertas al correo electrónico"
            icon="mail"
            value={alertSettings.emailAlerts}
            onToggle={() => toggleSetting('emailAlerts')}
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
        <Text style={styles.sectionTitle}>Alertas Recientes</Text>
        
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <LinearGradient
            colors={['#3498DB', '#2980B9']}
            style={styles.actionGradient}
          >
            <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>Marcar Todas como Leídas</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <LinearGradient
            colors={['#2ECC71', '#27AE60']}
            style={styles.actionGradient}
          >
            <Ionicons name="settings" size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>Configurar Umbrales</Text>
          </LinearGradient>
        </TouchableOpacity>
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

function AlertCard({ alert }: { alert: any }) {
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
        
        <TouchableOpacity style={styles.alertAction}>
          <Ionicons name="ellipsis-vertical" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.alertMessage}>{alert.message}</Text>
      
      {!alert.acknowledged && (
        <TouchableOpacity style={styles.acknowledgeButton}>
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
  settingsContainer: {
    marginTop: 30,
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
  alertAction: {
    padding: 5,
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
  actionsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  bottomSpacing: {
    height: 30,
  },
});
