import React from 'react';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import ReportShell from './ReportShell';
import type { HomeStackParamList } from '@/navigation/types';

type Route = RouteProp<HomeStackParamList, 'Results'>;

export default function ReportScreen() {
  const { solvedTaskId } = useRoute<Route>().params;
  return <ReportShell solvedTaskId={solvedTaskId}/>;
}
