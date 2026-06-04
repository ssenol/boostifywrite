// 01 · Login
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenSurface } from '@/components/Screen';
import { LogoWordmark } from '@/components/Logo';
import Button from '@/components/Button';
import { IconArrow } from '@/components/Icons';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts, radii } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your username and password.');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
      // AuthContext user state güncellenir → navigation otomatik Main'e geçer
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not sign in. Please try again.';
      Alert.alert('Sign in failed', msg);
    } finally {
      setLoading(false);
    }
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
            <Button kind="primary" onPress={handleLogin}
              icon={<IconArrow size={18} color="#fff"/>}>
              Sign in
            </Button>
          )}
        </View>

        <View style={{ flex: 1 }}/>
        <Text style={styles.backLink} onPress={() => nav.navigate('OnboardingWelcome')}>
          ← Back to Welcome
        </Text>
      </View>
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
});
