import React from 'react';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import ResultsShell from './ResultsShell';
import type { HomeStackParamList } from '@/navigation/types';

type Route = RouteProp<HomeStackParamList, 'Results'>;

export default function ResultsScreen() {
  const { solvedTaskId } = useRoute<Route>().params;
  return <ResultsShell solvedTaskId={solvedTaskId}/>;
}
