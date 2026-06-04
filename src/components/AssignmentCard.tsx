import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Card from '@/components/Card';
import LevelBadge from '@/components/LevelBadge';
import { colors, fonts } from '@/theme';
import type { AssignedExercise } from '@/types/api';

function formatDue(dueDate: string): { label: string; isToday: boolean; isOverdue: boolean } {
  const diffDays = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  if (diffDays < 0)   return { label: `Overdue · ${Math.abs(diffDays)}d`, isToday: false, isOverdue: true };
  if (diffDays === 0) return { label: 'Due today',     isToday: true,  isOverdue: false };
  if (diffDays === 1) return { label: 'Due tomorrow',  isToday: false, isOverdue: false };
  return { label: `Due in ${diffDays}d`, isToday: false, isOverdue: false };
}

type Props = { exercise: AssignedExercise; onPress: () => void };

export default function AssignmentCard({ exercise: ex, onPress }: Props) {
  const meta = ex.assignmentMetaData.details;
  const due  = formatDue(ex.dueDate);

  return (
    <Card accent={colors.rubricTask} padding={16} onPress={onPress}>
      <View style={{ marginLeft: 6 }}>
        <View style={styles.chipsRow}>
          <LevelBadge level={meta.cefrLevel} size="sm"/>
          {meta.writingGenre && <Text style={styles.chipType}>{meta.writingGenre}</Text>}
          {meta.minWordCount && (
            <>
              <Text style={styles.chipDot}>·</Text>
              <Text style={styles.chipLen}>
                {meta.minWordCount}{meta.maxWordCount ? `–${meta.maxWordCount}` : '+'}w
              </Text>
            </>
          )}
          <Text style={[styles.dueText, {
            marginLeft: 'auto',
            color: due.isOverdue ? colors.danger : due.isToday ? colors.brandBlue : colors.textSecondary,
          }]}>{due.label}</Text>
        </View>
        <Text style={styles.title}>{ex.name}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  chipsRow: { flexDirection: 'row', alignItems: 'center', columnGap: 10, rowGap: 8, flexWrap: 'wrap' },
  chipType: { fontFamily: fonts.sans,   fontSize: 14, color: colors.textSecondary },
  chipDot:  { color: colors.textTertiary },
  chipLen:  { fontFamily: fonts.mono,   fontSize: 13, color: colors.textSecondary },
  dueText:  { fontFamily: fonts.monoSb, fontSize: 12, letterSpacing: 0.4 },
  title:    { marginTop: 12, fontFamily: fonts.sansSb, fontSize: 17, letterSpacing: -0.3, lineHeight: 22, color: colors.textPrimary },
});
