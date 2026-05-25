// Auth endpoint'leri — login, refresh
import { request } from './client';
import type { LoginResponse, RefreshTokenResponse } from '@/types/api';

export async function login(username: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { username, password },
  });
}

export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  return request<RefreshTokenResponse>('/auth/refresh-mobile-app-access-token', {
    method: 'POST',
    body: { refreshToken },
  });
}
