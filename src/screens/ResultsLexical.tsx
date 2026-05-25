import React from 'react';
import DimensionScreen from './DimensionScreen';
import { D_LEXICAL } from './dimensionData';
export default function ResultsLexical() {
  return <DimensionScreen tab="Vocab" dimension={D_LEXICAL}/>;
}
