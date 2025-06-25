export interface AirQualityData {
  id: string;
  timestamp: string;
  deviceId: string;
  pm1: number;
  pm25: number;
  pm10: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  aqi: number; // Air Quality Index calculado
  location?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'emergency';
  level: AirQualityLevel;
  title: string;
  message: string;
  timestamp: string;
  deviceId: string;
  acknowledged: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actions?: AlertAction[];
}

export interface AlertAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary';
  action: () => void;
}

export interface Device {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  lastSeen: string;
  firmwareVersion: string;
  batteryLevel?: number;
  signalStrength?: number;
  sensors: {
    pm1: SensorStatus;
    pm25: SensorStatus;
    pm10: SensorStatus;
    temperature: SensorStatus;
    humidity: SensorStatus;
  };
}

export interface SensorStatus {
  isWorking: boolean;
  lastReading?: number;
  calibrationDate?: string;
}

export type AirQualityLevel = 
  | 'excellent' 
  | 'good' 
  | 'moderate' 
  | 'unhealthySensitive' 
  | 'unhealthy' 
  | 'veryUnhealthy' 
  | 'hazardous';

export interface AirQualityReading {
  level: AirQualityLevel;
  value: number;
  aqi: number;
  color: string;
  label: string;
  description: string;
  recommendations: string[];
  healthEffects: string[];
}

export interface AppSettings {
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    criticalAlertsOnly: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  thresholds: {
    pm25Warning: number;
    pm25Critical: number;
    pm10Warning: number;
    pm10Critical: number;
    customLevels: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    units: 'metric' | 'imperial';
    refreshInterval: number;
    showAdvancedMetrics: boolean;
  };
  location: {
    autoDetect: boolean;
    customName?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  mqtt: {
    brokerUrl: string;
    port: number;
    username?: string;
    password?: string;
    useSSL: boolean;
    topics: {
      airQuality: string;
      alerts: string;
      status: string;
    };
  };
}

// Estados de Redux
export interface AirQualityState {
  current: AirQualityData | null;
  history: AirQualityData[];
  dailyAverages: DailyAverage[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
}

export interface DailyAverage {
  date: string;
  avgPM25: number;
  avgPM10: number;
  avgAQI: number;
  level: AirQualityLevel;
  peakHour: string;
  lowestHour: string;
}

export interface AlertsState {
  items: Alert[];
  unreadCount: number;
  isLoading: boolean;
  filter: 'all' | 'unread' | 'critical' | 'today';
}

export interface DevicesState {
  items: Device[];
  selected: Device | null;
  isLoading: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastConnectionAttempt: string | null;
}

export interface RootState {
  airQuality: AirQualityState;
  alerts: AlertsState;
  devices: DevicesState;
  settings: AppSettings;
}

// Navegación
export type RootStackParamList = {
  Main: undefined;
  Onboarding: undefined;
  DeviceSetup: undefined;
  Settings: undefined;
  AlertDetails: { alertId: string };
  DeviceDetails: { deviceId: string };
  History: { deviceId?: string; period?: string };
  About: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  History: undefined;
  Alerts: undefined;
  Settings: undefined;
};