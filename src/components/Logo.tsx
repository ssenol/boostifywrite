// Logo — assets/logo-mark.svg ve logo-full.svg dosyalarından beslenir.
// metro.config.js sayesinde SVG'ler direkt React component olarak import edilir.
import React from 'react';
import LogoMarkSvg from '@/../assets/logo-mark.svg';
import LogoFullSvg from '@/../assets/logo-full.svg';

export function LogoMark({ size = 44 }: { size?: number }) {
  return <LogoMarkSvg width={size} height={size}/>;
}

export function LogoWordmark({ size = 24 }: { size?: number }) {
  // Full SVG aspect ratio is 2310:410 ≈ 5.63
  const w = (size * 2310) / 410;
  return <LogoFullSvg width={w} height={size}/>;
}
