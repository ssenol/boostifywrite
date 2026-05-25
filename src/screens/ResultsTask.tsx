import React from 'react';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import DimensionScreen from './DimensionScreen';
import type { HomeStackParamList } from '@/navigation/types';

export default function ResultsTask() {
  const { solvedTaskId } = useRoute<RouteProp<HomeStackParamList, 'ResultsTask'>>().params;
  return <DimensionScreen tab="Task" solvedTaskId={solvedTaskId}/>;
}
