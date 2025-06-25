// src/screens/auth/LoginScreen.tsx
// Pantalla de login profesional con autenticación por celular

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onLogin: (phone: string) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || phone.length < 9) {
      Alert.alert('Error', 'Por favor ingresa un número de celular peruano válido');
      return;
    }

    setIsLoading(true);
    
    // Simulación de autenticación
    setTimeout(() => {
      setIsLoading(false);
      onLogin(phone);
    }, 1500);
  };

  const formatPhoneNumber = (text: string) => {
    // Formatear número peruano: +51 9XX XXX XXX
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 9) {
      const match = numbers.match(/^(\d{3})?(\d{3})?(\d{3})?$/);
      if (match) {
        return `${match[1] || ''}${match[2] ? ' ' + match[2] : ''}${match[3] ? ' ' + match[3] : ''}`;
      }
    }
    return text;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1ABC9C" />
      <LinearGradient
        colors={['#1ABC9C', '#16A085', '#138D75']}
        style={styles.background}
      >
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/images/air-safe.png')} style={styles.logo} />
          <Text style={styles.appName}>AirSafe</Text>
          <Text style={styles.appSubtitle}>Monitoreo de Calidad del Aire</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.loginCard}>
            <Text style={styles.welcomeText}>Bienvenido</Text>
            <Text style={styles.instructionText}>
              Ingresa tu número de celular para acceder
            </Text>

            <View style={styles.inputContainer}>
              <View style={styles.phoneInputWrapper}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>PE +51</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="9XX XXX XXX"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={(text) => setPhone(formatPhoneNumber(text))}
                  keyboardType="numeric"
                  maxLength={11}
                  autoFocus
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, !phone && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={!phone || isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={phone ? ['#1ABC9C', '#16A085'] : ['#BDC3C7', '#95A5A6']}
                style={styles.loginButtonGradient}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="refresh" size={20} color="#FFFFFF" style={styles.spinner} />
                    <Text style={styles.loginButtonText}>Verificando...</Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="log-in" size={20} color="#FFFFFF" />
                    <Text style={styles.loginButtonText}>Ingresar</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.helpContainer}>
              <Ionicons name="information-circle" size={16} color="#6B7280" />
              <Text style={styles.helpText}>
                Solo personal autorizado puede acceder
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            AirSafe © 2025 • Versión 1.0.0
          </Text>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  logoContainer: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  formContainer: {
    flex: 0.5,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 25,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  countryCode: {
    backgroundColor: '#1ABC9C',
    paddingHorizontal: 15,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  countryCodeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 18,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    transform: [{ rotate: '360deg' }],
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    textAlign: 'center',
  },
  footer: {
    flex: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});
