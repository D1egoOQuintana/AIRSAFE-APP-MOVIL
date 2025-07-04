// src/screens/alerts/AlertsScreen.tsx
// Pantalla de gestión de alertas y notificaciones

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

function AlertsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alertas</Text>
      <Text style={styles.subtitle}>
        Sistema de alertas inteligentes, filtros por severidad,
        historial de alertas y configuración de notificaciones.
      </Text>
      {/* TODO: Lista de alertas con filtros */}
      {/* TODO: Configuración de notificaciones */}
      {/* TODO: Botones de reconocimiento */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface.secondary,
    padding: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AlertsScreen;
