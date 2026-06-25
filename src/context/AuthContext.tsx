// Uygulama genelinde auth durumunu yönetir: kullanıcı, login, logout
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, getRefreshToken, saveAuth, clearAuth, updateAccessToken, updateUser as storeUpdateUser } from '@/store/auth';
import { login as apiLogin, refreshToken as apiRefreshToken } from '@/api/auth';
import type { User } from '@/types/api';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUser().then(async (u) => {
      setUser(u);
      setIsLoading(false);

      if (!u) return;
      // Arka planda sessiz yenileme — cache'deki bilgileri sunucuyla güncelle
      try {
        const storedRefreshToken = await getRefreshToken();
        if (!storedRefreshToken) return;
        const res = await apiRefreshToken(storedRefreshToken);
        await updateAccessToken(res.data.accessToken);
        const merged: User = { ...res.data.user, avatarUrl: res.data.user.avatarUrl ?? u.avatarUrl };
        await storeUpdateUser(merged);
        setUser(merged);
      } catch {
        // Sessizce başarısız ol — cached kullanıcı kalır
      }
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

  const updateUser = async (updated: User) => {
    await storeUpdateUser(updated);
    setUser(updated);
  };

  const refreshUserData = async () => {
    const storedRefreshToken = await getRefreshToken();
    if (!storedRefreshToken) return;
    const res = await apiRefreshToken(storedRefreshToken);
    await updateAccessToken(res.data.accessToken);
    // Refresh endpoint avatarUrl döndürmüyor — mevcut değeri koru
    const merged: User = { ...res.data.user, avatarUrl: res.data.user.avatarUrl ?? user?.avatarUrl };
    await storeUpdateUser(merged);
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
