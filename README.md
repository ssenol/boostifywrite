# boostifywrite — React Native (Expo)

CEFR-tabanlı İngilizce yazma uygulaması.
Bu paket, HTML prototipin birebir React Native (Expo + StyleSheet) karşılığıdır — tüm renkler, tipografi ve component anatomisi `tokens.css` ile aynıdır.

---

## Hızlı başlangıç

```bash
cd rn
npm install            # ~2 dakika
npx expo start         # Expo dev server
```

Sonra:
- **iOS simülatöründe açmak** → terminalde `i`
- **Android emülatörde** → `a`
- **Fiziksel cihazda** → telefonunuza Expo Go uygulamasını yükleyin, terminaldeki QR kodu okutun

İlk açılışta fontlar (Manrope + JetBrains Mono) Google'dan çekilir — ~3-5 saniye splash görürsünüz.

---

## Proje yapısı

```
rn/
├── App.tsx                      ← root, font yükleme + NavigationContainer
├── app.json                     ← Expo config (bundle ID, ikonlar, splash)
├── package.json
├── babel.config.js              ← reanimated plugin
├── metro.config.js              ← react-native-svg-transformer
├── tsconfig.json                ← @/ alias → src/
│
├── assets/
│   ├── logo-mark.svg            ← 4-petal mark
│   └── logo-full.svg            ← mark + "boostifywrite" wordmark
│
└── src/
    ├── theme/
    │   └── index.ts             ← TÜM design tokens (colors, spacing, type, shadow)
    │
    ├── components/              ← Reusable UI parçaları
    │   ├── Card.tsx
    │   ├── Button.tsx
    │   ├── LevelBadge.tsx       ← A1/A2/B1/B1+/B2/C1 chip
    │   ├── StatusPill.tsx       ← Due today, Evaluated, In progress vb.
    │   ├── TabBar.tsx           ← Floating bottom 4-tab nav
    │   ├── RubricBar.tsx        ← Bir CEFR dimension'ı için skor barı
    │   ├── ProgressRing.tsx     ← Evaluating ekranındaki yuvarlak progress
    │   ├── ProgressBar.tsx      ← Linear progress
    │   ├── BulletRow.tsx        ← Strength / Work-on satırı
    │   ├── QuoteBlock.tsx       ← "From your writing" / "Try this" kart
    │   ├── FilterChip.tsx       ← Çoklu filtre chip'i
    │   ├── Avatar.tsx           ← Baş harf yuvarlak
    │   ├── IconButton.tsx       ← Yuvarlak chrome buton
    │   ├── SectionHeader.tsx    ← Mono caps label + ayraç çizgi
    │   ├── StatTile.tsx         ← LENGTH / TIME / RUBRIC kutucuk
    │   ├── Screen.tsx           ← SafeAreaView wrapper
    │   ├── Logo.tsx             ← LogoMark + LogoWordmark
    │   └── Icons.tsx            ← Tüm SVG ikonlar
    │
    ├── navigation/
    │   ├── index.tsx            ← Root + Tab + per-tab Stack navigators
    │   └── types.ts             ← Route param tipleri
    │
    ├── screens/                 ← 17 ekran
    │   ├── OnboardingWelcome.tsx
    │   ├── OnboardingLevel.tsx
    │   ├── Login.tsx
    │   ├── Assignments.tsx
    │   ├── AssignmentDetail.tsx
    │   ├── Compose.tsx
    │   ├── Evaluating.tsx
    │   ├── ResultsShell.tsx     ← Ortak header + tab pill row
    │   ├── ResultsOverview.tsx
    │   ├── ResultsWriting.tsx   ← Inline annotation + collapsible peek
    │   ├── DimensionScreen.tsx  ← Task/Cohesion/Lexical/Grammar için ortak layout
    │   ├── dimensionData.ts     ← 4 dimension'ın içerikleri
    │   ├── ResultsTask.tsx      ← (thin wrapper)
    │   ├── ResultsCohesion.tsx  ← (thin wrapper)
    │   ├── ResultsLexical.tsx   ← (thin wrapper)
    │   ├── ResultsGrammar.tsx   ← (thin wrapper)
    │   ├── Progress.tsx         ← CEFR trajectory chart + ladder
    │   ├── Profile.tsx
    │   └── Error.tsx            ← Network / Evaluation hata state'i
    │
    └── types/
        └── svg.d.ts             ← SVG import için TS declaration
```

---

## Tek doğruluk kaynağı: `src/theme/index.ts`

Bir renk, font veya spacing değişikliği bu tek dosyadan yapılır — tüm component'ler ve ekranlar otomatik günceller.

```ts
import { colors, spacing, type, radii, shadow } from '@/theme';

// Kullanım:
<View style={{
  backgroundColor: colors.brandBlue,
  padding: spacing.s4,
  borderRadius: radii.lg,
  ...shadow.md,
}}>
  <Text style={type.displayLG}>Hello</Text>
</View>
```

| Token grubu | Anahtar örnekleri | Karşılık (CSS) |
|---|---|---|
| `colors` | `brandBlue`, `rubricTask`, `bgApp`, `textPrimary` | `--brand-blue`, `--rubric-task`, vb. |
| `spacing` | `s1` (4) → `s12` (48) | `--s-1` → `--s-12` |
| `radii` | `xs`, `sm`, `md`, `lg`, `xl`, `pill` | `--r-*` |
| `type` | `displayXL`, `body`, `label`, `emphasis` | `.serif`, `.label`, `.serif-italic` |
| `shadow` | `xs`, `sm`, `md`, `lg` | `--shadow-*` |

---

## Navigation map

```
RootStack
├── OnboardingWelcome
├── OnboardingLevel
├── Login
└── Main (Tab Navigator with custom floating TabBar)
    ├── HomeStack
    │   ├── Assignments       (root)
    │   ├── AssignmentDetail
    │   ├── Compose
    │   ├── Evaluating        → auto-redirects to ResultsOverview
    │   ├── ResultsOverview
    │   ├── ResultsWriting
    │   ├── ResultsTask
    │   ├── ResultsCohesion
    │   ├── ResultsLexical
    │   ├── ResultsGrammar
    │   └── Error
    ├── WriteStack → Compose
    ├── ProgressStack → Progress
    └── ProfileStack → Profile
```

---

## Bilinmesi gerekenler

- **Fontlar:** Manrope (UI sans) + JetBrains Mono (label'lar, sayılar). Italic kullanılmaz — vurgu font-weight (600 → 700 → 800) ile.
- **Renk paleti:** Boostify mavisi (`#3D44F0`) primary + Write yeşili (`#6BB845`) accent. 4 rubric rengi (indigo / blue / green / amber) tüm değerlendirme yüzeylerinde tutarlı.
- **Status bar / safe area:** Her ekran `SafeAreaView` ile sarılı — iOS notch ve Android status bar otomatik handle ediliyor.
- **TabBar:** React Navigation'ın default bar'ı yerine `src/components/TabBar.tsx` kullanılıyor (floating pill stili).
- **SVG'ler:** `assets/*.svg` direkt component olarak import edilebilir (`metro.config.js` → react-native-svg-transformer).

---

## Yapılması gerekenler (placeholder'lar)

- `assets/icon.png` (1024×1024) ve `assets/splash.png` (1242×2436) eklenmeli — şu an `app.json` referans veriyor ama dosyalar yok.
- Backend API entegrasyonu (mock data şu an `screens/Assignments.tsx`, `screens/dimensionData.ts` içinde inline).
- Form validation, error handling, auth persistence (`AsyncStorage`).
- Real essay editor (şu an `Compose.tsx` basit TextInput — production'da rich text editor gerekir).
- Accessibility audit (VoiceOver / TalkBack label'ları, contrast oranları).

---

## HTML prototip → RN eşleşmesi

| HTML / CSS  | React Native |
|---|---|
| `tokens.css` | `src/theme/index.ts` |
| `components.jsx` | `src/components/*.tsx` |
| `screens-auth.jsx`, `screens-home.jsx`, vb. | `src/screens/*.tsx` |
| `boostifywrite.html` (design canvas) | yok — direkt navigation |
| `design-system.html` | yok — `theme/index.ts` tek referans |

HTML prototipte yapılan revize → `tokens.css` veya component dosyası değişir → RN tarafında ilgili token/component dosyası da güncellenir. İki dosya birbirini bilmez ama isim/yapı aynı.
