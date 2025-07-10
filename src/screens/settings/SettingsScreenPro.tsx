// src/screens/settings/SettingsScreenClean.tsx
// Pantalla de configuración simplificada con perfil de usuario

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appEventService } from '../../services/appEventService';

const { width } = Dimensions.get('window');

export default function SettingsScreenPro() {
  const [settings, setSettings] = useState({
    notifications: true,
    connectionAlerts: true,
    soundEnabled: true,
  });

  const [userInfo, setUserInfo] = useState({
    name: '',
    lastName: '',
    phone: '',
    role: 'Usuario',
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    loadUserData();
    loadSettings();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('@airsafe_user');
      if (userData) {
        setUserInfo(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const saveUserData = async () => {
    try {
      await AsyncStorage.setItem('@airsafe_user', JSON.stringify(userInfo));
      Alert.alert('✅ Éxito', 'Perfil actualizado correctamente');
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('❌ Error', 'No se pudo guardar el perfil');
    }
  };

  const loadSettings = async () => {
    try {
      const settingsData = await AsyncStorage.getItem('@airsafe_settings');
      if (settingsData) {
        setSettings(JSON.parse(settingsData));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await AsyncStorage.setItem('@airsafe_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    saveSettings(newSettings);
  };

  const confirmLockApp = () => {
    Alert.alert(
      'Bloquear Aplicación',
      '¿Estás seguro de que quieres bloquear la aplicación? Necesitarás deslizar para desbloquear nuevamente.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Bloquear',
          style: 'destructive',
          onPress: () => appEventService.lockApp(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <LinearGradient
          colors={['#3498DB', '#2980B9']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Configuración</Text>
          <Text style={styles.headerSubtitle}>
            Perfil de usuario y configuraciones
          </Text>
        </LinearGradient>

        {/* Perfil de Usuario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil de Usuario</Text>
          
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={32} color="#3498DB" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {userInfo.name || 'Sin nombre'} {userInfo.lastName || ''}
                </Text>
                <Text style={styles.profileRole}>{userInfo.role}</Text>
                <Text style={styles.profilePhone}>{userInfo.phone || 'Sin teléfono'}</Text>
              </View>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setIsEditingProfile(!isEditingProfile)}
              >
                <Ionicons 
                  name={isEditingProfile ? "checkmark" : "pencil"} 
                  size={20} 
                  color="#3498DB" 
                />
              </TouchableOpacity>
            </View>

            {isEditingProfile && (
              <View style={styles.editForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre</Text>
                  <TextInput
                    style={styles.input}
                    value={userInfo.name}
                    onChangeText={(text) => setUserInfo(prev => ({ ...prev, name: text }))}
                    placeholder="Ingresa tu nombre"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Apellidos</Text>
                  <TextInput
                    style={styles.input}
                    value={userInfo.lastName}
                    onChangeText={(text) => setUserInfo(prev => ({ ...prev, lastName: text }))}
                    placeholder="Ingresa tus apellidos"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Teléfono</Text>
                  <TextInput
                    style={styles.input}
                    value={userInfo.phone}
                    onChangeText={(text) => setUserInfo(prev => ({ ...prev, phone: text }))}
                    placeholder="+56 9 1234 5678"
                    keyboardType="phone-pad"
                  />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={saveUserData}>
                  <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Configuraciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuraciones</Text>
          
          <View style={styles.settingsCard}>
            <SettingItem
              icon="notifications"
              title="Notificaciones"
              description="Alertas de calidad del aire"
              value={settings.notifications}
              onToggle={() => toggleSetting('notifications')}
            />
            
            <SettingItem
              icon="wifi"
              title="Alertas de Conexión"
              description="Notificar cuando se pierde conexión MQTT"
              value={settings.connectionAlerts}
              onToggle={() => toggleSetting('connectionAlerts')}
            />
            
            <SettingItem
              icon="volume-high"
              title="Sonido"
              description="Reproducir sonido en notificaciones"
              value={settings.soundEnabled}
              onToggle={() => toggleSetting('soundEnabled')}
            />
          </View>
        </View>

        {/* Sección de Seguridad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seguridad</Text>
          
          <View style={styles.securityCard}>
            <TouchableOpacity style={styles.lockButton} onPress={confirmLockApp}>
              <View style={styles.lockButtonContent}>
                <View style={styles.lockIcon}>
                  <Ionicons name="lock-closed" size={20} color="#DC2626" />
                </View>
                <View style={styles.lockTextContainer}>
                  <Text style={styles.lockTitle}>Bloquear Aplicación</Text>
                  <Text style={styles.lockDescription}>
                    Bloquea la app y requiere deslizar para desbloquear
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información de la App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <View style={styles.infoCard}>
            <InfoItem
              icon="information-circle"
              title="Versión"
              value="1.0.0"
            />
            
            <InfoItem
              icon="server"
              title="Broker MQTT"
              value="broker.emqx.io"
            />
            
            <InfoItem
              icon="calendar"
              title="Última actualización"
              value={new Date().toLocaleDateString()}
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Componente para elementos de configuración
function SettingItem({ icon, title, description, value, onToggle }: {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={20} color="#3498DB" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: '#3498DB' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );
}

// Componente para información
function InfoItem({ icon, title, value }: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon as any} size={20} color="#6B7280" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
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
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
  profileRole: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    padding: 8,
  },
  editForm: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#3498DB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    color: '#1F2937',
  },
  infoValue: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 40,
  },
  securityCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lockButton: {
    padding: 16,
  },
  lockButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lockTextContainer: {
    flex: 1,
  },
  lockTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  lockDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
});
