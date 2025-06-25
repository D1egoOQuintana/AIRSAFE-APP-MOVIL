// src/store/index.ts
// Configuración del store Redux con Redux Toolkit

import { configureStore } from '@reduxjs/toolkit';
import airQualityReducer from './slices/airQualitySlice';
import alertsReducer from './slices/alertsSlice';
import devicesReducer from './slices/devicesSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    airQuality: airQualityReducer,
    alerts: alertsReducer,
    devices: devicesReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
