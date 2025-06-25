// src/navigation/index.tsx
// Sistema de navegación principal con Tab Navigator y Stack Navigator

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { TabParamList, RootStackParamList } from '../types';

import DashboardScreenPro from '../screens/dashboard/DashboardScreenPro';
import HistoryScreenPro from '../screens/history/HistoryScreenPro';
import AlertsScreenPro from '../screens/alerts/AlertsScreenPro';
import SettingsScreenPro from '../screens/settings/SettingsScreenPro';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

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
  return (
    <NavigationContainer>
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
