import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SwipeToUnlockScreen from './src/screens/unlock/SwipeToUnlockScreen';
import { RootNavigator } from './src/navigation';
import { appEventService } from './src/services/appEventService';

const AUTH_KEY = '@airsafe_auth_state';
const LAST_ACTIVE_KEY = '@airsafe_last_active';
const AUTO_LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutos

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar estado de autenticación persistido
    loadAuthState();
    
    // Escuchar eventos de bloqueo
    appEventService.onLockApp(handleLock);
    
    // Escuchar cambios de estado de la app
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        // App va al fondo - guardar timestamp
        saveLastActiveTime();
      } else if (nextAppState === 'active') {
        // App vuelve al frente - verificar si necesita bloquear
        checkAutoLock();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
      appEventService.offLockApp(handleLock);
    };
  }, []);

  const loadAuthState = async () => {
    try {
      const savedAuth = await AsyncStorage.getItem(AUTH_KEY);
      const lastActive = await AsyncStorage.getItem(LAST_ACTIVE_KEY);
      
      if (savedAuth === 'true') {
        // Verificar si ha pasado mucho tiempo desde la última actividad
        if (lastActive) {
          const timeDiff = Date.now() - parseInt(lastActive);
          if (timeDiff < AUTO_LOCK_TIMEOUT) {
            setIsAuthenticated(true);
          } else {
            // Auto-bloquear si ha pasado mucho tiempo
            await AsyncStorage.setItem(AUTH_KEY, 'false');
          }
        } else {
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLastActiveTime = async () => {
    try {
      await AsyncStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving last active time:', error);
    }
  };

  const checkAutoLock = async () => {
    try {
      const lastActive = await AsyncStorage.getItem(LAST_ACTIVE_KEY);
      if (lastActive) {
        const timeDiff = Date.now() - parseInt(lastActive);
        if (timeDiff >= AUTO_LOCK_TIMEOUT && isAuthenticated) {
          // Auto-bloquear
          await AsyncStorage.setItem(AUTH_KEY, 'false');
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Error checking auto lock:', error);
    }
  };

  const handleUnlock = async () => {
    try {
      await AsyncStorage.setItem(AUTH_KEY, 'true');
      await saveLastActiveTime();
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  const handleLock = async () => {
    try {
      await AsyncStorage.setItem(AUTH_KEY, 'false');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  if (isLoading) {
    return null; // Puedes mostrar un splash screen aquí
  }

  return (
    <>
      <StatusBar style="auto" />
      {isAuthenticated ? (
        <RootNavigator />
      ) : (
        <SwipeToUnlockScreen onUnlock={handleUnlock} />
      )}
    </>
  );
}
