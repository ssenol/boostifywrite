import React from 'react';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import DimensionScreen from './DimensionScreen';
import type { HomeStackParamList } from '@/navigation/types';

export default function ResultsGrammar() {
  const { solvedTaskId } = useRoute<RouteProp<HomeStackParamList, 'ResultsGrammar'>>().params;
  return <DimensionScreen tab="Grammar" solvedTaskId={solvedTaskId}/>;
}
