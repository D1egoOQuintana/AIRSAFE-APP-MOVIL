import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/auth/LoginScreen';
import { RootNavigator } from './src/navigation';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPhone, setUserPhone] = useState('');

  const handleLogin = (phone: string) => {
    setUserPhone(phone);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserPhone('');
  };

  return (
    <>
      <StatusBar style="auto" />
      {isAuthenticated ? (
        <RootNavigator />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </>
  );
}
