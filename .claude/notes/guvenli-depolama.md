# Token'ların ve şifrenin güvenli depolanması (yapılacak)

2026-09-27'de boostifyspeak'te çözülen güvenlik sorununun aynısı burada da var. Bu not speak oturumunda,
write kodu yalnızca okunarak hazırlandı; write'ta henüz hiçbir şey değiştirilmedi.

## Sorun

AsyncStorage şifrelenmez; cihaz yedeğinden veya root/jailbreak'li cihazdan okunabilir.

| Dosya | Ne düz metin saklanıyor | Anahtarlar |
|---|---|---|
| `src/store/auth.ts` | access token, refresh token, kullanıcı | `@auth/accessToken`, `@auth/refreshToken`, `@auth/user` |
| `src/utils/biometric.ts` | biyometrik giriş için **kullanıcı adı + şifre** | `@stored_credentials` |

`@biometric_enabled` ve `@should_show_biometric_prompt` yalnızca tercih; AsyncStorage'da kalabilir.

Kullanan yerler: `src/context/AuthContext.tsx`, `src/api/client.ts`, `src/screens/Login.tsx`, `Home.tsx`, `Profile.tsx`.

## Ön koşul: `expo-secure-store` kurulu değil (native paket)

```bash
npx expo install expo-secure-store
```

`app.json` → `plugins`'e `"expo-secure-store"` eklenir. Ardından `npx expo prebuild --clean` ve yeni build
(Reload yetmez). Prebuild sonrası Signing Team yeniden seçilmeli ve `xattr -w com.dropbox.ignored 1 ios android`
tekrarlanmalı.

## Çözüm (speak'teki uygulamadan uyarlanacak)

Referans kod: `../boostifyspeak/src/services/biometricAuth.ts` (şifre taşıma) ve
`../boostifyspeak/src/store/secureAuthStorage.ts` (token'lar; speak redux-persist kullandığı için adapter şeklinde).
write redux-persist kullanmıyor, bu yüzden daha basit: `auth.ts` ve `biometric.ts` doğrudan SecureStore'a geçirilir.

1. **Neyi SecureStore'a koy:** access token, refresh token ve kimlik bilgileri. Kullanıcı objesi AsyncStorage'da
   kalabilir; Android'de SecureStore değerleri 2048 byte ile sınırlı ve kullanıcı objesi bunu aşabilir.
2. **SecureStore anahtar adları:** yalnızca `[A-Za-z0-9._-]`. `@auth/accessToken` geçersiz; ör. `auth_accessToken`.
3. **Mevcut kullanıcılar için taşıma (canlı kullanıcılar var, oturumları kapanmamalı):** açılışta bir kez,
   - AsyncStorage'da eski anahtar varsa değeri SecureStore'a kopyala,
   - sonra bir "hazır" işaretini AsyncStorage'a yaz,
   - en son düz metin anahtarları AsyncStorage'dan sil (her açılışta tekrarlanabilir, idempotent).
   Bu sıra, taşıma yarıda kesilirse veri kaybını önler.
4. **Yeniden kurulum:** iOS Keychain uygulama silinince temizlenmez. İşaret yoksa ve taşınacak eski kayıt da yoksa
   (temiz kurulum), Keychain'deki eski token/şifreler silinmeli. Aksi halde yeniden kurulan uygulama eski oturumla açılır.
5. **Okuma yarışı:** okuma fonksiyonları taşımanın bitmesini beklemeli (speak'te tek bir promise'i memoize edip
   her okuma/yazmada `await` ediliyor), yoksa açılışta oturum yokmuş gibi görünebilir.
6. **Çıkış / sıfırlama:** `clearAuth` ve `clearStoredCredentials` SecureStore anahtarlarını da silmeli.
   `AsyncStorage.clear()` kullanılan bir yer varsa, ardından "hazır" işareti yeniden yazılmalı.

## Test

Projede test runner yok. speak'te AsyncStorage/SecureStore mock'lanıp TypeScript derleyicisiyle transpile edilen
modül üzerinde senaryolar node ile çalıştırıldı: güncelleme, yarıda kalan taşıma, yeniden kurulum, çıkış, sıfırlama,
okuma yarışı. Cihazda: eski build'le giriş yap → yeni build'i üstüne kur → oturum açık kalmalı ve biyometrik giriş çalışmalı.
