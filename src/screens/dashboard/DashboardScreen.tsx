// src/screens/dashboard/DashboardScreen.tsx
// Pantalla principal del dashboard con métricas en tiempo real

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setCurrentData } from '../../store/slices/airQualitySlice';
import { useMQTT } from '../../hooks/useMQTT';
import { useAirQuality } from '../../hooks/useAirQuality';
import { AirQualityCard } from '../../components/cards/AirQualityCard';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

function DashboardScreen() {
  const dispatch = useDispatch();
  const { current, isLoading } = useSelector((state: RootState) => state.airQuality);
  const { reading, updateReading } = useAirQuality();

  // Conectar MQTT (con simulador por defecto)
  useMQTT({
    deviceId: 'airsafe-001',
    onData: (data) => {
      dispatch(setCurrentData(data));
      updateReading(data.pm25, data.pm10, data.pm1);
    },
    useSimulator: true, // Cambiar a false para MQTT real
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AirSafe Dashboard</Text>
        <Text style={styles.subtitle}>Monitoreo en tiempo real</Text>
      </View>

      {reading && <AirQualityCard reading={reading} showDetails />}

      {current && (
        <View style={styles.metrics}>
          <Text style={styles.metricsTitle}>Métricas Actuales</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{current.pm25.toFixed(1)}</Text>
              <Text style={styles.metricLabel}>PM2.5 µg/m³</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{current.pm10.toFixed(1)}</Text>
              <Text style={styles.metricLabel}>PM10 µg/m³</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{current.pm1?.toFixed(1) || 'N/A'}</Text>
              <Text style={styles.metricLabel}>PM1.0 µg/m³</Text>
            </View>
          </View>
        </View>
      )}

      {/* TODO: Agregar gráficos, estado del dispositivo, etc. */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface.secondary,
    padding: SPACING.md,
  },
  header: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
  },
  metrics: {
    marginTop: SPACING.lg,
  },
  metricsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
    backgroundColor: COLORS.surface.primary,
    padding: SPACING.md,
    borderRadius: 12,
    marginHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary[500],
  },
  metricLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});

export default DashboardScreen;
