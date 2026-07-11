import { BASE_URL } from '@/api/client';

// coverImageVariants.small/medium backend'den host'suz, göreli path olarak
// gelir (örn. "/image/serve/images/xxx.png?w=320&...&key=..."). Bu path'ler
// ana API'nin kendisinden servis edilir — BASE_URL ile birleştirilir.
export function resolveCoverImageVariant(coverImage: string, variant?: string): string {
  if (!variant) return coverImage;
  if (/^https?:\/\//i.test(variant)) return variant;
  return `${BASE_URL}${variant}`;
}

// Küçük/mobil ekran için en uygun boyutu seçer — önce "small", yoksa
// "medium", ikisi de yoksa orijinal coverImage'a düşer.
export function getMobileCoverImage(coverImage: string, variants?: { small?: string; medium?: string }): string {
  const preferred = variants?.small ?? variants?.medium;
  return resolveCoverImageVariant(coverImage, preferred);
}
