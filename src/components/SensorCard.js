// src/components/SensorCard.js
// Tarjeta individual para mostrar datos de sensores

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatSensorValue } from '../utils/airQuality';

const { width } = Dimensions.get('window');

const SensorCard = ({
  title,
  value,
  unit,
  icon,
  color,
  bgColor,
  description,
  onPress,
  isConnected = true,
  lastUpdate,
  trend = null // 'up', 'down', 'stable'
}) => {
  const [scaleAnim] = React.useState(new Animated.Value(1));

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) {
      onPress();
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      case 'stable':
        return 'remove';
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#EF4444';
      case 'down':
        return '#22C55E';
      case 'stable':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={[bgColor, bgColor + '80']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              {!isConnected && (
                <View style={styles.disconnectedIndicator}>
                  <Ionicons name="cellular" size={12} color="#EF4444" />
                </View>
              )}
            </View>
            {trend && (
              <View style={styles.trendContainer}>
                <Ionicons
                  name={getTrendIcon()}
                  size={16}
                  color={getTrendColor()}
                />
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
              <Text style={styles.iconText}>{icon}</Text>
            </View>

            {/* Value */}
            <View style={styles.valueContainer}>
              <Text style={[styles.value, { color: color }]}>
                {formatSensorValue(value, unit)}
              </Text>
              {description && (
                <Text style={styles.description} numberOfLines={2}>
                  {description}
                </Text>
              )}
            </View>
          </View>

          {/* Footer */}
          {lastUpdate && (
            <View style={styles.footer}>
              <Ionicons name="time" size={10} color="#6B7280" />
              <Text style={styles.lastUpdate}>
                {getTimeAgo(lastUpdate)}
              </Text>
            </View>
          )}

          {/* Status Indicator */}
          <View style={[styles.statusIndicator, { backgroundColor: isConnected ? '#22C55E' : '#EF4444' }]} />
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Función para calcular tiempo transcurrido
function getTimeAgo(timestamp) {
  if (!timestamp) return 'Sin datos';
  
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}

const styles = StyleSheet.create({
  container: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradient: {
    padding: 16,
    minHeight: 140,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 4,
  },
  disconnectedIndicator: {
    marginLeft: 4,
  },
  trendContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  valueContainer: {
    flex: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  description: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  lastUpdate: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 4,
  },
  statusIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default SensorCard;
