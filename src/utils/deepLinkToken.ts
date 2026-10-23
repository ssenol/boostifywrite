// Web'den (service.ueslms) `boostifywrite://login?token=...` ile gelen SSO token'ı için küçük bir kuyruk.
// Link startDeepLinkListener'da yakalanır ama girişi orada yapamayız: AuthProvider kayıtlı oturumu
// henüz yüklememiş olabilir. Token burada bekletilir, AuthProvider içindeki DeepLinkLoginHandler alıp girişi yapar.
// (boostifyspeak'te aynı dosya; orada linki expo-router'ın app/+native-intent.tsx'i yakalıyor.)
import { Linking } from 'react-native';

type Listener = (token: string) => void;

let pendingToken: string | null = null;
let listener: Listener | null = null;
let isListening = false;

// URL veya path içindeki `token` query parametresini döner (yoksa null)
export function extractTokenFromUrl(url: string): string | null {
  const match = url.match(/[?&]token=([^&#]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function setPendingDeepLinkToken(token: string): void {
  if (listener) {
    listener(token);
  } else {
    pendingToken = token;
  }
}

// Bekleyen token varsa hemen, sonrakiler geldikçe dinleyiciye verilir
export function subscribeDeepLinkToken(next: Listener): () => void {
  listener = next;
  if (pendingToken) {
    const token = pendingToken;
    pendingToken = null;
    next(token);
  }
  return () => {
    if (listener === next) listener = null;
  };
}

// Uygulamayı açan (soğuk açılış) ve açıkken gelen linkleri dinler; `token` taşıyanları kuyruğa koyar.
// Token'sız linkler (dev client linkleri dahil) yok sayılır. App.tsx'te modül seviyesinde bir kez çağrılır.
export function startDeepLinkListener(): void {
  if (isListening) return;
  isListening = true;

  const handleUrl = (url: string | null) => {
    const token = url ? extractTokenFromUrl(url) : null;
    if (token) setPendingDeepLinkToken(token);
  };

  Linking.getInitialURL().then(handleUrl).catch(() => {});
  Linking.addEventListener('url', ({ url }) => handleUrl(url));
}
