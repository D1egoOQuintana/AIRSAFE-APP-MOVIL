// src/screens/history/HistoryScreen.tsx
// Pantalla de historial con gráficos y filtros

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial</Text>
      <Text style={styles.subtitle}>
        Aquí irán los gráficos interactivos, filtros por fecha, 
        estadísticas y exportación de datos.
      </Text>
      {/* TODO: Implementar gráficos con Victory Native */}
      {/* TODO: Agregar filtros por fecha */}
      {/* TODO: Agregar estadísticas (promedio, máximo, mínimo) */}
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

export default HistoryScreen;
