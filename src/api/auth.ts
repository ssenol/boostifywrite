// Auth endpoint'leri — login, refresh, avatar upload
import { imageFormPart, request } from './client';
import type { LoginResponse, RefreshTokenResponse, User } from '@/types/api';

export async function login(username: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { username, password },
    skipRefresh: true,
  });
}

export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  return request<RefreshTokenResponse>('/auth/refresh-mobile-app-access-token', {
    method: 'POST',
    body: { refreshToken },
  });
}

export async function uploadAvatar(imageUri: string, user: User): Promise<string> {
  const formData = new FormData();
  formData.append('file', imageFormPart(imageUri, 'avatar.jpg'));
  formData.append('userId', user.userId);
  formData.append('role', 'student');
  formData.append('username', user.username);

  const res = await request<{ status_code: number; result: string }>('/user/set-user-profile', {
    method: 'POST',
    body: formData,
    isFormData: true,
  });
  return res.result;
}
