import React from 'react';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import DimensionScreen from './DimensionScreen';
import type { HomeStackParamList } from '@/navigation/types';

export default function ResultsLexical() {
  const { solvedTaskId } = useRoute<RouteProp<HomeStackParamList, 'ResultsLexical'>>().params;
  return <DimensionScreen tab="Vocab" solvedTaskId={solvedTaskId}/>;
}
