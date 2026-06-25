// boostifywrite — Icons (react-native-svg)
// HTML prototipinin components.jsx içindeki I objesinin RN karşılığı.
// Tüm ikonlar stroke = currentColor mantığı yerine `color` prop'u alır.
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

type P = { size?: number; color?: string };

export const IconCheck = ({ size = 16, color = '#000' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IconCheckFilled = ({ size = 20, bg = '#16A34A' }: { size?: number; bg?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx={10} cy={10} r={10} fill={bg}/>
    <Path d="M5.5 10.5L8.5 13.5L14.5 6.5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IconAlertFilled = ({ size = 20, bg = '#4F46E5' }: { size?: number; bg?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx={10} cy={10} r={10} fill={bg}/>
    <Path d="M10 5V11" stroke="#fff" strokeWidth={2} strokeLinecap="round"/>
    <Circle cx={10} cy={14} r={1.1} fill="#fff"/>
  </Svg>
);

export const IconChevLeft = ({ size = 18, color = '#000' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Path d="M11.5 4L6.5 9L11.5 14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IconChevRight = ({ size = 16, color = '#000' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path d="M6 3.5L10.5 8L6 12.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IconChevDown = ({ size = 16, color = '#000' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path d="M3.5 6L8 10.5L12.5 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IconDownload = ({ size = 18, color = '#000' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Path d="M9 2.5V11.5M9 11.5L5.5 8M9 11.5L12.5 8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M3.5 14H14.5" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
  </Svg>
);

export const IconArrow = ({ size = 16, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IconArrowUp = ({ size = 14, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <Path d="M7 11.5V2.5M7 2.5L3 6.5M7 2.5L11 6.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IconArrowDown = ({ size = 14, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <Path d="M7 2.5V11.5M7 11.5L3 7.5M7 11.5L11 7.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IconInbox = ({ size = 32, color = '#000' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path d="M5 18L9 7H23L27 18V24C27 25.1 26.1 26 25 26H7C5.9 26 5 25.1 5 24V18Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
    <Path d="M5 18H10L12 21H20L22 18H27" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const IconCloud = ({ size = 28, color = '#9097AC' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <Path d="M7 19C4.79 19 3 17.21 3 15C3 13.13 4.28 11.57 6.01 11.13C6.07 8.31 8.38 6.05 11.21 6.05C13.42 6.05 15.31 7.43 16.06 9.39C16.5 9.29 16.96 9.24 17.43 9.24C20.55 9.24 23.08 11.76 23.08 14.89C23.08 17.16 21.76 19.12 19.85 20.06" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M14 18L14 23M14 23L11.5 20.5M14 23L16.5 20.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// ── Tab bar icons ──
export const IconHomeTab = ({ size = 22, color = '#000', filled }: P & { filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <Path d="M3.5 9.5L11 3.5L18.5 9.5V17.5C18.5 18.05 18.05 18.5 17.5 18.5H4.5C3.95 18.5 3.5 18.05 3.5 17.5V9.5Z"
      stroke={color} strokeWidth={filled ? 0 : 1.6} fill={filled ? color : 'none'} strokeLinejoin="round"/>
    <Path d="M9 18.5V13H13V18.5" stroke={filled ? '#fff' : color} strokeWidth={1.6} strokeLinejoin="round" fill="none"/>
  </Svg>
);

export const IconWriteTab = ({ size = 22, color = '#000', filled }: P & { filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <Path d="M14.5 3.5L18.5 7.5L8 18L3.5 18.5L4 14L14.5 3.5Z"
      stroke={color} strokeWidth={filled ? 0 : 1.6} fill={filled ? color : 'none'} strokeLinejoin="round"/>
    <Path d="M12.5 5.5L16.5 9.5" stroke={filled ? '#fff' : color} strokeWidth={1.6} strokeLinecap="round"/>
  </Svg>
);

export const IconProgressTab = ({ size = 22, color = '#000', filled }: P & { filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <Rect x={3.5}  y={11} width={3} height={7.5}  rx={1} stroke={color} strokeWidth={filled ? 0 : 1.6} fill={filled ? color : 'none'}/>
    <Rect x={9.5}  y={7}  width={3} height={11.5} rx={1} stroke={color} strokeWidth={filled ? 0 : 1.6} fill={filled ? color : 'none'}/>
    <Rect x={15.5} y={3}  width={3} height={15.5} rx={1} stroke={color} strokeWidth={filled ? 0 : 1.6} fill={filled ? color : 'none'}/>
  </Svg>
);

export const IconProfileTab = ({ size = 22, color = '#000', filled }: P & { filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <Circle cx={11} cy={8} r={3.5} stroke={color} strokeWidth={filled ? 0 : 1.6} fill={filled ? color : 'none'}/>
    <Path d="M4 18.5C4 15 7 13 11 13C15 13 18 15 18 18.5"
      stroke={color} strokeWidth={filled ? 0 : 1.6} fill={filled ? color : 'none'} strokeLinecap="round"/>
  </Svg>
);

export const IconFilter = ({ size = 14, color = 'currentColor' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <Path d="M1.5 2H12.5M3 7H11M5 12H9" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
  </Svg>
);

export const IconInfo = ({ size = 16, color = '#000' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13z" stroke={color} strokeWidth={1.4}/>
    <Path d="M8 7.25v4M8 5.25v.5" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
  </Svg>
);

export const IconClose = ({ size = 16, color = '#000' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path d="M3 3L13 13M13 3L3 13" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
  </Svg>
);

// Uyarı üçgeni — `color` ile tek renk (koyu arka plan üstünde beyaz gibi)
export const IconAlertTriangle = ({ size = 20, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path d="M9.13 3.5L2 16h16L10.87 3.5a1 1 0 0 0-1.74 0z" stroke={color} strokeWidth={1.6} strokeLinejoin="round"/>
    <Path d="M10 9v4" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <Circle cx={10} cy={15} r={0.9} fill={color}/>
  </Svg>
);

// Trash — Lucide trash-2
export const IconTrash = ({ size = 20, color = '#000' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6m5 5v6m4-6v6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Face ID — Lucide scan-face
export const IconFaceId = ({ size = 24, color = '#000' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2m5-3s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Touch ID — Lucide fingerprint
export const IconTouchId = ({ size = 24, color = '#000' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4M14 13.12c0 2.38 0 6.38-1 8.88m4.29-.98c.12-.6.43-2.3.5-3.02M2 12a10 10 0 0 1 18-6M2 16h.01m19.79 0c.2-2 .131-5.354 0-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2m2.31 12c.21-.66.45-1.32.57-2M9 6.8a6 6 0 0 1 9 5.2v2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// ScanText — Lucide scan-text (OCR / el yazısı)
export const IconScanText = ({ size = 24, color = '#000' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8h8M7 12h10M7 16h6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Camera — Lucide camera
export const IconCamera = ({ size = 24, color = '#000' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx={12} cy={13} r={3} stroke={color} strokeWidth={2}/>
  </Svg>
);

// Convenience map
export const TabIcon = {
  Home: IconHomeTab, Assignments: IconWriteTab, Report: IconProgressTab, Profile: IconProfileTab,
} as const;
