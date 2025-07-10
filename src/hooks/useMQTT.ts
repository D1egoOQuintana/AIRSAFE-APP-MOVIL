// src/hooks/useMQTT.ts
// Hook para gestionar conexión y datos MQTT

import { useState, useEffect, useCallback } from 'react';
import mqttManager from '../services/MqttManager';
import  alertService  from '../services/alertService';

export interface MqttData {
  pm1: string | null;
  pm25: string | null;
  pm10: string | null;
  temperature: string | null;
  humidity: string | null;
  wifi_signal: string | null;
  air_quality: string | null;
  alert_level: string | null;
  status: string | null;
  emergency: string | null;
  lastUpdate: string | null;
  // Permitir propiedades adicionales opcionales
  [key: string]: any;
}

export function useMQTT() {
  const [data, setData] = useState<MqttData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // Handlers para eventos MQTT
  const handleConnected = useCallback(() => {
    console.log('✅ useMQTT: Conectado al broker MQTT');
    setIsConnected(true);
    setConnectionStatus('connected');
    setError(null);
  }, []);

  const handleDisconnected = useCallback(() => {
    console.log('❌ useMQTT: Desconectado del broker MQTT');
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const handleConnectionLost = useCallback((response: any) => {
    console.warn('⚠️ useMQTT: Conexión perdida:', response);
    setIsConnected(false);
    setConnectionStatus('reconnecting');
  }, []);

  const handleError = useCallback((error: any) => {
    console.error('❌ useMQTT: Error:', error);
    setError(error.message || 'Error de conexión MQTT');
    setIsConnected(false);
    setConnectionStatus('error');
  }, []);

  const handleDataUpdate = useCallback((mqttData: any) => {
    console.log('📊 useMQTT: Datos actualizados:', mqttData.sensorData);
    setData(mqttData.sensorData);
  }, []);

  const handleDataLoaded = useCallback((loadedData: MqttData) => {
    console.log('📂 useMQTT: Datos cargados desde storage:', loadedData);
    setData(loadedData);
  }, []);

  // Inicializar conexión
  const connect = useCallback(() => {
    console.log('🔌 useMQTT: Iniciando conexión...');
    setConnectionStatus('connecting');
    mqttManager.connect();
  }, []);

  // Reconectar manualmente
  const reconnect = useCallback(() => {
    console.log('🔄 useMQTT: Reconectando...');
    setConnectionStatus('reconnecting');
    mqttManager.reconnect();
  }, []);

  // Desconectar
  const disconnect = useCallback(() => {
    console.log('🔌 useMQTT: Desconectando...');
    mqttManager.disconnect();
  }, []);

  // Publicar mensaje
  const publish = useCallback((topic: string, message: string) => {
    mqttManager.publish(topic, message);
  }, []);

  // Obtener datos actuales
  const getCurrentData = useCallback(() => {
    return mqttManager.getCurrentData();
  }, []);

  // Obtener estado de conexión
  const getConnectionStatus = useCallback(() => {
    return mqttManager.getConnectionStatus();
  }, []);

  // Configurar servicio de alertas
  useEffect(() => {
    mqttManager.setAlertService(alertService);
  }, []);

  // Configurar listeners
  useEffect(() => {
    // Suscribirse a eventos
    mqttManager.on('connected', handleConnected);
    mqttManager.on('disconnected', handleDisconnected);
    mqttManager.on('connectionLost', handleConnectionLost);
    mqttManager.on('error', handleError);
    mqttManager.on('dataUpdate', handleDataUpdate);
    mqttManager.on('dataLoaded', handleDataLoaded);

    // Cargar datos iniciales desde storage
    mqttManager.loadDataFromStorage();

    // Obtener datos actuales si existen
    const currentData = mqttManager.getCurrentData();
    if (currentData && currentData.lastUpdate) {
      setData({
        ...currentData,
        temperature: currentData.temperature ?? null,
      });
    }

    // Obtener estado de conexión actual
    const status = mqttManager.getConnectionStatus();
    setIsConnected(status.isConnected);

    // Cleanup
    return () => {
      mqttManager.removeAllListeners();
    };
  }, [handleConnected, handleDisconnected, handleConnectionLost, handleError, handleDataUpdate, handleDataLoaded]);

  // Auto-conectar al montar
  useEffect(() => {
    if (!isConnected && connectionStatus === 'disconnected') {
      connect();
    }
  }, [connect, isConnected, connectionStatus]);

  return {
    data,
    isConnected,
    connectionStatus,
    error,
    connect,
    reconnect,
    disconnect,
    publish,
    getCurrentData,
    getConnectionStatus
  };
}
