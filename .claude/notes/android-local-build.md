# Yerel Android build ve cihaz testi (SDK 57)

Expo SDK 57 yükseltmesinde (2026-09-27) Android tablette yerel test için yapılan kurulum.
Başka bir Mac'te aynı ortamı kurmak için adım adım.

Proje CNG kullanır: `android/` ve `ios/` klasörleri commit edilmez, `npx expo prebuild` ile üretilir.

## 1. Tek seferlik kurulum

### JDK 17

Gradle JDK 17 ister. Şifre gerektirmeyen Homebrew formülü:

```sh
brew install openjdk@17
```

> `brew install --cask zulu@17` yönetici şifresi ister (sudo). Claude'un terminalinde çalışmaz.

`~/.zshrc` dosyasına ekle (ya da her komutta başa yaz):

```sh
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/platform-tools:$PATH
```

### Android SDK

Android Studio **gerekmez**. `~/Library/Android/sdk` altında şunlar olmalı:

| Bileşen | Sürüm |
|---|---|
| platform-tools (`adb`) | güncel |
| platforms | `android-36` (targetSdk / compileSdk 36) |
| build-tools | 36.x ve 35.0.0 |
| ndk | 27.1.12297006 |

SDK klasörü varsa ve `licenses/` kabul edilmişse, eksik platform ve build-tools'u Gradle ilk build'de
kendisi indirir. Bu makinede `android-36` ve `build-tools 35.0.0` bu şekilde geldi.

SDK hiç yoksa: Android Studio'yu kurup SDK Manager'dan yukarıdakileri seçmek en kolayı. Ya da
`brew install --cask android-commandlinetools` ile `sdkmanager` kullanılır.

### Cihaz (tablet / telefon)

1. Ayarlar → Tablet hakkında → Yazılım bilgileri → **Yapı numarası**'na 7 kez dokun.
2. Geliştirici seçenekleri → **USB hata ayıklama**'yı aç.
3. USB ile bağla, cihazdaki "USB hata ayıklamaya izin ver" sorusunu onayla.
4. `adb devices -l` cihazı `device` olarak göstermeli.

## 2. Build ve kurulum

```sh
# Native projeyi üret (package.json veya app.json değiştiyse, ya da android/ yoksa)
CI=1 npx expo prebuild --clean --platform android
# ⚠️ prebuild package.json'daki "ios"/"android" script'lerini "expo run:*" yapar.
#    Commit'lemeden önce sadece o iki satırı geri al (git checkout package.json KULLANMA).

# Debug APK derle (ilk seferde ~10 dk, sonra hızlı)
cd android && ./gradlew assembleDebug && cd ..

# Metro (ayrı terminalde açık kalsın)
npx expo start --clear

# Cihaza kur ve Metro'ya USB üzerinden bağla
adb install android/app/build/outputs/apk/debug/app-debug.apk
adb reverse tcp:8081 tcp:8081
adb shell monkey -p com.uesturkey.boostifywrite -c android.intent.category.LAUNCHER 1
```

`npx expo run:android` de aynı işi tek komutla yapar. Yukarıdaki adımlar hangi adımda hata
olduğunu görmek için ayrı tutuldu.

## 3. Bilinen durumlar

- **Store sürümü kuruluysa önce kaldır.** Debug APK farklı anahtarla imzalı, Android üzerine kurmayı
  reddeder (iOS'taki gibi ekip seçerek çözülmez). Kaldırınca cihazdaki oturum/AsyncStorage gider.
  Test sonrası Play Store'dan tekrar yükle.
- **APK ~229 MB**: debug build tüm ABI'leri ve sembolleri içerir. Store AAB'si çok daha küçük.
- **Log'lar:** `adb logcat -d -t 400 | grep -iE "ReactNativeJS|AndroidRuntime|FATAL"`
- **"Refreshing..." banner'ı sürekli çıkıyorsa:** `metro.config.js` kökteki `ios/` ve `android/`'i
  izlemeden çıkarır. Proje Dropbox'ta olduğu için Dropbox bu klasörlere sürekli dokunuyor.
  İsteğe bağlı: `xattr -w com.dropbox.ignored 1 android ios node_modules`.
- **Test edilen:** Samsung Galaxy Tab A9+ (SM-X210), Android 16 / API 36. Edge-to-edge zorunlu:
  TabBar sistem nav bar'ın üstünde, döndürme, upload'lar (expo/fetch), modaller sorunsuz.

## iOS için kısa not (aynı makine)

- Xcode 27'de Simulator.app yok (yerine Device Hub). `expo run:ios` "Can't determine id of Simulator
  app" hatası verir. Çözüm: `npx expo start` + `ios/BoostifyWrite.xcworkspace`'i Xcode'da aç, cihazı seç, Run.
- Signing Team: **9L497LXNLQ** (store sürümüyle aynı ekip, üzerine kurulur ve veri korunur).
  Prebuild bu ayarı sıfırlar, her prebuild sonrası tekrar seç.
