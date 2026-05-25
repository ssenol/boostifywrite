// Profile / Settings — gerçek kullanıcı verisiyle
import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';

import { ScreenSurface, ScreenScroll } from '@/components/Screen';
import { IconChevRight } from '@/components/Icons';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts, radii, type } from '@/theme';

const SETTINGS = [
  { label: 'Privacy',        value: '' },
  { label: 'Help & support', value: '' },
  { label: 'About',          value: 'v2.1' },
];

export default function Profile() {
  const { user, logout } = useAuth();

  const initials = user
    ? `${user.name[0]}${user.lastName[0]}`.toUpperCase()
    : '?';

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScreenSurface>
      <View style={styles.header}>
        <Text style={[type.label, { marginBottom: 4 }]}>YOUR ACCOUNT</Text>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScreenScroll contentStyle={{ padding: 20, paddingBottom: 110 }}>
        {/* Kimlik */}
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {user ? `${user.name} ${user.lastName}` : '—'}
            </Text>
            <Text style={styles.school}>
              {user?.schoolName?.toUpperCase() ?? ''}
              {user?.campusName ? ` · ${user.campusName.toUpperCase()}` : ''}
            </Text>
          </View>
        </View>

        {/* Ayarlar */}
        <View style={[styles.group, { marginTop: 24 }]}>
          {user && (
            <View style={[styles.row, styles.divider]}>
              <Text style={styles.rowLabel}>Username</Text>
              <Text style={styles.rowValue}>{user.username}</Text>
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
      </ScreenScroll>
    </ScreenSurface>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  headerTitle: { fontFamily: fonts.sansSb, fontSize: 26, letterSpacing: -0.5, color: colors.textPrimary },

  identity: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.brandBlueSoft,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontFamily: fonts.sansEb, fontSize: 22, color: colors.brandBlue },
  name:   { fontFamily: fonts.sansSb, fontSize: 22, color: colors.textPrimary, letterSpacing: -0.3 },
  school: { fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary, letterSpacing: 0.6, marginTop: 3 },

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
});
