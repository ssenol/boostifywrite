// ProgressRing — Evaluating ekranındaki yuvarlak progress göstergesi.
import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/theme';

type Props = { value: number; size?: number; stroke?: number; color?: string };

export default function ProgressRing({
  value, size = 140, stroke = 6, color = colors.brandBlue,
}: Props) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dash = C * (value / 100);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none"/>
      <Circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${C - dash}`}
      />
    </Svg>
  );
}
