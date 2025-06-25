// src/store/slices/settingsSlice.ts
// Slice de Redux para configuraciones de usuario

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings } from '../../types';

const initialState: AppSettings = {
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    criticalAlertsOnly: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00',
    },
  },
  thresholds: {
    pm25Warning: 35,
    pm25Critical: 75,
    pm10Warning: 50,
    pm10Critical: 100,
    customLevels: false,
  },
  display: {
    theme: 'auto',
    units: 'metric',
    refreshInterval: 30,
    showAdvancedMetrics: false,
  },
  location: {
    autoDetect: true,
  },
  mqtt: {
    brokerUrl: 'PLACEHOLDER_BROKER_URL',
    port: 8884,
    useSSL: true,
    topics: {
      airQuality: 'airsafe/{deviceId}/air_quality',
      alerts: 'airsafe/{deviceId}/alerts',
      status: 'airsafe/{deviceId}/status',
    },
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateNotificationSettings: (state, action: PayloadAction<Partial<AppSettings['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    updateThresholds: (state, action: PayloadAction<Partial<AppSettings['thresholds']>>) => {
      state.thresholds = { ...state.thresholds, ...action.payload };
    },
    updateDisplaySettings: (state, action: PayloadAction<Partial<AppSettings['display']>>) => {
      state.display = { ...state.display, ...action.payload };
    },
    updateLocationSettings: (state, action: PayloadAction<Partial<AppSettings['location']>>) => {
      state.location = { ...state.location, ...action.payload };
    },
    updateMqttSettings: (state, action: PayloadAction<Partial<AppSettings['mqtt']>>) => {
      state.mqtt = { ...state.mqtt, ...action.payload };
    },
    resetToDefaults: () => initialState,
  },
});

export const {
  updateNotificationSettings,
  updateThresholds,
  updateDisplaySettings,
  updateLocationSettings,
  updateMqttSettings,
  resetToDefaults,
} = settingsSlice.actions;

export default settingsSlice.reducer;
