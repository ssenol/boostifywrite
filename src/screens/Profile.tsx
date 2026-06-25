// Profile / Settings — gerçek kullanıcı verisiyle
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Switch, StyleSheet, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import { ScreenSurface, ScreenScroll } from '@/components/Screen';
import { IconChevRight, IconCamera } from '@/components/Icons';
import AlertDialog from '@/components/AlertDialog';
import BottomSheet from '@/components/BottomSheet';
import { useAuth } from '@/context/AuthContext';
import { uploadAvatar } from '@/api/auth';
import { colors, fonts, radii, type } from '@/theme';
import * as Biometric from '@/utils/biometric';

const SETTINGS: { label: string; value: string }[] = [
  // { label: 'Privacy',        value: '' },
  // { label: 'Help & Support', value: '' },
  // { label: 'About',          value: 'v1.0' },
];

export default function Profile() {
  const { user, logout, updateUser, refreshUserData } = useAuth();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<Biometric.BiometricType[]>([]);
  const [showDisableBiometricDialog, setShowDisableBiometricDialog] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showResetDataDialog, setShowResetDataDialog] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const initials = user
    ? `${user.name[0]}${user.lastName[0]}`.toUpperCase()
    : '?';

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshUserData(), checkBiometricAvailability()]);
    setRefreshing(false);
  };

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

  const pickAndUpload = async (source: 'library' | 'camera') => {
    setShowAvatarSheet(false);
    // BottomSheet Modal'ının kapanma animasyonu bitmeden (220ms) picker açılırsa
    // iOS iki modal'ı üst üste sunamaz ve picker görünmez — kısa gecikme şart.
    await new Promise(resolve => setTimeout(resolve, 350));
    if (!user) return;

    const perm = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert(
        'Permission required',
        source === 'camera'
          ? 'Camera access is needed to take a photo.'
          : 'Photo library access is needed to choose a photo.',
      );
      return;
    }

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });

    if (result.canceled) return;

    setUploadingAvatar(true);
    try {
      const newUrl = await uploadAvatar(result.assets[0].uri, user);
      await updateUser({ ...user, avatarUrl: newUrl });
    } catch {
      Alert.alert('Upload failed', 'Could not update your profile photo. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarPress = () => setShowAvatarSheet(true);

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

      <ScreenScroll
        contentStyle={{ padding: 16, paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.brandBlue} />}
      >
        {/* Avatar */}
        <Pressable style={styles.avatarContainer} onPress={handleAvatarPress} disabled={uploadingAvatar}>
          <View style={styles.avatar}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
            {uploadingAvatar && (
              <View style={styles.avatarSpinner}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            )}
          </View>
          <View style={styles.avatarBadge}>
            <IconCamera size={13} color="#fff" />
          </View>
        </Pressable>

        {/* Kullanıcı Bilgileri */}
        <View style={styles.group}>
          {user && (
            <View style={[styles.row, styles.divider]}>
              <Text style={styles.rowLabel}>Student Name</Text>
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

          {user?.classInfo[0] && (
              <View style={[styles.row]}>
                <Text style={styles.rowLabel}>Class</Text>
                <Text style={styles.rowValue}>{user.classInfo[0]}</Text>
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
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        {/* Reset Data — yalnızca DEV */}
        {__DEV__ && (
          <Pressable style={styles.resetData} onPress={() => setShowResetDataDialog(true)}>
            <Text style={styles.resetDataText}>Reset All Data</Text>
          </Pressable>
        )}
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
            text: 'Sign out',
            style: 'destructive',
            onPress: () => {
              setShowSignOutDialog(false);
              logout();
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowSignOutDialog(false),
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
            text: 'Reset',
            style: 'destructive',
            onPress: handleResetData,
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowResetDataDialog(false),
          },
        ]}
        onClose={() => setShowResetDataDialog(false)}
      />

      <BottomSheet visible={showAvatarSheet} onClose={() => setShowAvatarSheet(false)} maxHeight="40%">
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Profile photo</Text>
          <Text style={styles.sheetSpot}>Update your photo from your camera or photo library.</Text>
        </View>
        <View style={styles.sheetActions}>
          <Pressable style={[styles.sheetRow, styles.sheetDivider]} onPress={() => pickAndUpload('camera')}>
            <Text style={styles.sheetRowText}>Take a photo</Text>
          </Pressable>
          <Pressable style={styles.sheetRow} onPress={() => pickAndUpload('library')}>
            <Text style={styles.sheetRowText}>Choose from library</Text>
          </Pressable>
        </View>
      </BottomSheet>
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarText: {
    fontFamily: fonts.sansEb,
    fontSize: 32,
    color: colors.brandBlue,
  },
  avatarSpinner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 44,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: '50%',
    transform: [{ translateX: 28 }],
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    backgroundColor: colors.brandBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bgApp,
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
    borderWidth: 1, borderColor: colors.danger, borderRadius: radii.pill,
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

  sheetHeader: {
    paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
    marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: fonts.sansSb, fontSize: 18, color: colors.textPrimary, marginBottom: 4,
  },
  sheetSpot: {
    fontFamily: fonts.sans, fontSize: 13, color: colors.textSecondary, lineHeight: 19,
  },
  sheetActions: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.lg, overflow: 'hidden',
    marginTop: 16,
  },
  sheetRow: {
    paddingVertical: 15, paddingHorizontal: 16,
    backgroundColor: colors.bgCard,
  },
  sheetDivider: {
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  sheetRowText: {
    fontFamily: fonts.sansSb, fontSize: 15, color: colors.textPrimary,
  },
});
