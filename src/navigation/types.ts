// Navigation type definitions — route + param contracts.
// All stack/tab navigators reference these.

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps }   from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps }   from '@react-navigation/native';

// ── Root stack (auth flow → main app) ──
export type RootStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingLevel:   undefined;
  Login:             undefined;
  Main:              undefined;          // hosts the tab navigator
};

// ── Tab navigator ──
export type TabParamList = {
  HomeStack:        undefined;
  AssignmentsStack: undefined;
  ReportStack:      undefined;
  ProfileStack:     undefined;
};

// ── Home stack — Assignments → Detail → Compose → Evaluating → Results ──
export type HomeStackParamList = {
  Assignments:      undefined;
  AssignmentDetail: { id: number };
  Compose:          { id: number };
  Evaluating:       { id: number };
  ResultsOverview:  { id: number };
  ResultsWriting:   { id: number };
  ResultsTask:      { id: number };
  ResultsCohesion:  { id: number };
  ResultsLexical:   { id: number };
  ResultsGrammar:   { id: number };
  Error:            { kind: 'network' | 'evaluation' };
};

export type AssignmentsStackParamList = {
  AllTasks:         undefined;
  AssignmentDetail: { id: number };
  Compose:          { id: number };
  Evaluating:       { id: number };
  ResultsOverview:  { id: number };
  ResultsWriting:   { id: number };
  ResultsTask:      { id: number };
  ResultsCohesion:  { id: number };
  ResultsLexical:   { id: number };
  ResultsGrammar:   { id: number };
  Error:            { kind: 'network' | 'evaluation' };
};
export type ReportStackParamList   = { Report: undefined };
export type ProfileStackParamList  = { Profile: undefined };

// ── Convenience screen prop types ──
export type RootProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type HomeProps<T extends keyof HomeStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, T>,
  BottomTabScreenProps<TabParamList>
>;
