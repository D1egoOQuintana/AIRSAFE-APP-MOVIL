// src/store/slices/devicesSlice.ts
// Slice de Redux para dispositivos AirSafe conectados

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Device, DevicesState } from '../../types';

const initialState: DevicesState = {
  items: [],
  selected: null,
  isLoading: false,
  connectionStatus: 'disconnected',
  lastConnectionAttempt: null,
};

const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    setDevices: (state, action: PayloadAction<Device[]>) => {
      state.items = action.payload;
    },
    addDevice: (state, action: PayloadAction<Device>) => {
      const existingIndex = state.items.findIndex(d => d.id === action.payload.id);
      if (existingIndex >= 0) {
        state.items[existingIndex] = action.payload;
      } else {
        state.items.push(action.payload);
      }
    },
    selectDevice: (state, action: PayloadAction<Device | null>) => {
      state.selected = action.payload;
    },
    updateDeviceStatus: (state, action: PayloadAction<{ id: string; isOnline: boolean }>) => {
      const device = state.items.find(d => d.id === action.payload.id);
      if (device) {
        device.isOnline = action.payload.isOnline;
        device.lastSeen = new Date().toISOString();
      }
    },
    setConnectionStatus: (state, action: PayloadAction<DevicesState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
      state.lastConnectionAttempt = new Date().toISOString();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setDevices,
  addDevice,
  selectDevice,
  updateDeviceStatus,
  setConnectionStatus,
  setLoading,
} = devicesSlice.actions;

export default devicesSlice.reducer;
