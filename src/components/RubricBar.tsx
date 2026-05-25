// RubricBar — bir dimension'ın skor + level + progress göstergesi.
//   Results Overview ekranında 4 kez tekrarlanır.
import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/theme';
import Card from './Card';
import ProgressBar from './ProgressBar';
import { IconChevRight } from './Icons';

type Props = {
  label: string;
  score: number; max?: number;
  level: string; color: string;
  onPress?: () => void;
};

export default function RubricBar({ label, score, max = 9, level, color, onPress }: Props) {
  const pct = (score / max) * 100;
  return (
    <Card accent={color} padding={14} onPress={onPress}>
      <View style={styles.row}>
        <View style={{ marginLeft: 8, flex: 1 }}>
          <View style={styles.top}>
            <Text style={styles.title}>{label}</Text>
            <View style={styles.right}>
              <Text style={[styles.level, { color }]}>{level}</Text>
              <IconChevRight size={14} color={color}/>
            </View>
          </View>
          <View style={{ marginTop: 8 }}>
            <ProgressBar value={pct} color={color} height={4}/>
          </View>
          <View style={styles.bottom}>
            <Text style={styles.scoreText}>{score}/{max}</Text>
            <Text style={styles.hintText}>tap for details →</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  title: { fontFamily: fonts.sansSb, fontSize: 17, color: colors.textPrimary, letterSpacing: -0.3 },
  level: { fontFamily: fonts.monoSb, fontSize: 20 },
  bottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 8,
  },
  scoreText: { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary },
  hintText:  { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary },
});
