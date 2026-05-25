import React from 'react';
import DimensionScreen from './DimensionScreen';
import { D_GRAMMAR } from './dimensionData';
export default function ResultsGrammar() {
  return <DimensionScreen tab="Grammar" dimension={D_GRAMMAR}/>;
}
