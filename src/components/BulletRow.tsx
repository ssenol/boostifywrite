// BulletRow — Strength / Work-on listeleri için (yeşil check ya da mor uyarı).
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/theme';
import { IconCheckFilled, IconAlertFilled } from './Icons';

type Props = { kind?: 'good' | 'bad'; children: string; divider?: boolean };

export default function BulletRow({ kind = 'good', children, divider = true }: Props) {
  return (
    <View style={[styles.row, divider && styles.divider]}>
      <View style={{ marginTop: 2 }}>
        {kind === 'good'
          ? <IconCheckFilled size={16} bg={colors.success}/>
          : <IconAlertFilled size={16} bg={colors.orange}/>}
      </View>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    paddingVertical: 6,
  },
  divider: {
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
    borderStyle: 'dashed',
  },
  text: {
    flex: 1, fontFamily: fonts.sans, fontSize: 14, lineHeight: 20,
    color: colors.textPrimary,
  },
});
