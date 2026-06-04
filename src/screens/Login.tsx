// 01 · Login
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface } from '@/components/Screen';
import { LogoWordmark } from '@/components/Logo';
import Button from '@/components/Button';
import AlertDialog from '@/components/AlertDialog';
import { IconArrow } from '@/components/Icons';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts, radii } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';
import * as Biometric from '@/utils/biometric';
import { login as apiLogin } from '@/api/auth';
import { saveAuth } from '@/store/auth';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<Biometric.BiometricType[]>([]);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingLoginData, setPendingLoginData] = useState<any>(null);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const available = await Biometric.isBiometricAvailable();
    setBiometricAvailable(available);
    
    if (available) {
      const enabled = await Biometric.isBiometricEnabled();
      setBiometricEnabled(enabled);
      const types = await Biometric.getSupportedBiometricTypes();
      setBiometricTypes(types);
      
      // Eğer biyometrik aktifse ve kayıtlı kullanıcı varsa otomatik göster
      if (enabled) {
        const stored = await Biometric.getStoredCredentials();
        if (stored) {
          setUsername(stored.username);
        }
      }
    }
  };

  const performLogin = async () => {
    setLoading(true);
    try {
      // API çağrısı yap ama henüz AuthContext'e set etme
      const res = await apiLogin(username.trim(), password);
      if (res.data.user.role !== 'student') {
        throw new Error('Only student accounts can sign in.');
      }
      
      // Başarılı giriş - biyometrik aktifse credential'ları güncelle
      if (biometricAvailable && biometricEnabled) {
        await Biometric.storeCredentials(username.trim(), password);
      }
      
      // Başarılı giriş sonrası biyometrik prompt göster
      if (biometricAvailable && !biometricEnabled) {
        await Biometric.storeCredentials(username.trim(), password);
        setPendingLoginData({ res, username: username.trim(), password });
        setShowBiometricPrompt(true);
        setLoading(false);
        return; // Prompt gösterilene kadar navigation'u engelle
      }
      
      // Biyometrik prompt yoksa direkt login yap
      await saveAuth(res.data.token, res.data.refreshToken, res.data.user);
      await login(username.trim(), password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not sign in. Please try again.';
      setErrorMessage(msg);
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter your username and password.');
      setShowErrorDialog(true);
      return;
    }
    
    await performLogin();
  };

  const handleEnableBiometric = async () => {
    await Biometric.setBiometricEnabled(true);
    setShowBiometricPrompt(false);
    
    // Pending login'i tamamla
    if (pendingLoginData) {
      const { res } = pendingLoginData;
      await saveAuth(res.data.token, res.data.refreshToken, res.data.user);
      await login(pendingLoginData.username, pendingLoginData.password);
      setPendingLoginData(null);
    }
  };

  const handleDismissBiometric = async () => {
    setShowBiometricPrompt(false);
    
    // Pending login'i tamamla
    if (pendingLoginData) {
      const { res } = pendingLoginData;
      await saveAuth(res.data.token, res.data.refreshToken, res.data.user);
      await login(pendingLoginData.username, pendingLoginData.password);
      setPendingLoginData(null);
    }
  };

  const getBiometricPromptTitle = () => {
    const types = biometricTypes;
    if (types.includes('facial')) return 'Enable Face ID?';
    if (types.includes('fingerprint')) return 'Enable Touch ID?';
    return 'Enable biometric authentication?';
  };

  const getBiometricPromptMessage = () => {
    const types = biometricTypes;
    const name = types.includes('facial') ? 'Face ID' : 
                 types.includes('fingerprint') ? 'Touch ID' : 
                 'biometric authentication';
    return `Sign in faster next time using ${name}. Your credentials will be stored securely on this device.`;
  };

  const handleBiometricLogin = async () => {
    const stored = await Biometric.getStoredCredentials();
    if (!stored) {
      setErrorMessage('Please sign in with your username and password first.');
      setShowErrorDialog(true);
      return;
    }

    const authenticated = await Biometric.authenticateWithBiometric();
    if (authenticated) {
      setLoading(true);
      try {
        await login(stored.username, stored.password);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Could not sign in. Please try again.';
        setErrorMessage(msg);
        setShowErrorDialog(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const getBiometricIcon = () => {
    if (biometricTypes.includes('facial')) return '👤';
    if (biometricTypes.includes('fingerprint')) return '👆';
    return '🔐';
  };

  const getBiometricLabel = () => {
    if (biometricTypes.includes('facial')) return 'Sign in with Face ID';
    if (biometricTypes.includes('fingerprint')) return 'Sign in with Touch ID';
    return 'Sign in with biometrics';
  };

  return (
    <ScreenSurface style={{ backgroundColor: '#ECEDFB' }}>
      <View style={styles.blob}/>

      <View style={styles.body}>
        <View style={{ marginTop: 8 }}>
          <LogoWordmark size={52}/>
        </View>

        <View style={{ marginTop: 90 }}>
          <Text style={styles.hero}>
            Every great essay{' '}
            <Text style={styles.heroEmph}>starts with one sentence.</Text>
          </Text>
          <Text style={styles.subtitle}>Sign in and write yours today.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            onSubmitEditing={handleLogin}
          />
        </View>

        <View style={{ marginTop: 18 }}>
          {loading ? (
            <ActivityIndicator color={colors.brandBlue} style={{ height: 52 }}/>
          ) : (
            <>
              <Button kind="primary" onPress={handleLogin}
                icon={<IconArrow size={18} color="#fff"/>}>
                Sign in
              </Button>
              
              {biometricAvailable && biometricEnabled && (
                <Pressable onPress={handleBiometricLogin} style={styles.biometricBtn}>
                  <Text style={styles.biometricIcon}>{getBiometricIcon()}</Text>
                  <Text style={styles.biometricText}>{getBiometricLabel()}</Text>
                </Pressable>
              )}
            </>
          )}
        </View>

        <View style={{ flex: 1 }}/>
        <Text style={styles.backLink} onPress={() => nav.navigate('OnboardingWelcome')}>
          ← Back to Welcome
        </Text>
      </View>

      <AlertDialog
        visible={showBiometricPrompt}
        title={getBiometricPromptTitle()}
        message={getBiometricPromptMessage()}
        buttons={[
          {
            text: 'Not now',
            style: 'cancel',
            onPress: handleDismissBiometric,
          },
          {
            text: 'Enable',
            onPress: handleEnableBiometric,
          },
        ]}
        onClose={handleDismissBiometric}
      />

      <AlertDialog
        visible={showErrorDialog}
        title="Sign in failed"
        message={errorMessage}
        buttons={[
          {
            text: 'OK',
            onPress: () => setShowErrorDialog(false),
          },
        ]}
        onClose={() => setShowErrorDialog(false)}
      />
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute', left: -50, top: 110,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: colors.brandCream, opacity: 0.9,
  },
  body: { flex: 1, padding: 24 },
  hero: {
    fontFamily: fonts.sansSb, fontSize: 32, lineHeight: 36, letterSpacing: -0.6,
    color: colors.textPrimary
  },
  heroEmph: { fontFamily: fonts.sansEb, color: colors.brandBlue, letterSpacing: -0.6 },
  subtitle: { marginTop: 16, fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.textSecondary },
  form:  { marginTop: 40, gap: 12 },
  input: {
    height: 52, paddingHorizontal: 18,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.pill,
    fontFamily: fonts.sans, fontSize: 15, color: colors.textPrimary,
  },
  backLink: {
    textAlign: 'center', marginBottom: 16,
    fontFamily: fonts.sansSb, fontSize: 14,
    color: colors.brandBlue,
  },
  biometricBtn: {
    marginTop: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
  },
  biometricIcon: {
    fontSize: 20,
  },
  biometricText: {
    fontFamily: fonts.sansSb,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
