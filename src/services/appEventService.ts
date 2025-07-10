// Simple event service for React Native
class AppEventService {
  private listeners: { [key: string]: (() => void)[] } = {};

  lockApp() {
    this.emit('lockApp');
  }

  onLockApp(callback: () => void) {
    this.on('lockApp', callback);
  }

  offLockApp(callback: () => void) {
    this.off('lockApp', callback);
  }

  private on(event: string, callback: () => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  private off(event: string, callback: () => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  private emit(event: string) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback());
  }
}

export const appEventService = new AppEventService();
