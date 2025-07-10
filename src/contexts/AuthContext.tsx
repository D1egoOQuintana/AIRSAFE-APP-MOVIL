import React, { createContext, useContext } from 'react';

interface AuthContextType {
  handleLock: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode; handleLock: () => Promise<void> }> = ({ 
  children, 
  handleLock 
}) => {
  return (
    <AuthContext.Provider value={{ handleLock }}>
      {children}
    </AuthContext.Provider>
  );
};
