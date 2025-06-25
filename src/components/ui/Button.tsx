// src/components/ui/Button.tsx
// Componente Button moderno con estados y variantes

import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: RADIUS.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    const sizeStyles = {
      sm: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
      md: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
      lg: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
    };

    // Variant styles
    const variantStyles = {
      primary: { backgroundColor: COLORS.primary[500] },
      secondary: { backgroundColor: COLORS.secondary[500] },
      outline: { 
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary[500],
      },
      ghost: { backgroundColor: 'transparent' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    };

    const variantStyles = {
      primary: { color: COLORS.text.inverse },
      secondary: { color: COLORS.text.inverse },
      outline: { color: COLORS.primary[500] },
      ghost: { color: COLORS.primary[500] },
    };

    return { ...baseStyle, ...variantStyles[variant] };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'secondary' ? COLORS.text.inverse : COLORS.primary[500]}
          style={{ marginRight: SPACING.sm }}
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
}
