// Profile / Settings
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { ScreenSurface, ScreenScroll } from '@/components/Screen';
import IconButton from '@/components/IconButton';
import { IconChevLeft, IconChevRight } from '@/components/Icons';
import { colors, fonts, radii, type } from '@/theme';

const SETTINGS_TOP = [
  { label: 'Target level', value: 'B2' },
  { label: 'Reminder',     value: 'Daily · 18:00' },
  { label: 'Language',     value: 'English' },
  { label: 'School',       value: 'Şehir A.L.' },
];
const SETTINGS_BOT = [
  { label: 'Privacy',       value: '' },
  { label: 'Help & support',value: '' },
  { label: 'About',         value: 'v2.1' },
];

export default function Profile() {
  return (
    <ScreenSurface>
      <View style={styles.header}>
        <IconButton><IconChevLeft size={18} color={colors.textPrimary}/></IconButton>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScreenScroll contentStyle={{ padding: 20, paddingBottom: 110 }}>
        {/* Identity */}
        <View style={styles.identity}>
          <View style={styles.avatar}><Text style={styles.avatarText}>EY</Text></View>
          <View>
            <Text style={styles.name}>Elif Yılmaz</Text>
            <Text style={styles.school}>GRADE 10 · ŞEHIR ANADOLU LISESI</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          {[
            ['LEVEL', 'B1+'],
            ['ESSAYS', '14'],
            ['STREAK', '5d'],
          ].map(([l, v]) => (
            <View key={l} style={styles.stat}>
              <Text style={styles.statLabel}>{l}</Text>
              <Text style={styles.statValue}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Setting groups */}
        <SettingGroup rows={SETTINGS_TOP}/>
        <SettingGroup rows={SETTINGS_BOT}/>

        {/* Sign out */}
        <Pressable style={styles.signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </ScreenScroll>
    </ScreenSurface>
  );
}

function SettingGroup({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <View style={styles.group}>
      {rows.map((r, i) => (
        <Pressable key={r.label} style={[
          styles.row, i < rows.length - 1 && styles.divider,
        ]}>
          <Text style={styles.rowLabel}>{r.label}</Text>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue}>{r.value}</Text>
            <IconChevRight size={14} color={colors.textTertiary}/>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20, paddingVertical: 16,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  headerTitle: { fontFamily: fonts.sansSb, fontSize: 16, color: colors.textPrimary },

  identity: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.brandBlueSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.sansEb, fontSize: 22, color: colors.brandBlue },
  name:   { fontFamily: fonts.sansSb, fontSize: 22, color: colors.textPrimary, letterSpacing: -0.3 },
  school: { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary, letterSpacing: 0.6, marginTop: 2 },

  stats: { flexDirection: 'row', gap: 8, marginTop: 22 },
  stat: {
    flex: 1, backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border, borderRadius: radii.md,
    padding: 14,
  },
  statLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.4, color: colors.textSecondary, marginBottom: 4 },
  statValue: { fontFamily: fonts.monoSb, fontSize: 20, color: colors.textPrimary },

  group: {
    marginTop: 16, backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.lg, overflow: 'hidden',
  },
  row: {
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
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
