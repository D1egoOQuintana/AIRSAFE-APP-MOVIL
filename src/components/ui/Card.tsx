// src/components/ui/Card.tsx
// Componente Card reutilizable con sombras y estilos modernos

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { COLORS, SHADOWS, RADIUS, SPACING } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof SPACING;
  style?: ViewStyle;
}

export function Card({ 
  children, 
  variant = 'default', 
  padding = 'md',
  style 
}: CardProps) {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: COLORS.surface.primary,
      borderRadius: RADIUS.lg,
      padding: SPACING[padding],
    };

    switch (variant) {
      case 'elevated':
        return { ...baseStyle, ...SHADOWS.lg };
      case 'outlined':
        return { 
          ...baseStyle, 
          borderWidth: 1, 
          borderColor: COLORS.border.light 
        };
      default:
        return { ...baseStyle, ...SHADOWS.md };
    }
  };

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
}
