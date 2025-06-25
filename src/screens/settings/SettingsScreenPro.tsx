// src/screens/settings/SettingsScreenPro.tsx
// Pantalla de configuración y ajustes

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreenPro() {
  const [settings, setSettings] = useState({
    notifications: true,
    autoSync: true,
    dataCollection: true,
    darkMode: false,
    locationServices: true,
  });

  const [userInfo] = useState({
    name: 'Usuario AirSEF',
    phone: '+56 9 8765 4321',
    role: 'Operador',
    lastLogin: '24/06/2025 14:30',
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#9B59B6', '#8E44AD']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Configuración</Text>
        <Text style={styles.headerSubtitle}>
          Personaliza tu experiencia AirSEF
        </Text>
      </LinearGradient>

      {/* User Profile */}
      <View style={styles.profileContainer}>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userInfo.name}</Text>
            <Text style={styles.profilePhone}>{userInfo.phone}</Text>
            <View style={styles.profileMeta}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{userInfo.role}</Text>
              </View>
              <Text style={styles.lastLogin}>Último acceso: {userInfo.lastLogin}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfile}>
            <Ionicons name="pencil" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Configuración de la App</Text>
        
        <View style={styles.settingsCard}>
          <SettingItem
            title="Notificaciones"
            description="Recibir alertas y actualizaciones"
            icon="notifications"
            value={settings.notifications}
            onToggle={() => toggleSetting('notifications')}
            hasSwitch={true}
          />
          <SettingItem
            title="Sincronización Automática"
            description="Actualizar datos automáticamente"
            icon="sync"
            value={settings.autoSync}
            onToggle={() => toggleSetting('autoSync')}
            hasSwitch={true}
          />
          <SettingItem
            title="Recopilación de Datos"
            description="Ayudar a mejorar la aplicación"
            icon="analytics"
            value={settings.dataCollection}
            onToggle={() => toggleSetting('dataCollection')}
            hasSwitch={true}
          />
          <SettingItem
            title="Servicios de Ubicación"
            description="Usar GPS para datos locales"
            icon="location"
            value={settings.locationServices}
            onToggle={() => toggleSetting('locationServices')}
            hasSwitch={true}
          />
        </View>
      </View>

      {/* General Settings */}
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>General</Text>
        
        <View style={styles.settingsCard}>
          <SettingItem
            title="Unidades de Medida"
            description="μg/m³, ppm, AQI"
            icon="calculator"
            onPress={() => {}}
            hasSwitch={false}
          />
          <SettingItem
            title="Idioma"
            description="Español (Chile)"
            icon="language"
            onPress={() => {}}
            hasSwitch={false}
          />
          <SettingItem
            title="Zona Horaria"
            description="Chile Continental (UTC-3)"
            icon="time"
            onPress={() => {}}
            hasSwitch={false}
          />
          <SettingItem
            title="Formato de Fecha"
            description="DD/MM/YYYY"
            icon="calendar"
            onPress={() => {}}
            hasSwitch={false}
          />
        </View>
      </View>

      {/* Data & Privacy */}
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Datos y Privacidad</Text>
        
        <View style={styles.settingsCard}>
          <SettingItem
            title="Exportar Datos"
            description="Descargar todos tus datos"
            icon="download"
            onPress={() => {}}
            hasSwitch={false}
          />
          <SettingItem
            title="Limpiar Caché"
            description="Liberar espacio de almacenamiento"
            icon="trash"
            onPress={() => {}}
            hasSwitch={false}
          />
          <SettingItem
            title="Política de Privacidad"
            description="Ver términos y condiciones"
            icon="document-text"
            onPress={() => {}}
            hasSwitch={false}
          />
        </View>
      </View>

      {/* Support */}
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Soporte</Text>
        
        <View style={styles.settingsCard}>
          <SettingItem
            title="Centro de Ayuda"
            description="Preguntas frecuentes y guías"
            icon="help-circle"
            onPress={() => {}}
            hasSwitch={false}
          />
          <SettingItem
            title="Contactar Soporte"
            description="Enviar mensaje al equipo técnico"
            icon="mail"
            onPress={() => {}}
            hasSwitch={false}
          />
          <SettingItem
            title="Reportar Problema"
            description="Informar errores o sugerencias"
            icon="bug"
            onPress={() => {}}
            hasSwitch={false}
          />
        </View>
      </View>

      {/* App Info */}
      <View style={styles.appInfoContainer}>
        <Text style={styles.sectionTitle}>Información de la App</Text>
        
        <View style={styles.appInfoCard}>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Versión</Text>
            <Text style={styles.appInfoValue}>1.0.0</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Build</Text>
            <Text style={styles.appInfoValue}>2025.06.001</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Última Actualización</Text>
            <Text style={styles.appInfoValue}>24/06/2025</Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={['#E74C3C', '#C0392B']}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out" size={20} color="#FFFFFF" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

function SettingItem({ title, description, icon, value, onToggle, onPress, hasSwitch }: {
  title: string;
  description: string;
  icon: string;
  value?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
  hasSwitch: boolean;
}) {
  return (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={20} color="#9B59B6" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      {hasSwitch ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E7EB', true: '#D8B4FE' }}
          thumbColor={value ? '#9B59B6' : '#F3F4F6'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
      )}
    </TouchableOpacity>
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
  profileContainer: {
    marginHorizontal: 20,
    marginTop: -20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9B59B6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  roleBadge: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  roleText: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '600',
  },
  lastLogin: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  editProfile: {
    padding: 8,
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
    marginBottom: 10,
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
    backgroundColor: '#F3E8FF',
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
  appInfoContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  appInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  appInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  appInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  logoutContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  logoutButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  bottomSpacing: {
    height: 30,
  },
});
