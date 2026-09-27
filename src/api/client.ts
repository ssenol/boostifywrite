// HTTP istemcisi — base URL, auth header, otomatik 401 → token yenileme
import { File } from 'expo-file-system';
import { getAccessToken, getRefreshToken, updateAccessToken } from '@/store/auth';

export const BASE_URL = 'https://quizmaker-api.onrender.com/api/v0.0.1';

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  token?: string;           // exercise token gibi özel token geçmek için
  isFormData?: boolean;     // multipart/form-data (OCR) için
  skipRefresh?: boolean;    // auth endpoint'leri için token yenilemeyi devre dışı bırak
};

async function refreshAndRetry<T>(path: string, options: RequestOptions): Promise<T> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new ApiRequestError(401, 'Session expired. Please log in again.');

  const res = await fetch(`${BASE_URL}/auth/refresh-mobile-app-access-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await res.json();
  if (!res.ok || data.status !== 'success') {
    throw new ApiRequestError(401, 'Session expired. Please log in again.');
  }

  await updateAccessToken(data.data.accessToken);
  return request<T>(path, { ...options, token: data.data.accessToken });
}

export class ApiRequestError extends Error {
  constructor(public statusCode: number, message: string, public errorType?: string) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

const IMAGE_MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png', gif: 'image/gif', webp: 'image/webp',
};

// Yerel görsel URI'sinden FormData dosya parçası üretir.
// SDK 57'den beri global fetch = expo/fetch; kodlayıcısı RN'nin { uri, name, type } parçasını
// reddeder, içeriği `bytes()` üzerinden okur. `uri` ise RN fetch'e dönülürse diye korunur.
export function imageFormPart(uri: string, fallbackName: string): Blob {
  const name = uri.split('/').pop() || fallbackName;
  const ext = name.split('.').pop()?.toLowerCase() ?? 'jpg';
  return {
    uri,
    name,
    type: IMAGE_MIME[ext] ?? 'image/jpeg',
    bytes: () => new File(uri).bytes(),
  } as unknown as Blob;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, isFormData = false } = options;

  const token = options.token ?? (await getAccessToken());

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData && method === 'POST') headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  // 401: token yenilemeyi bir kez dene (sadece access token kullanan endpoint'lerde)
  if (res.status === 401 && !options.token && !options.skipRefresh) {
    return refreshAndRetry<T>(path, options);
  }

  const data = await res.json();

  if (!res.ok || data.status === 'fail') {
    throw new ApiRequestError(
      res.status,
      data.message ?? 'An error occurred.',
      data.data?.errorType,
    );
  }

  return data as T;
}
