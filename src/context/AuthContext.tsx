// Uygulama genelinde auth durumunu yönetir: kullanıcı, login, logout
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getUser, getRefreshToken, saveAuth, clearAuth, updateAccessToken, updateUser as storeUpdateUser } from '@/store/auth';
import { login as apiLogin, loginWithSsoToken as apiLoginWithSsoToken, refreshToken as apiRefreshToken } from '@/api/auth';
import type { LoginResponse, User } from '@/types/api';

// Öğretmen vb. hesaplar app'e giremez; mesaj kullanıcıya olduğu gibi gösterilir
export class NotStudentError extends Error {
  constructor() {
    super('Only student accounts can sign in.');
    this.name = 'NotStudentError';
  }
}

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithSsoToken: (ssoToken: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Her giriş/çıkışta artar: arka plandaki sessiz yenileme bitene kadar oturum değiştiyse (SSO ile
  // başka öğrenciye geçiş) eski kullanıcının token'ı yeni oturumun üzerine yazılmasın
  const sessionRef = useRef(0);

  useEffect(() => {
    getUser().then(async (u) => {
      setUser(u);
      setIsLoading(false);

      if (!u) return;
      // Arka planda sessiz yenileme — cache'deki bilgileri sunucuyla güncelle
      const session = sessionRef.current;
      try {
        const storedRefreshToken = await getRefreshToken();
        if (!storedRefreshToken) return;
        const res = await apiRefreshToken(storedRefreshToken);
        if (session !== sessionRef.current) return;
        await updateAccessToken(res.data.accessToken);
        const merged: User = { ...res.data.user, avatarUrl: res.data.user.avatarUrl ?? u.avatarUrl };
        await storeUpdateUser(merged);
        setUser(merged);
      } catch {
        // Sessizce başarısız ol — cached kullanıcı kalır
      }
    });
  }, []);

  // /auth/login ve /auth/sso-mobile ortak yanıtı: öğrenci kontrolü + oturumu kaydet
  const startSession = useCallback(async (res: LoginResponse) => {
    if (res.data.user.role !== 'student') {
      throw new NotStudentError();
    }
    sessionRef.current += 1;
    await saveAuth(res.data.token, res.data.refreshToken, res.data.user);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const login = async (username: string, password: string) => {
    await startSession(await apiLogin(username, password));
  };

  // Web'den (service.ueslms) deep link ile gelen SSO token'ıyla giriş; açık oturum varsa yerine geçer
  const loginWithSsoToken = useCallback(async (ssoToken: string) => {
    return startSession(await apiLoginWithSsoToken(ssoToken));
  }, [startSession]);

  const logout = async () => {
    sessionRef.current += 1;
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
    <AuthContext.Provider value={{ user, isLoading, login, loginWithSsoToken, logout, updateUser, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
