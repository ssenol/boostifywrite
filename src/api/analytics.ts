// Öğrencinin kendi yazma performansı özeti (self-analytics)
import { request } from './client';
import type { SelfAnalyticsResponse } from '@/types/api';

export async function fetchSelfAnalytics(userId: string, type: 'writing' = 'writing'): Promise<SelfAnalyticsResponse> {
  return request<SelfAnalyticsResponse>('/student/get-self-analytics', {
    method: 'POST',
    body: { userId, type },
  });
}
