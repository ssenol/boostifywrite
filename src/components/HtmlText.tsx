// Basit HTML → React Native Text dönüştürücü.
// Desteklenen tag'ler: <b>, <strong>, <br>, <p>, <ul>/<li>.
// Bilinmeyen tag'ler strip edilir. Italic yok (proje kuralı).
import React from 'react';
import { Text } from 'react-native';
import type { TextStyle } from 'react-native';
import { fonts } from '@/theme';

type Segment = { text: string; bold: boolean };

function parse(html: string): Segment[] {
  const cleaned = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/?(ul|ol)[^>]*>/gi, '')
    .replace(/<\/?(em|i|u|s|span|div|h[1-6])[^>]*>/gi, '');

  const segments: Segment[] = [];
  const regex = /(<\/?(?:b|strong)[^>]*>)/gi;
  const parts = cleaned.split(regex);

  let bold = false;
  for (const part of parts) {
    if (/^<(b|strong)[^>]*>$/i.test(part)) { bold = true; continue; }
    if (/^<\/(b|strong)>$/i.test(part))    { bold = false; continue; }

    // Kalan bilinmeyen tag'leri strip et
    const text = part.replace(/<[^>]+>/g, '');
    if (text) segments.push({ text, bold });
  }

  return segments;
}

type Props = {
  html: string;
  style?: TextStyle;
};

export default function HtmlText({ html, style }: Props) {
  const segments = parse(html);
  return (
    <Text style={style}>
      {segments.map((s, i) =>
        s.bold ? (
          <Text key={i} style={{ fontFamily: fonts.sansEb }}>{s.text}</Text>
        ) : (
          s.text
        ),
      )}
    </Text>
  );
}
