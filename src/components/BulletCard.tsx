import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import Card from '@/components/Card';
import BulletRow from '@/components/BulletRow';
import { IconCheckFilled } from '@/components/Icons';
import { colors, fonts } from '@/theme';

export function BulletCard({ items, kind }: { items: string[]; kind: 'good' | 'bad' }) {
  return (
    <Card padding={0}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {items.map((s, i) => (
          <BulletRow key={i} kind={kind} divider={i < items.length - 1}>{s}</BulletRow>
        ))}
      </ScrollView>
    </Card>
  );
}

export function SummaryCard({ text }: { text: string }) {
  return (
    <Card padding={0}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ marginTop: 1 }}>
            <IconCheckFilled size={16} bg={colors.brandBlue} />
          </View>
          <Text style={styles.summaryText}>{text}</Text>
        </View>
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  summaryText: {
    flex: 1, fontFamily: fonts.sans, fontSize: 14, lineHeight: 20,
    color: colors.textPrimary,
  },
});
