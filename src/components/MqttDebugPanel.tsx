// src/components/MqttDebugPanel.tsx
// Panel de debug para monitorear MQTT en tiempo real

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import mqttManager from '../services/MqttManager';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';


interface MqttMessage {
  topic: string;
  payload: string;
  timestamp: string;
}

export function MqttDebugPanel() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MqttMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<any>({});
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Configurar listeners
    const handleConnected = () => {
      setIsConnected(true);
      updateConnectionStatus();
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      updateConnectionStatus();
    };

    const handleDataUpdate = (data: any) => {
      const newMessage: MqttMessage = {
        topic: data.topic,
        payload: data.payload,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [newMessage, ...prev.slice(0, 19)]); // Mantener últimos 20
    };

    mqttManager.on('connected', handleConnected);
    mqttManager.on('disconnected', handleDisconnected);
    mqttManager.on('connectionLost', handleDisconnected);
    mqttManager.on('dataUpdate', handleDataUpdate);

    // Estado inicial
    updateConnectionStatus();

    return () => {
      mqttManager.removeAllListeners();
    };
  }, []);

  const updateConnectionStatus = () => {
    const status = mqttManager.getConnectionStatus();
    setConnectionStatus(status);
    setIsConnected(status.isConnected);
  };

  const handleReconnect = () => {
    Alert.alert(
      'Reconectar MQTT',
      '¿Desea reconectar al broker MQTT?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Reconectar', 
          onPress: () => mqttManager.reconnect() 
        }
      ]
    );
  };

  const handleClearMessages = () => {
    setMessages([]);
  };

  if (!isExpanded) {
    return (
      <TouchableOpacity 
        style={styles.collapsedContainer}
        onPress={() => setIsExpanded(true)}
      >
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isConnected ? COLORS.success : COLORS.danger }
          ]} />
          <Text style={styles.statusText}>
            MQTT {isConnected ? 'Conectado' : 'Desconectado'}
          </Text>
          <Text style={styles.messageCount}>
            {messages.length} msgs
          </Text>
        </View>
        <Ionicons name="chevron-up" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.expandedContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>MQTT Debug</Text>
        <TouchableOpacity onPress={() => setIsExpanded(false)}>
          <Ionicons name="chevron-down" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statusSection}>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isConnected ? COLORS.success : COLORS.danger }
          ]} />
          <Text style={styles.statusLabel}>
            Estado: {isConnected ? 'Conectado' : 'Desconectado'}
          </Text>
        </View>
        
        <Text style={styles.statusDetail}>
          Broker: {connectionStatus.broker || 'N/A'}
        </Text>
        <Text style={styles.statusDetail}>
          Topics: {connectionStatus.topics || 0}
        </Text>
        <Text style={styles.statusDetail}>
          Intentos: {connectionStatus.connectionAttempts || 0}/{connectionStatus.maxReconnectAttempts || 0}
        </Text>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={handleReconnect}>
          <Ionicons name="refresh" size={16} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Reconectar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleClearMessages}>
          <Ionicons name="trash" size={16} color={COLORS.warning} />
          <Text style={styles.actionButtonText}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.messagesSection}>
        <Text style={styles.messagesTitle}>
          Mensajes recientes ({messages.length})
        </Text>
        
        <ScrollView style={styles.messagesList} showsVerticalScrollIndicator={false}>
          {messages.length === 0 ? (
            <Text style={styles.noMessages}>No hay mensajes</Text>
          ) : (
            messages.map((message, index) => (
              <View key={`${message.timestamp}-${index}`} style={styles.messageItem}>
                <Text style={styles.messageTopic}>{message.topic}</Text>
                <Text style={styles.messagePayload} numberOfLines={2}>
                  {message.payload}
                </Text>
                <Text style={styles.messageTime}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: 8,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  messageCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  expandedContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: 12,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  statusSection: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statusLabel: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textPrimary,
  },
  statusDetail: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  actionsSection: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  actionButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
  },
  messagesSection: {
    padding: SPACING.md,
  },
  messagesTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  messagesList: {
    maxHeight: 200,
  },
  noMessages: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  messageItem: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  messageTopic: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  messagePayload: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    marginVertical: 2,
  },
  messageTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
  },
});

export default MqttDebugPanel;
