// BulletRow — Strength / Work-on listeleri için (yeşil check ya da mor uyarı).
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/theme';
import { IconCheckFilled, IconAlertFilled } from './Icons';

type Props = { kind?: 'good' | 'bad'; children: string; divider?: boolean };

export default function BulletRow({ kind = 'good', children, divider = true }: Props) {
  return (
    <View style={[styles.row, divider && styles.divider]}>
      <View style={{ marginTop: 1 }}>
        {kind === 'good'
          ? <IconCheckFilled size={20} bg={colors.success}/>
          : <IconAlertFilled size={20} bg={colors.rubricTask}/>}
      </View>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: 12,
  },
  divider: {
    borderBottomWidth: 1, borderBottomColor: colors.hairline,
    borderStyle: 'dashed',
  },
  text: {
    flex: 1, fontFamily: fonts.sans, fontSize: 15, lineHeight: 21,
    color: colors.textPrimary,
  },
});
