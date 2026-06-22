import React from 'react';
import { View, Text } from 'react-native';

import { BulletCard, SummaryCard } from '@/components/BulletCard';
import { useReport, isInlineCorrection, findRubricCriteriaByKeyword } from '@/context/ReportContext';
import { type } from '@/theme';

export function OrganisationCohesionContent() {
  const { report } = useReport();
  if (!report) return null;

  const criteria    = findRubricCriteriaByKeyword(report.result, 'coher')
    ?? findRubricCriteriaByKeyword(report.result, 'organ');
  const achievements = criteria?.achievements ?? [];
  const rawIssues    = criteria?.issues ?? [];
  const stringIssues = rawIssues.filter((i): i is string => !isInlineCorrection(i));
  const summary      = criteria?.observation ?? '';

  return (
    <>
      {achievements.length > 0 && (
        <>
          <Text style={[type.label, { marginBottom: 6 }]}>ACHIEVEMENTS</Text>
          <BulletCard items={achievements} kind="good" />
        </>
      )}

      {stringIssues.length > 0 && (
        <>
          <Text style={[type.label, { marginTop: 16, marginBottom: 6 }]}>ISSUES</Text>
          <BulletCard items={stringIssues} kind="bad" />
        </>
      )}

      {!!summary && (
        <>
          <Text style={[type.label, { marginTop: 16, marginBottom: 6 }]}>SUMMARY</Text>
          <SummaryCard text={summary} />
        </>
      )}

      <View style={{ height: 16 }} />
    </>
  );
}
