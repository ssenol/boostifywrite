import React from 'react';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import DimensionScreen from './DimensionScreen';
import type { HomeStackParamList } from '@/navigation/types';

export default function ResultsCohesion() {
  const { solvedTaskId } = useRoute<RouteProp<HomeStackParamList, 'ResultsCohesion'>>().params;
  return <DimensionScreen tab="Cohesion" solvedTaskId={solvedTaskId}/>;
}
