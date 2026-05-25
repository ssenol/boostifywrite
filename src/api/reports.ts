// Tamamlanan raporlar listesi, rapor detayı ve silme endpoint'leri
import { request } from './client';
import type {
  CompletedReportsResponse,
  ReportDetailResponse,
} from '@/types/api';

type FetchReportsParams = {
  userId: string;
  perPageCount?: number;
  lastAssignedTaskId?: string | null;
  completionDate?: string | null;
};

export async function fetchCompletedReports(params: FetchReportsParams): Promise<CompletedReportsResponse> {
  return request<CompletedReportsResponse>('/student/get-student-completed-exercises', {
    method: 'POST',
    body: {
      userId: params.userId,
      role: 'student',
      perPageCount: params.perPageCount ?? 20,
      lastAssignedTaskId: params.lastAssignedTaskId ?? null,
      selectedTaskTypes: ['writing'],
      selectedSubTaskTypes: [],
      selectedTaskNames: [],
      completionDate: params.completionDate ?? null,
    },
  });
}

export async function fetchReportDetail(solvedTaskId: string): Promise<ReportDetailResponse> {
  return request<ReportDetailResponse>('/student/get-solved-exercise-detail', {
    method: 'POST',
    body: { reportId: solvedTaskId },
  });
}

export async function deleteReport(solvedTaskId: string): Promise<void> {
  await request('/student/delete-solved-task', {
    method: 'POST',
    body: { solvedTaskId, taskType: 'writing' },
  });
}
