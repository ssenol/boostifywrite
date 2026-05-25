// Token ve kullanıcı bilgisini AsyncStorage'da saklar / okur / siler
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types/api';

const KEYS = {
  accessToken:  '@auth/accessToken',
  refreshToken: '@auth/refreshToken',
  user:         '@auth/user',
} as const;

export async function saveAuth(accessToken: string, refreshToken: string, user: User) {
  await AsyncStorage.multiSet([
    [KEYS.accessToken,  accessToken],
    [KEYS.refreshToken, refreshToken],
    [KEYS.user,         JSON.stringify(user)],
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.accessToken);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.refreshToken);
}

export async function getUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(KEYS.user);
  return raw ? (JSON.parse(raw) as User) : null;
}

export async function updateAccessToken(token: string) {
  await AsyncStorage.setItem(KEYS.accessToken, token);
}

export async function clearAuth() {
  await AsyncStorage.multiRemove([KEYS.accessToken, KEYS.refreshToken, KEYS.user]);
}
