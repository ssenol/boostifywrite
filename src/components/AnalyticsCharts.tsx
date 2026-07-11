// AnalyticsCharts — AnalyticsPanel için grafik primitive'leri.
// Tüm renkler theme'den okunur; kategorik setler validate_palette.js ile
// CVD-safe olarak doğrulanmıştır (bkz. dataviz skill).
import React, { useState } from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import Svg, { Circle, Path, Line, G } from 'react-native-svg';
import { colors, fonts, radii } from '@/theme';

export function StatTile({ label, value, unit, caption, valueColor, basis = '31%' }: {
  label: string; value: string; unit?: string; caption?: string; valueColor?: string; basis?: DimensionValue;
}) {
  return (
    <View style={[styles.tile, { flexBasis: basis }]}>
      <Text style={styles.tileLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
        <Text style={[styles.tileValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
        {unit ? <Text style={styles.tileUnit}>{unit}</Text> : null}
      </View>
      {caption ? <Text style={styles.tileCaption}>{caption}</Text> : null}
    </View>
  );
}

export function LineTrend({ points, color = colors.brandBlue }: {
  points: { x: string; y: number }[]; color?: string;
}) {
  const HEIGHT = 150;
  const PAD = { l: 28, r: 8, t: 26, b: 20 };
  const [width, setWidth] = useState(0);
  const plotW = Math.max(1, width - PAD.l - PAD.r);
  const plotH = HEIGHT - PAD.t - PAD.b;
  const n = points.length;
  const xAt = (i: number) => PAD.l + (n <= 1 ? plotW / 2 : (plotW * i) / (n - 1));
  const yAt = (v: number) => PAD.t + plotH - (Math.max(0, Math.min(100, v)) / 100) * plotH;
  const ticks = [0, 25, 50, 75, 100];

  return (
    <View onLayout={e => setWidth(e.nativeEvent.layout.width)} style={{ height: HEIGHT }}>
      {width > 0 && n > 0 && (
        <>
          <Svg width={width} height={HEIGHT}>
            {ticks.map(t => (
              <Line key={t} x1={PAD.l} x2={width - PAD.r} y1={yAt(t)} y2={yAt(t)} stroke={colors.hairline} strokeWidth={1}/>
            ))}
            <Path
              d={`M ${xAt(0)} ${yAt(0)} ${points.map((p, i) => `L ${xAt(i)} ${yAt(p.y)}`).join(' ')} L ${xAt(n - 1)} ${yAt(0)} Z`}
              fill={color} fillOpacity={0.1}
            />
            {n > 1 && (
              <Path
                d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(p.y)}`).join(' ')}
                stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"
              />
            )}
            {points.map((p, i) => (
              <Circle key={i} cx={xAt(i)} cy={yAt(p.y)} r={5} fill={color} stroke={colors.bgCard} strokeWidth={2}/>
            ))}
          </Svg>

          {ticks.map(t => (
            <Text key={t} style={[styles.trendTick, { top: yAt(t) - 7, width: PAD.l - 6 }]}>{t}</Text>
          ))}

          {points.map((p, i) => {
            if (i !== 0 && i !== n - 1) return null;
            const isFirst = i === 0;
            return (
              <View
                key={i}
                style={[
                  styles.trendBadgeWrap,
                  { top: yAt(p.y) - 30 },
                  isFirst ? { left: Math.max(0, xAt(i) - 16) } : { left: xAt(i) - 16 },
                ]}
              >
                <View style={[styles.trendBadge, { backgroundColor: color }]}>
                  <Text style={styles.trendBadgeText}>{Math.round(p.y)}</Text>
                </View>
              </View>
            );
          })}

          <Text style={[styles.trendXLabel, { left: PAD.l, textAlign: 'left' }]}>{points[0]?.x}</Text>
          {n > 1 && (
            <Text style={[styles.trendXLabel, { right: PAD.r, textAlign: 'right' }]}>{points[n - 1]?.x}</Text>
          )}
        </>
      )}
    </View>
  );
}

export function DonutChart({ segments, centerValue, centerLabel, size = 150, thickness = 26 }: {
  segments: { label: string; value: number; color: string }[];
  centerValue: string; centerLabel: string; size?: number; thickness?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const GAP = 3;
  let cursor = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${c}, ${c}`}>
          {segments.filter(s => s.value > 0).map((s, i) => {
            const frac = s.value / total;
            const len = Math.max(0, frac * circumference - GAP);
            const el = (
              <Circle
                key={i}
                cx={c} cy={c} r={r} fill="none"
                stroke={s.color} strokeWidth={thickness}
                strokeDasharray={`${len} ${circumference - len}`}
                strokeDashoffset={-cursor}
              />
            );
            cursor += frac * circumference;
            return el;
          })}
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.donutCenterValue}>{centerValue}</Text>
        <Text style={styles.donutCenterLabel}>{centerLabel}</Text>
      </View>
    </View>
  );
}

export function RingMeter({ value, size = 140, thickness = 14, color = colors.warning }: {
  value: number; size?: number; thickness?: number; color?: string;
}) {
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (circumference * Math.max(0, Math.min(100, value))) / 100;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r} fill="none" stroke={colors.border} strokeWidth={thickness}/>
        {filled > 0 && (
          <Circle
            cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={thickness}
            strokeDasharray={`${filled} ${circumference - filled}`}
            strokeLinecap="round"
            rotation={-90} origin={`${c}, ${c}`}
          />
        )}
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.ringValue}>{Math.round(value)}%</Text>
      </View>
    </View>
  );
}

// Dikey sütun bar chart — CEFR Breakdown ile aynı görsel dil (değer üstte, bar ortada, etiket altta).
export function ColumnBarChart({ items, max }: {
  items: { key: string; label: string; value: number; color: string }[]; max?: number;
}) {
  const maxValue = max ?? Math.max(1, ...items.map(i => i.value));
  return (
    <View>
      <View style={styles.colCountRow}>
        {items.map(i => (
          <Text key={i.key} style={styles.colCount}>{i.value}</Text>
        ))}
      </View>
      <View style={styles.colBarRow}>
        {items.map(i => {
          const h = Math.max(6, (Math.max(0, i.value) / maxValue) * 90);
          return (
            <View key={i.key} style={styles.colBarCol}>
              <View style={[styles.colBar, { height: h, backgroundColor: i.color }]}/>
            </View>
          );
        })}
      </View>
      <View style={styles.colLabelRow}>
        {items.map(i => (
          <Text key={i.key} style={styles.colLabel} numberOfLines={2}>{i.label}</Text>
        ))}
      </View>
    </View>
  );
}

export function BarRow({ label, value, max, color }: {
  label: string; value: number; max: number; color: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={styles.barLabel} numberOfLines={1}>{label}</Text>
        <Text style={[styles.barValue, { color }]}>{value}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexGrow: 1,
    backgroundColor: colors.bgCard, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: 14,
  },
  tileLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.1, color: colors.textTertiary, marginBottom: 6 },
  tileValue: { fontFamily: fonts.sansEb, fontSize: 26, letterSpacing: -0.5, color: colors.textPrimary },
  tileUnit: { fontFamily: fonts.sans, fontSize: 13, color: colors.textTertiary },
  tileCaption: { marginTop: 4, fontFamily: fonts.sans, fontSize: 11.5, color: colors.textTertiary },

  trendTick: {
    position: 'absolute', left: 0, textAlign: 'right',
    fontFamily: fonts.mono, fontSize: 10, color: colors.textTertiary,
  },
  trendXLabel: {
    position: 'absolute', bottom: 0,
    fontFamily: fonts.mono, fontSize: 10, color: colors.textTertiary,
  },
  trendBadgeWrap: { position: 'absolute' },
  trendBadge: {
    borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 3,
  },
  trendBadgeText: { fontFamily: fonts.sansEb, fontSize: 12, color: '#fff' },

  donutCenterValue: { fontFamily: fonts.sansEb, fontSize: 26, color: colors.textPrimary },
  donutCenterLabel: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, color: colors.textTertiary },

  ringValue: { fontFamily: fonts.sansEb, fontSize: 28, color: colors.textPrimary },

  barLabel: { flex: 1, marginRight: 8, fontFamily: fonts.sansSb, fontSize: 13, color: colors.textPrimary },
  barValue: { fontFamily: fonts.sansEb, fontSize: 13 },
  barTrack: { height: 6, borderRadius: radii.pill, backgroundColor: colors.border, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radii.pill },

  colCountRow: { flexDirection: 'row', marginBottom: 6 },
  colCount:    { flex: 1, textAlign: 'center', fontFamily: fonts.sansEb, fontSize: 13, color: colors.textPrimary },
  colBarRow:   { flexDirection: 'row', alignItems: 'flex-end', height: 90 },
  colBarCol:   { flex: 1, alignItems: 'center' },
  colBar:      { width: '55%', maxWidth: 40, minWidth: 8, borderRadius: radii.xs },
  colLabelRow: { flexDirection: 'row', marginTop: 6 },
  colLabel:    { flex: 1, fontFamily: fonts.mono, fontSize: 10, color: colors.textSecondary, textAlign: 'center' },
});
