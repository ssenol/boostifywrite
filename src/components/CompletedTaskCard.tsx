import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Card from '@/components/Card';
import { IconChevRight } from '@/components/Icons';
import { colors, fonts, getCefrBand } from '@/theme';
import type { CompletedExercise } from '@/types/api';

type Props = {
  exercise: CompletedExercise;
  onPress: () => void;
};

export default function CompletedTaskCard({ exercise: e, onPress }: Props) {
  const bestAttempt = e.attempts.reduce(
    (best, a) => a.mainScore > best.mainScore ? a : best,
    e.attempts[0],
  );

  if (!bestAttempt) return null;

  const band = getCefrBand(bestAttempt.mainScore);

  return (
    <Card accent={band.color} padding={16} onPress={onPress}>
      <View style={[styles.row, { marginLeft: 6 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{e.taskName}</Text>
          <Text style={styles.when}>
            RETURNED {new Date(e.lastSolvedDate).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric',
            }).toUpperCase()}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.when}>SCORE</Text>
            <Text style={[styles.score, { color: band.color }]}>{bestAttempt.mainScore}</Text>
          </View>
          <IconChevRight size={16} color={colors.textTertiary}/>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title:     { fontFamily: fonts.sansSb, fontSize: 16, color: colors.textPrimary, lineHeight: 22 },
  when:      { fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary, marginTop: 6 },
  score:     { fontFamily: fonts.sansEb, fontSize: 22, lineHeight: 26 },
});
