// Navigation type definitions — route + param contracts.
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps }   from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps }   from '@react-navigation/native';
import type { AssignedExercise }       from '@/types/api';

// ── Root stack ──
export type RootStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingLevel:   undefined;
  Login:             undefined;
  Main:              undefined;
};

// ── Tab navigator ──
export type TabParamList = {
  HomeStack:        undefined;
  AssignmentsStack: undefined;
  ReportStack:      undefined;
  ProfileStack:     undefined;
};

// ── Shared deep-link param type ──
type ResultParams = { solvedTaskId: string };

// Tab names used within the Results screen (not navigation routes)
export type ResultsTab = 'Overview' | 'Writing' | 'Task' | 'Cohesion' | 'Vocab' | 'Grammar';

// ── Home stack ──
export type HomeStackParamList = {
  Home:             undefined;
  AssignmentDetail: { exercise: AssignedExercise };
  Compose:          { exercise: AssignedExercise; exerciseToken: string };
  Evaluating:       { solvedTaskId: string; taskName: string; wordCount: number };
  Results:          ResultParams;
  Error:            { kind: 'network' | 'evaluation' };
};

// ── Assignments tab stack (mirrors Home flow, starts from AllTasks) ──
export type AssignmentsStackParamList = {
  AllTasks:         undefined;
  AssignmentDetail: { exercise: AssignedExercise };
  Compose:          { exercise: AssignedExercise; exerciseToken: string };
  Evaluating:       { solvedTaskId: string; taskName: string; wordCount: number };
  Results:          ResultParams;
  Error:            { kind: 'network' | 'evaluation' };
};

export type ReportStackParamList = {
  Report:   undefined;
  Results:  ResultParams;
};
export type ProfileStackParamList = { Profile: undefined };

// ── Convenience screen prop types ──
export type RootProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type HomeProps<T extends keyof HomeStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, T>,
  BottomTabScreenProps<TabParamList>
>;
