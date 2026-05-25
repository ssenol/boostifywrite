// API tip tanımları — boostifyedu Writing Mobile

// ── Kullanıcı ──────────────────────────────────────────────
export type User = {
  userId: string;
  username: string;
  role: string;
  name: string;
  lastName: string;
  schoolId: string;
  campusId: string;
  avatarUrl?: string;
  schoolName: string;
  campusName: string;
  createdAt?: string;
  classInfo: string[];
};

// ── Auth ───────────────────────────────────────────────────
export type LoginResponse = {
  status: string;
  status_code: number;
  message: string;
  data: {
    user: User;
    token: string;         // accessToken
    refreshToken: string;
  };
};

export type RefreshTokenResponse = {
  status: string;
  status_code: number;
  message: string;
  data: {
    accessToken: string;
    user: Omit<User, 'createdAt' | 'avatarUrl'>;
  };
};

// ── Görev Listesi (2.1) ────────────────────────────────────
export type OutlineBlock = {
  id: string;
  label: string;
  purpose: string;
  aiGoal: string;
  transitions: string[];
  color: string;
};

export type RubricCategoryLevel = {
  result_title: string;
  start_score: number;
  end_score: number;
  result_explanation: string;
};

export type RubricCriteria = {
  name: string;
  description?: string;
  weight: number;
  categoryLevels: RubricCategoryLevel[];
  isCustomaziable?: boolean;
  customizeTypeName?: string | null;
};

export type WritingMeta = {
  type: 'writing';
  subType: string;
  details: {
    minWordCount: number;
    maxWordCount?: number;
    minParagraphCount?: number;
    writingGenre?: string;
    writingGenreSubType?: string;
    educationLevel: string;
    assessmentLevel?: string[];
    rubric: string;
    rubricName: string;
    cefrLevel: string;
    outlines?: OutlineBlock[];
    sample?: string | null;
    keywords?: string;
    taskBaseCustomRubricDetails: RubricCriteria[];
    generateSandwichFeedback?: boolean;
  };
};

export type AssignedExercise = {
  id: string;                  // assignedTaskId
  name: string;
  startDate: string;
  dueDate: string;
  taskType: string;
  subTaskType: string;
  taskId: string;
  remainingAttemptCount: number;
  assignmentBanner: string;
  assignmentCalculationOfResultType: string;
  assignmentRepeatCount: number;
  assignmentTimeLimit: number;
  assignmentShowScore: boolean;
  afterDeadlineShown: boolean;
  afterSolvedShown: boolean;
  answerAfterFirstAttemptShown: boolean;
  answerBeforeDueDateShown: boolean;
  assignmentQuestionBack: boolean;
  assignmentMetaData: WritingMeta;
};

export type ExercisesResponse = {
  status: string;
  status_code: number;
  successed: boolean;
  data: {
    exercises: AssignedExercise[];
    totalExercisesCount: number;
    perPageCount: number;
    page: number;
  };
  message: string;
};

// ── Exercise Token (2.2) ───────────────────────────────────
export type ExerciseTokenResponse = {
  status: string;
  status_code: number;
  successed: boolean;
  data: { token: string };
  message: string;
};

// ── Görev İçeriği (2.3) ───────────────────────────────────
export type ExerciseQuestion = {
  mediaFiles: string[];
  question: { questionContent: string };
  expectation: WritingMeta['details'];
};

export type ExerciseContent = {
  startDate: string;
  dueDate: string;
  remainingAttemptCount: number;
  timeLimit: number;
  assignedTaskId: string;
  studentId: string;
  taskId: string;
  taskType: string;
  exercise: {
    taskType: string;
    taskId: string;
    banner: string;
    questions: ExerciseQuestion[];
  };
};

export type ExerciseContentResponse = {
  status: string;
  status_code: number;
  successed: boolean;
  data: { exercise: ExerciseContent };
  message: string;
};

// ── OCR (2.4) ─────────────────────────────────────────────
export type ImageToTextResponse = {
  status: string;
  status_code: number;
  imageText: string;
};

// ── Submit (2.5) ──────────────────────────────────────────
export type SubmitWritingResponse = {
  status: string;
  status_code: number;
  successed: boolean;
  data: {
    taskId: string;
    solvedTaskId: string;
    jobId: string | null;
    status: 'processing' | 'completed';
    finalScore: number;
  };
  message: string;
};

// ── Tamamlanan Raporlar (2.6) ──────────────────────────────
export type CompletedAttempt = {
  solvedTaskId: string;
  assignedTaskId: string;
  completionDate: string;
  result: { status: string }[];
  mainScore: number;
  attemptNumber: number;
};

export type CompletedExercise = {
  assignedTaskId: string;
  taskName: string;
  subTaskType: string;
  taskType: string;
  totalAttempts: number;
  lastSolvedDate: string;
  attempts: CompletedAttempt[];
};

export type CompletedReportsResponse = {
  status: string;
  status_code: number;
  results: number;
  hasMore: boolean;
  nextCursor: string | null;
  data: {
    exercises: CompletedExercise[];
    totalCompletedAssignmentCount: number;
  };
};

// ── Rapor Detayı (2.7) ────────────────────────────────────
export type InlineCorrection = {
  type: string;
  subType: string;
  wrongContent: string;
  correctedContent: string;
  wrongWord: string;
  correctWord: string;
  detailFeedbackWithReason: string;
  exampleOfUsage: string;
  errorIndex: number;
};

export type LexicalUpgrade = {
  from: string;
  suggestions: string[];
};

export type OutlineCompliance = {
  section: string;
  met: boolean;
  score: number;
  achievements: string[];
  issues: string[];
  finalComment: string;
};

export type CriteriaFeedback = {
  criterion: string;
  weight: string;
  score: number;
  observation: string;
  achievements: string[];
  issues: string[] | InlineCorrection[];
};

export type ReportDetail = {
  _id: string;
  assignedTaskId: string;
  taskName: string;
  taskType: string;
  mainScore: number;
  cefrLevel: string;
  wordCount: number;
  errorCount: number;
  aiFlagged: boolean;
  aiConfidence: number;
  plagiarismFlagged: boolean;
  plagiarismRisk: string | null;
  solvedDate: string;
  dueDate: string;
  startDate: string;
  studentInfo: {
    studentName: string;
    studentLastName: string;
    className: string;
  };
  criteriaScores: Record<string, number>;
  errorTypeCounts: Record<string, number>;
  errorSubTypeCounts: Record<string, number>;
  keywordsUsed: string[];
  requiredKeywords: string[];
  outlineSectionMet: Record<string, boolean>;
  outlineSectionScores: Record<string, number>;
  lexicalUpgrades: LexicalUpgrade[];
  result: ReportResultEntry[];
};

export type ReportResultEntry = {
  name: string;
  title?: string;
  result: unknown;
};

export type ReportDetailResponse = {
  status: string;
  status_code: number;
  successed: boolean;
  data: ReportDetail;
  message: string;
};

// ── Standart hata ─────────────────────────────────────────
export type ApiError = {
  status: 'fail';
  successed: false;
  status_code: number;
  data: null | { errorType?: string };
  message: string;
};
