import React from 'react';
import DimensionScreen from './DimensionScreen';
import { D_TASK } from './dimensionData';
export default function ResultsTask() {
  return <DimensionScreen tab="Task" dimension={D_TASK}/>;
}
