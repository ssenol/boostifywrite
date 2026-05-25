# boostifywrite — Claude Code instructions

Bu dosyayı Claude Code her oturumda otomatik okur. Projeyi anlamak ve doğru kararlar vermek için referans alın.

## What this is

CEFR-tabanlı (A1–C1) İngilizce yazma uygulaması. Lise öğrencileri için yazma ödevi alıp, yazıp, AI ile değerlendirme alıyorlar. 4 rubric dimension üzerinden puanlanıyor: Task Achievement, Coherence & Cohesion, Lexical Range, Grammatical Accuracy.

**Hedef platform:** iOS + Android (Expo SDK 52, React Native 0.76, New Architecture açık).

## Stack

- **Expo** (managed workflow) + **React Native** + **TypeScript**
- **Navigation:** `@react-navigation/native` v7 (Stack + Bottom Tabs)
- **Styling:** Plain `StyleSheet` — **CSS-in-JS kütüphanesi YOK** (NativeWind, Tamagui, Restyle, Styled Components dahil). User explicitly chose vanilla.
- **Fontlar:** `@expo-google-fonts/manrope` + `@expo-google-fonts/jetbrains-mono`
- **SVG:** `react-native-svg` + `react-native-svg-transformer` (assets direkt component olarak import edilir)
- **Path alias:** `@/*` → `src/*` (`tsconfig.json` içinde)

## Klasör yapısı

```
src/
├── theme/index.ts        ← TÜM design tokens (colors, spacing, type, radii, shadow)
├── components/           ← Reusable: Card, Button, LevelBadge, StatusPill, TabBar, ...
├── navigation/           ← Stack + Tab nav graph
├── screens/              ← 17 ekran
└── types/svg.d.ts        ← SVG import type'ı
```

`App.tsx` → fonts yükler → `NavigationContainer` → `RootNavigator`.

## Design system — TEK doğruluk kaynağı

`src/theme/index.ts` dışında **hiçbir yerde hex code, raw px değer veya font ailesi yazmayın.** Her şey theme'den okunur.

```ts
import { colors, spacing, type, radii, shadow } from '@/theme';
```

| Kategori | Örnekleri |
|---|---|
| `colors.brandBlue`, `colors.brandGreen`, `colors.brandCream` | Brand renkleri |
| `colors.rubricTask/Cohesion/Lexical/Grammar` (+ `*Soft` variant'lar) | 4 dimension için sabit renkler |
| `colors.bgApp`, `bgCard`, `bgInverse`, `bgInverse2` | Surface'ler |
| `colors.textPrimary/Secondary/Tertiary/Inverse` | Text renkleri |
| `spacing.s1`..`s12` | 4-pt grid (4, 8, 12, 16, 20, 24, 28, 32, 40, 48) |
| `radii.xs/sm/md/lg/xl/pill` | 6, 8, 12, 16, 20, 9999 |
| `type.displayXL/LG/MD/SM`, `body`, `bodySm`, `caption`, `label`, `labelSm`, `emphasis` | Hazır text style objeleri |
| `shadow.xs/sm/md/lg` | Cross-platform elevation |
| `levelColor('B1+')` | CEFR seviye → `{ fg, bg }` haritalama |

## Görsel kurallar (önemli)

- **Italic YOK.** Hiçbir yerde `fontStyle: 'italic'` yazmayın. Vurgu için font weight ağırlaştırın (`fonts.sansEb` 800).
- **Tırnaklı (serif) font YOK.** Tek font ailesi: **Manrope** (UI) + **JetBrains Mono** (label, sayı). Başlık/hero da Manrope.
- **Buton köşeleri tam yuvarlak** (`radii.pill`). Hem ana CTA (Button) hem ikon buton'ları (IconButton).
- **TabBar:** Floating pill bottom nav (Home / Write / Progress / Profile). Aktif sekme brand renginde dolar; pasif sekmeler sadece ikon. React Navigation'ın default bar'ı KULLANILMAZ — `src/components/TabBar.tsx` custom render eder.
- **AssignmentCard üst satırı:** chip'ler (level + type + length) sola, due pill sağa. Uzun chip'lerde due alta wrap eder (`flex-wrap: wrap` + `marginLeft: 'auto'`).
- **Writing ekranı peek sheet'i:** ekran altına yapışık, collapsible. ResultsShell `bottomOverlay` prop'u ile besleniyor.
- **iOS status bar overlap'i:** `SafeAreaView` (from `react-native-safe-area-context`) her ekranı sarmalı. `Screen.tsx` içindeki `ScreenSurface` bunu zaten yapar — yeni ekranlarda onu kullanın.

## Component eklerken

1. **Önce `src/components/` içinde var mı bak.** Çoğu UI parçası zaten var.
2. **Theme'den oku.** Yeni bir hex code uydurmayın — gerekirse önce `theme/index.ts`'e ekleyin.
3. **Pattern'i takip edin.** Mevcut component'lere bak (Card, Button, LevelBadge) — aynı dosya yapısı, aynı props pattern'i, aynı `StyleSheet.create` kullanımı.
4. **Touch target ≥44pt.** Her tıklanabilir buton/chip için.

## Screen eklerken

1. **`ScreenSurface` ile sarın** (`@/components/Screen`) — SafeArea + bg otomatik gelir.
2. **Header pattern'i:**
   ```tsx
   <View style={{
     padding: 20, paddingVertical: 16,
     backgroundColor: colors.bgCard,
     borderBottomWidth: 1, borderBottomColor: colors.hairline,
   }}>
     {/* IconButton + Title + (optional) right actions */}
   </View>
   ```
3. **Body için `ScreenScroll`** kullan — `padding: 20, paddingBottom: 110` (tab bar için yer).
4. **Navigation tip'leri için `types.ts`'e route ekleyin** — `HomeStackParamList`, `TabParamList` vb. doğru güncellensin.

## Stub'lar (henüz gerçek değil)

- **Mock data:** `src/screens/Assignments.tsx`, `Progress.tsx`, `dimensionData.ts` içinde inline. **Backend bağlanacak.**
- **Auth:** Login ekranı sadece `nav.navigate('Main')` yapar — gerçek auth yok. **AsyncStorage + auth context kurun.**
- **Compose editor:** Basit `TextInput` (multiline). **Production için rich text editor gerekir** (önerilen: `@10play/tentap-editor` veya `react-native-pell-rich-editor`).
- **Evaluating:** Setting timeout ile sahte progress — backend evaluation endpoint'ine bağlanacak.
- **Asset eksikleri:** `assets/icon.png` (1024×1024) ve `assets/splash.png` (1242×2436) yok. `app.json` referans verse de dosyalar oluşturulmalı. Geçici olarak yer tutucu PNG koyun.

## Tests / lint / type-check

- `npm run typecheck` → `tsc --noEmit` çalışır. **Her PR öncesi temiz olmalı.**
- Test runner kurulu değil. Eklenecekse: Jest + React Native Testing Library standart.

## HTML prototip referansı

Tasarımın HTML versiyonu `../design_handoff_boostifywrite/` içinde (varsa). Her component'i çizen orijinal JSX dosyaları orada — RN'ye port edilirken birebir referans alındı. Yeni özellik eklerken oradaki visual vocabulary'i koruyun.

## Sık yapılan hata

- ❌ `style={{ color: '#3D44F0' }}` → ✅ `style={{ color: colors.brandBlue }}`
- ❌ `padding: 16` → ✅ `padding: spacing.s4`
- ❌ `fontStyle: 'italic'` → ✅ `fontFamily: fonts.sansEb` (extra-bold ile vurgu)
- ❌ `borderRadius: 12` (button için) → ✅ `borderRadius: radii.pill`
- ❌ Manrope hardcoded → ✅ `fontFamily: fonts.sans` / `fonts.sansSb`
- ❌ Yeni `View` içine yeni bir SafeAreaView → ✅ `ScreenSurface` wrapper kullan
