// src/store/slices/alertsSlice.ts
// Slice de Redux para alertas y notificaciones

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Alert, AlertsState } from '../../types';

const initialState: AlertsState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  filter: 'all',
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.items.unshift(action.payload);
      if (!action.payload.acknowledged) {
        state.unreadCount += 1;
      }
    },
    acknowledgeAlert: (state, action: PayloadAction<string>) => {
      const alert = state.items.find(item => item.id === action.payload);
      if (alert && !alert.acknowledged) {
        alert.acknowledged = true;
        state.unreadCount -= 1;
      }
    },
    setFilter: (state, action: PayloadAction<AlertsState['filter']>) => {
      state.filter = action.payload;
    },
    clearAlerts: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
    markAllAsRead: (state) => {
      state.items.forEach(alert => {
        alert.acknowledged = true;
      });
      state.unreadCount = 0;
    },
  },
});

export const {
  addAlert,
  acknowledgeAlert,
  setFilter,
  clearAlerts,
  markAllAsRead,
} = alertsSlice.actions;

export default alertsSlice.reducer;
