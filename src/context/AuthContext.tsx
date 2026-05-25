// Uygulama genelinde auth durumunu yönetir: kullanıcı, login, logout
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, saveAuth, clearAuth } from '@/store/auth';
import { login as apiLogin } from '@/api/auth';
import type { User } from '@/types/api';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUser().then(u => {
      setUser(u);
      setIsLoading(false);
    });
  }, []);

  const login = async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    if (res.data.user.role !== 'student') {
      throw new Error('Only student accounts can sign in.');
    }
    await saveAuth(res.data.token, res.data.refreshToken, res.data.user);
    setUser(res.data.user);
  };

  const logout = async () => {
    await clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
