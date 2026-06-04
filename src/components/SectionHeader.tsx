// SectionHeader — küçük caps label + ince ayraç çizgi
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, type } from '@/theme';

type Props = { label: string; right?: string; onViewAll?: () => void };

export default function SectionHeader({ label, right, onViewAll }: Props) {
  return (
    <View style={styles.row}>
      <Text style={type.label}>{label}</Text>
      <View style={styles.rule}/>
      {right ? <Text style={type.label}>{right}</Text> : null}
      {onViewAll && (
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text style={styles.viewAll}>View all</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 8,
  },
  rule: { flex: 1, height: 1, backgroundColor: colors.hairline },
  viewAll: { fontFamily: fonts.sansSb, fontSize: 12, color: colors.brandBlue, letterSpacing: 0.3 },
});
