import { useWindowDimensions } from 'react-native';

// iPad mini portrait genişliğine yakın eşik — boostifyspeak ile tutarlı.
const TABLET_BREAKPOINT = 744;

// Tablet'te 2 sütunlu grid için kart genişliğini piksel bazlı hesaplar.
// Yüzdesel genişlik + flexGrow yerine sabit px kullanılır ki:
//  - sağ kartın sağ kenarı sol padding ile simetrik hizalansın (yuvarlama artığı kalmasın)
//  - tek kalan kart tam genişliğe büyümesin, diğerleriyle aynı genişlikte kalsın
export function useGridColumnWidth(horizontalPadding = 16, gap = 16): number | undefined {
  const { width } = useWindowDimensions();
  if (width < TABLET_BREAKPOINT) return undefined;
  return (width - horizontalPadding * 2 - gap) / 2;
}

// 2 sütunlu bir grid'de eşit olmayan oranlarla (ör. 70/30) piksel genişlik hesaplar.
export function useTwoColWidths(ratio: [number, number] = [0.5, 0.5], horizontalPadding = 16, gap = 16): [number, number] | undefined {
  const { width } = useWindowDimensions();
  if (width < TABLET_BREAKPOINT) return undefined;
  const total = width - horizontalPadding * 2 - gap;
  const sum = ratio[0] + ratio[1];
  return [total * (ratio[0] / sum), total * (ratio[1] / sum)];
}
