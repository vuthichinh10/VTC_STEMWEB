export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';
export interface User {
  id: string;
  displayName: string;
  username: string;
  role: Role;
}
export interface ModuleSummary {
  id: string;
  name: string;
  emoji: string;
  signal: string;
  summary: string;
  safety: string;
}
export interface LessonSummary {
  id: string;
  title: string;
  emoji: string;
  level: number;
  durationMinutes: number;
  topic: string;
  description: string;
  modules: string[];
}
export interface LessonDetail extends LessonSummary {
  goals: string[];
  question: string;
  choices: string[];
  correctChoice: number;
  reason: string;
  recipe: string;
  experiment: string;
  takeaway: string;
  defaultCode: string;
}
export interface Progress {
  lessonId: string;
  step: number;
  prediction: string;
  observation: string;
  conclusion: string;
  completed: boolean;
  updatedAt?: string;
}
export interface ProjectSummary {
  id: string;
  title: string;
  emoji: string;
  difficulty: string;
  durationMinutes: number;
  description: string;
  modules: string[];
}
export interface DashboardStats {
  completedLessons: number;
  totalLessons: number;
  completedProjects: number;
  groups: number;
  pairedDevices: number;
  resumeLessonId?: string;
}
export type {
  BoardProfile,
  CompatibilityIssue,
  ModuleInstance,
  ModuleSpec,
} from '../../features/circuit-editor/compatibility';
export interface CircuitValidation {
  valid: boolean;
  issues: import('../../features/circuit-editor/compatibility').CompatibilityIssue[];
}
export interface MakerProject {
  id: string;
  title: string;
  description: string;
  version: number;
  code: string;
  modules: import('../../features/circuit-editor/compatibility').ModuleInstance[];
  updatedAt: string;
}
export interface AiTutorMessage {
  role: 'user' | 'assistant';
  content: string;
}
export interface AiTutorAnswer {
  answer: string;
  model: string;
  createdAt: string;
}
export interface AiTutorStatus {
  configured: boolean;
  model: string;
}
