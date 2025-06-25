// src/store/slices/airQualitySlice.ts
// Slice de Redux para datos de calidad del aire

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AirQualityData, AirQualityState, DailyAverage } from '../../types';

const initialState: AirQualityState = {
  current: null,
  history: [],
  dailyAverages: [],
  isLoading: false,
  error: null,
  lastUpdate: null,
};

const airQualitySlice = createSlice({
  name: 'airQuality',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCurrentData: (state, action: PayloadAction<AirQualityData>) => {
      state.current = action.payload;
      state.lastUpdate = new Date().toISOString();
      // Agregar al historial
      state.history.unshift(action.payload);
      // Mantener solo las últimas 100 lecturas
      if (state.history.length > 100) {
        state.history = state.history.slice(0, 100);
      }
    },
    addHistoryData: (state, action: PayloadAction<AirQualityData[]>) => {
      state.history.push(...action.payload);
    },
    setDailyAverages: (state, action: PayloadAction<DailyAverage[]>) => {
      state.dailyAverages = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearData: (state) => {
      state.current = null;
      state.history = [];
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setCurrentData,
  addHistoryData,
  setDailyAverages,
  setError,
  clearData,
} = airQualitySlice.actions;

export default airQualitySlice.reducer;
