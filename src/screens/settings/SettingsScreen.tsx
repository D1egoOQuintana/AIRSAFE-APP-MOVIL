// src/screens/settings/SettingsScreen.tsx
// Pantalla de configuraciones de usuario

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración</Text>
      <Text style={styles.subtitle}>
        Configuración de notificaciones, umbrales personalizados,
        temas, unidades, configuración MQTT y gestión de dispositivos.
      </Text>
      {/* TODO: Configuración de notificaciones */}
      {/* TODO: Umbrales personalizados */}
      {/* TODO: Configuración MQTT */}
      {/* TODO: Gestión de dispositivos */}
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

export default SettingsScreen;
