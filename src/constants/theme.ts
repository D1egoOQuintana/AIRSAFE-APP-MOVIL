import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Paleta de colores profesional 2025
export const COLORS = {
  // Primarios - Inspirados en tecnología verde y sostenibilidad
  primary: {
    50: '#E8F8F5',
    100: '#D1F2EB', 
    200: '#A3E4D7',
    300: '#76D7C4',
    400: '#48C9B0',
    500: '#1ABC9C', // Color principal - Verde tecnológico
    600: '#17A085',
    700: '#148F77',
    800: '#0E6B5C',
    900: '#0A4D3A',
  },

  // Secundarios - Azul tecnológico para contrastes
  secondary: {
    50: '#EBF8FF',
    100: '#BEE3F8',
    200: '#90CDF4',
    300: '#63B3ED',
    400: '#4299E1',
    500: '#3182CE',
    600: '#2B77CB',
    700: '#2C5AA0',
    800: '#2A4365',
    900: '#1A365D',
  },

  // Calidad del aire - Colores científicamente precisos según EPA
  airQuality: {
    excellent: '#00E400',      // Verde brillante (0-50 AQI)
    good: '#FFFF00',          // Amarillo (51-100 AQI)
    moderate: '#FF7E00',      // Naranja (101-150 AQI)
    unhealthySensitive: '#FF0000', // Rojo (151-200 AQI)
    unhealthy: '#8F3F97',     // Púrpura (201-300 AQI)
    veryUnhealthy: '#7E0023', // Marrón (301-400 AQI)
    hazardous: '#7E0023',     // Marrón oscuro (401-500 AQI)
  },

  // Neutrales modernos
  neutral: {
    0: '#FFFFFF',
    50: '#FAFBFC',
    100: '#F4F6F8', 
    200: '#E4E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#0A0A0A',
  },

  // Estados semánticos
  semantic: {
    success: '#10B981',
    warning: '#F59E0B', 
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Gradientes modernos
  gradients: {
    primary: ['#1ABC9C', '#16A085'],
    secondary: ['#3182CE', '#2C5AA0'],
    danger: ['#EF4444', '#DC2626'],
    success: ['#10B981', '#059669'],
    sunset: ['#FF7E5F', '#FEB47B'],
    ocean: ['#667eea', '#764ba2'],
  },

  // Superficies y fondos
  surface: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Bordes
  border: {
    light: '#E2E8F0',
    medium: '#CBD5E1',
    dark: '#94A3B8',
  },

  // Texto
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
    disabled: '#CBD5E1',
  },
} as const;

// Tipografía moderna
export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
} as const;

// Espaciado consistente
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
  '5xl': 96,
} as const;

// Border radius modernos
export const RADIUS = {
  none: 0,
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  full: 9999,
} as const;

// Sombras profesionales (iOS y Android)
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 16,
  },
} as const;

// Dimensiones y breakpoints
export const LAYOUT = {
  window: {
    width,
    height,
  },
  
  breakpoints: {
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  
  header: {
    height: 60,
  },
  
  tabBar: {
    height: 80,
  },
  
  statusBar: {
    height: 44, // iOS default
  },
} as const;

// Animaciones y timing
export const ANIMATIONS = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// Exportar tema completo
export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
  layout: LAYOUT,
  animations: ANIMATIONS,
} as const;

export type Theme = typeof THEME;