import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Card from '@/components/Card';
import LevelBadge from '@/components/LevelBadge';
import { IconChevRight } from '@/components/Icons';
import { colors, fonts } from '@/theme';
import type { AssignedExercise } from '@/types/api';

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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
    <Card accent={colors.rubricTask} padding={14} onPress={onPress}>
      <View style={styles.row}>
        <View style={{ flex: 1, marginLeft: 6 }}>
          <View style={styles.chipsRow}>
            <LevelBadge level={meta.cefrLevel} size="sm"/>
            {meta.writingGenre && <Text style={styles.chipType}>{capitalize(meta.writingGenre)}</Text>}
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
              fontFamily: due.isOverdue || due.isToday ? fonts.monoSb : fonts.mono,
              color: due.isOverdue ? colors.danger : due.isToday ? colors.brandBlue : colors.textTertiary,
            }]}>{due.label}</Text>
          </View>
          <Text style={styles.title}>{ex.name}</Text>
        </View>
        <IconChevRight size={14} color={colors.textTertiary}/>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chipsRow: { flexDirection: 'row', alignItems: 'center', columnGap: 10, rowGap: 8, flexWrap: 'wrap' },
  chipType: { fontFamily: fonts.sans, fontSize: 13, color: colors.textSecondary },
  chipDot:  { color: colors.textTertiary },
  chipLen:  { fontFamily: fonts.mono, fontSize: 12, color: colors.textSecondary },
  dueText:  { fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary },
  title:    { marginTop: 10, fontFamily: fonts.sansSb, fontSize: 16, lineHeight: 22, color: colors.textPrimary },
});
