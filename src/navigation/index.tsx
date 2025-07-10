// src/navigation/index.tsx
// Sistema de navegación principal con Tab Navigator y Stack Navigator + Persistencia

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabParamList, RootStackParamList } from '../types';

import DashboardScreenPro from '../screens/dashboard/DashboardScreenPro';
import HistoryScreenPro from '../screens/history/HistoryScreenPro';
import AlertsScreenPro from '../screens/alerts/AlertsScreenPro';
import SettingsScreenPro from '../screens/settings/SettingsScreenPro';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const PERSISTENCE_KEY = '@airsafe_navigation_state';

function TabNavigator() {
  return (
    <Tab.Navigator      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1ABC9C',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard" 
        component={DashboardScreenPro}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreenPro}
        options={{
          tabBarLabel: 'Historial',          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts" 
        component={AlertsScreenPro}
        options={{
          tabBarLabel: 'Alertas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings" 
        component={SettingsScreenPro}
        options={{
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();

  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
        const state = savedStateString ? JSON.parse(savedStateString) : undefined;

        if (state !== undefined) {
          setInitialState(state);
        }
      } catch (e) {
        console.warn('Error restoring navigation state:', e);
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState();
    }
  }, [isReady]);

  const onStateChange = (state: any) => {
    AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
  };

  if (!isReady) {
    return null; // Puedes mostrar un splash screen aquí
  }

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={onStateChange}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Settings" component={SettingsScreenPro} />
        {/* TODO: Agregar más pantallas según sea necesario */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
