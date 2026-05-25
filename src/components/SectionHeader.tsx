// SectionHeader — küçük caps label + ince ayraç çizgi
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, type } from '@/theme';

type Props = { label: string; right?: string };

export default function SectionHeader({ label, right }: Props) {
  return (
    <View style={styles.row}>
      <Text style={type.label}>{label}</Text>
      <View style={styles.rule}/>
      {right ? <Text style={type.label}>{right}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 8,
  },
  rule: { flex: 1, height: 1, backgroundColor: colors.hairline },
});
