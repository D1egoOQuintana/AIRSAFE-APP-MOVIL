import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SLIDER_WIDTH = screenWidth * 0.8;
const SLIDER_HEIGHT = 60;
const THUMB_SIZE = 50;
const UNLOCK_THRESHOLD = SLIDER_WIDTH - THUMB_SIZE - 20;

interface SwipeToUnlockScreenProps {
  onUnlock: () => void;
}

export default function SwipeToUnlockScreen({ onUnlock }: SwipeToUnlockScreenProps) {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        const newX = Math.max(0, Math.min(gestureState.dx, UNLOCK_THRESHOLD));
        translateX.setValue(newX);
      },
      onPanResponderRelease: (event, gestureState) => {
        if (gestureState.dx >= UNLOCK_THRESHOLD) {
          // Unlock animation
          setIsUnlocking(true);
          
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: UNLOCK_THRESHOLD,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.timing(opacity, {
              toValue: 0.3,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.timing(scale, {
              toValue: 1.2,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start(() => {
            setTimeout(() => {
              onUnlock();
            }, 300);
          });
        } else {
          // Reset animation
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: false,
              tension: 120,
              friction: 8,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/air-safe.png')}
      style={styles.container}
      blurRadius={10}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      >
        <View style={styles.content}>
          {/* Header con tiempo */}
          <View style={styles.header}>
            <Text style={styles.timeText}>{getCurrentTime()}</Text>
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
          </View>

          {/* Logo y título */}
          <View style={styles.logoContainer}>
            <Animated.View style={[styles.logoWrapper, { transform: [{ scale }] }]}>
              <View style={styles.logoBackground}>
                <Ionicons name="shield-checkmark" size={60} color="#1ABC9C" />
              </View>
            </Animated.View>
            <Text style={styles.appTitle}>AirSafe</Text>
            <Text style={styles.appSubtitle}>Sistema de Monitoreo de Calidad del Aire</Text>
          </View>

          {/* Slider de desbloqueo */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <Animated.View
                style={[
                  styles.sliderFill,
                  {
                    width: translateX.interpolate({
                      inputRange: [0, UNLOCK_THRESHOLD],
                      outputRange: [0, SLIDER_WIDTH],
                      extrapolate: 'clamp',
                    }),
                    opacity: opacity.interpolate({
                      inputRange: [0.3, 1],
                      outputRange: [0.8, 0.3],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              />
              
              <Text style={styles.sliderText}>
                {isUnlocking ? 'Desbloqueando...' : 'Desliza para desbloquear'}
              </Text>
              
              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  styles.sliderThumb,
                  {
                    transform: [{ translateX }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#1ABC9C', '#16A085']}
                  style={styles.thumbGradient}
                >
                  <Ionicons 
                    name="chevron-forward" 
                    size={24} 
                    color="white" 
                  />
                </LinearGradient>
              </Animated.View>
            </View>
          </View>

          {/* Información adicional */}
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="wifi" size={16} color="#1ABC9C" />
              <Text style={styles.infoText}>Conectado</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="battery-full" size={16} color="#1ABC9C" />
              <Text style={styles.infoText}>100%</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dateText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
    textTransform: 'capitalize',
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoWrapper: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(26,188,156,0.3)',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    maxWidth: 250,
  },
  sliderContainer: {
    marginBottom: 40,
  },
  sliderTrack: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    borderRadius: SLIDER_HEIGHT / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: 'rgba(26,188,156,0.4)',
    borderRadius: SLIDER_HEIGHT / 2,
  },
  sliderText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    left: 5,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  thumbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: THUMB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  infoText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500',
  },
});
