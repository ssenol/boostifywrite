// Profile / Settings — gerçek kullanıcı verisiyle
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ScreenSurface, ScreenScroll } from '@/components/Screen';
import { IconChevRight } from '@/components/Icons';
import AlertDialog from '@/components/AlertDialog';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts, radii, type } from '@/theme';
import * as Biometric from '@/utils/biometric';

const SETTINGS = [
  { label: 'Privacy',        value: '' },
  { label: 'Help & support', value: '' },
  { label: 'About',          value: 'v2.1' },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<Biometric.BiometricType[]>([]);
  const [showDisableBiometricDialog, setShowDisableBiometricDialog] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showResetDataDialog, setShowResetDataDialog] = useState(false);

  const initials = user
    ? `${user.name[0]}${user.lastName[0]}`.toUpperCase()
    : '?';

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
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Biyometrik aktif etme
      const authenticated = await Biometric.authenticateWithBiometric();
      if (authenticated) {
        await Biometric.setBiometricEnabled(true);
        setBiometricEnabled(true);
      }
    } else {
      // Biyometrik devre dışı bırakma
      setShowDisableBiometricDialog(true);
    }
  };

  const handleDisableBiometric = async () => {
    await Biometric.clearStoredCredentials();
    setBiometricEnabled(false);
    setShowDisableBiometricDialog(false);
  };

  const getBiometricLabel = () => {
    if (biometricTypes.includes('facial')) return 'Face ID';
    if (biometricTypes.includes('fingerprint')) return 'Touch ID';
    return 'Biometric login';
  };

  const handleSignOut = () => {
    setShowSignOutDialog(true);
  };

  const handleResetData = async () => {
    // Tüm AsyncStorage verilerini temizle
    await AsyncStorage.clear();
    // Biyometrik credential'ları temizle
    await Biometric.clearStoredCredentials();
    // Logout yap
    setShowResetDataDialog(false);
    logout();
  };

  return (
    <ScreenSurface>
      <View style={styles.header}>
        <Text style={[type.label, { marginBottom: 4 }]}>YOUR ACCOUNT</Text>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScreenScroll contentStyle={{ padding: 16, paddingBottom: 110 }}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {/* Kullanıcı Bilgileri */}
        <View style={styles.group}>
          {user && (
            <View style={[styles.row, styles.divider]}>
              <Text style={styles.rowLabel}>Student</Text>
              <Text style={styles.rowValue}>{`${user.name} ${user.lastName}`}</Text>
            </View>
          )}

          {user && (
            <View style={[styles.row, styles.divider]}>
              <Text style={styles.rowLabel}>Username</Text>
              <Text style={styles.rowValue}>{user.username}</Text>
            </View>
          )}

          {user?.schoolName && (
            <View style={[styles.row, styles.divider]}>
              <Text style={styles.rowLabel}>School</Text>
              <Text style={styles.rowValue}>{user.schoolName}</Text>
            </View>
          )}

          {user?.campusName && (
            <View style={[styles.row, styles.divider]}>
              <Text style={styles.rowLabel}>Campus</Text>
              <Text style={styles.rowValue}>{user.campusName}</Text>
            </View>
          )}

          {user?.className && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Class</Text>
              <Text style={styles.rowValue}>{user.className}</Text>
            </View>
          )}
        </View>

        {/* Sistem Ayarları */}
        <View style={[styles.group, { marginTop: 16 }]}>
          {biometricAvailable && (
            <View style={[styles.row, styles.divider]}>
              <Text style={styles.rowLabel}>{getBiometricLabel()}</Text>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: colors.border, true: colors.brandBlue }}
                thumbColor="#fff"
              />
            </View>
          )}
          {SETTINGS.map((r, i) => (
            <Pressable key={r.label} style={[
              styles.row, i < SETTINGS.length - 1 && styles.divider,
            ]}>
              <Text style={styles.rowLabel}>{r.label}</Text>
              <View style={styles.rowRight}>
                {r.value ? <Text style={styles.rowValue}>{r.value}</Text> : null}
                <IconChevRight size={14} color={colors.textTertiary}/>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Çıkış */}
        <Pressable style={styles.signOut} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        {/* Reset Data */}
        <Pressable style={styles.resetData} onPress={() => setShowResetDataDialog(true)}>
          <Text style={styles.resetDataText}>Reset all data</Text>
        </Pressable>
      </ScreenScroll>

      <AlertDialog
        visible={showDisableBiometricDialog}
        title="Disable biometric login"
        message="Your saved credentials will be removed. Are you sure?"
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setShowDisableBiometricDialog(false);
              setBiometricEnabled(true); // Switch'i geri çevir
            },
          },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: handleDisableBiometric,
          },
        ]}
        onClose={() => {
          setShowDisableBiometricDialog(false);
          setBiometricEnabled(true); // Switch'i geri çevir
        }}
      />

      <AlertDialog
        visible={showSignOutDialog}
        title="Sign out"
        message="Are you sure you want to sign out?"
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowSignOutDialog(false),
          },
          {
            text: 'Sign out',
            style: 'destructive',
            onPress: () => {
              setShowSignOutDialog(false);
              logout();
            },
          },
        ]}
        onClose={() => setShowSignOutDialog(false)}
      />

      <AlertDialog
        visible={showResetDataDialog}
        title="Reset all data"
        message="This will clear all app data including biometric settings, cached content, and preferences. You will be signed out. This action cannot be undone."
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowResetDataDialog(false),
          },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: handleResetData,
          },
        ]}
        onClose={() => setShowResetDataDialog(false)}
      />
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16, paddingVertical: 16,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  headerTitle: { fontFamily: fonts.sansSb, fontSize: 26, letterSpacing: -0.5, color: colors.textPrimary },

  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 88, 
    height: 88, 
    borderRadius: 44,
    backgroundColor: colors.brandBlueSoft,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  avatarText: { 
    fontFamily: fonts.sansEb, 
    fontSize: 32, 
    color: colors.brandBlue,
  },

  group: {
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.lg, overflow: 'hidden',
  },
  
  row: {
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  divider:  { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  rowLabel: { fontFamily: fonts.sans, fontSize: 14, color: colors.textSecondary },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontFamily: fonts.sansSb, fontSize: 14, color: colors.textPrimary },

  signOut: {
    marginTop: 16, padding: 14,
    borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill,
    alignItems: 'center',
  },
  signOutText: { fontFamily: fonts.sansSb, fontSize: 14, color: colors.danger },
  
  resetData: {
    marginTop: 50,
    alignItems: 'center',
  },
  resetDataText: { 
    fontFamily: fonts.sansSb, 
    fontSize: 13, 
    color: colors.textTertiary,
    textDecorationLine: 'underline',
  },
});
