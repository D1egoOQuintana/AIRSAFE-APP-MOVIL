// src/components/cards/AirQualityCard.tsx
// Card específica para mostrar métricas de calidad del aire

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { AirQualityReading } from '../../types';

interface AirQualityCardProps {
  reading: AirQualityReading;
  showDetails?: boolean;
}

export function AirQualityCard({ reading, showDetails = false }: AirQualityCardProps) {
  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calidad del Aire</Text>
        <View style={[styles.badge, { backgroundColor: reading.color }]}>
          <Text style={styles.badgeText}>{reading.value}</Text>
        </View>
      </View>
      
      <Text style={[styles.level, { color: reading.color }]}>
        {reading.label}
      </Text>
      
      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.description}>
            {reading.recommendations[0]}
          </Text>
          
          <View style={styles.effects}>
            {reading.healthEffects.map((effect, index) => (
              <Text key={index} style={styles.effect}>
                • {effect}
              </Text>
            ))}
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.text.primary,
  },
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  badgeText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  level: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.sm,
  },
  details: {
    marginTop: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  effects: {
    marginTop: SPACING.sm,
  },
  effect: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.tertiary,
    marginBottom: 2,
  },
});
