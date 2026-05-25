// HTTP istemcisi — base URL, auth header, otomatik 401 → token yenileme
import { getAccessToken, getRefreshToken, updateAccessToken } from '@/store/auth';

export const BASE_URL = 'https://quizmaker-api.onrender.com/api/v0.0.1';

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  token?: string;           // exercise token gibi özel token geçmek için
  isFormData?: boolean;     // multipart/form-data (OCR) için
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
  if (res.status === 401 && !options.token) {
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
