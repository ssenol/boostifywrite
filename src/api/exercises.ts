// Görev listesi, exercise token ve görev içeriği endpoint'leri
import { request } from './client';
import type {
  ExercisesResponse,
  ExerciseTokenResponse,
  ExerciseContentResponse,
  AssignedExercise,
} from '@/types/api';

type FetchExercisesParams = {
  userId: string;
  institutionId: string;
  institutionSubSchoolId: string;
  page?: number;
  perPageCount?: number;
  expired?: boolean;
  searchText?: string;
};

export async function fetchAssignedTasks(params: FetchExercisesParams): Promise<ExercisesResponse> {
  return request<ExercisesResponse>('/student/get-student-exercises', {
    method: 'POST',
    body: {
      ...params,
      exercisesTypes: ['writing'],
      page: params.page ?? 1,
      perPageCount: params.perPageCount ?? 20,
      expired: params.expired ?? false,
      startDate: null,
      searchText: params.searchText ?? '',
    },
  });
}

export async function generateExerciseToken(exercise: AssignedExercise, studentId: string): Promise<string> {
  const res = await request<ExerciseTokenResponse>('/student/generate-exercise-auth-token', {
    method: 'POST',
    body: {
      studentId,
      role: 'student',
      taskType: 'writing',
      taskId: exercise.taskId,
      assignedTaskId: exercise.id,
      taskName: exercise.name,
      assignmentRepeatCount: exercise.assignmentRepeatCount,
      dueDate: exercise.dueDate,
      startDate: exercise.startDate,
      environment: 'prod',
    },
  });
  return res.data.token;
}

export async function fetchTaskContent(exerciseToken: string): Promise<ExerciseContentResponse> {
  return request<ExerciseContentResponse>('/student/get-student-exercise', {
    method: 'GET',
    token: exerciseToken,
  });
}
