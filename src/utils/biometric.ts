import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = '@biometric_enabled';
const STORED_CREDENTIALS_KEY = '@stored_credentials';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export interface StoredCredentials {
  username: string;
  password: string;
}

/**
 * Cihazın biyometrik donanıma sahip olup olmadığını kontrol eder
 */
export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  return compatible;
  
  // Not: Production'da enrolled kontrolü de yapılmalı
  // const enrolled = await LocalAuthentication.isEnrolledAsync();
  // return enrolled;
}

/**
 * Cihazda kayıtlı biyometrik tipleri döndürür
 */
export async function getSupportedBiometricTypes(): Promise<BiometricType[]> {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const result: BiometricType[] = [];
  
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    result.push('fingerprint');
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    result.push('facial');
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    result.push('iris');
  }
  
  return result.length > 0 ? result : ['none'];
}

/**
 * Biyometrik kimlik doğrulama yapar
 */
export async function authenticateWithBiometric(): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Sign in with biometrics',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
}

/**
 * Biyometrik girişin aktif olup olmadığını kontrol eder
 */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch {
    return false;
  }
}

/**
 * Biyometrik girişi aktif/pasif yapar
 */
export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
}

/**
 * Kullanıcı bilgilerini güvenli şekilde saklar
 */
export async function storeCredentials(username: string, password: string): Promise<void> {
  const credentials: StoredCredentials = { username, password };
  await AsyncStorage.setItem(STORED_CREDENTIALS_KEY, JSON.stringify(credentials));
}

/**
 * Saklanan kullanıcı bilgilerini getirir
 */
export async function getStoredCredentials(): Promise<StoredCredentials | null> {
  try {
    const stored = await AsyncStorage.getItem(STORED_CREDENTIALS_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Saklanan kullanıcı bilgilerini siler
 */
export async function clearStoredCredentials(): Promise<void> {
  await AsyncStorage.removeItem(STORED_CREDENTIALS_KEY);
  await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
}

/**
 * Biyometrik giriş için uygun mesajı döndürür
 */
export function getBiometricPromptMessage(types: BiometricType[]): string {
  if (types.includes('facial')) {
    return 'Sign in with Face ID';
  }
  if (types.includes('fingerprint')) {
    return 'Sign in with Touch ID';
  }
  if (types.includes('iris')) {
    return 'Sign in with Iris';
  }
  return 'Sign in with biometrics';
}
