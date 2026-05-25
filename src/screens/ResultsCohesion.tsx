import React from 'react';
import DimensionScreen from './DimensionScreen';
import { D_COHESION } from './dimensionData';
export default function ResultsCohesion() {
  return <DimensionScreen tab="Cohesion" dimension={D_COHESION}/>;
}
