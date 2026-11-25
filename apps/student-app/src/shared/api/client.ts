import type {
  DashboardStats,
  LessonDetail,
  LessonSummary,
  ModuleSummary,
  Progress,
  ProjectSummary,
  User,
  BoardProfile,
  CircuitValidation,
  MakerProject,
  ModuleInstance,
  ModuleSpec,
  AiTutorAnswer,
  AiTutorMessage,
  AiTutorStatus,
} from '../types/domain';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

function csrfToken(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = csrfToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ code: 'NETWORK_ERROR', message: 'Không thể đọc phản hồi máy chủ.' }));
    throw new ApiError(response.status, body.code, body.message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  me: () => request<User>('/auth/me'),
  csrf: () => request<void>('/auth/csrf'),
  login: (username: string, password: string) =>
    request<User>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (displayName: string, username: string, password: string) =>
    request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ displayName, username, password }),
    }),
  logout: async () => {
    // Refresh the cookie-backed CSRF token before ending a possibly long-lived session.
    await request<void>('/auth/csrf');
    await request<void>('/auth/logout', { method: 'POST' });
  },
  lessons: () => request<LessonSummary[]>('/lessons'),
  lesson: (id: string) => request<LessonDetail>(`/lessons/${id}`),
  progress: (id: string) => request<Progress>(`/lessons/${id}/progress`),
  saveProgress: (id: string, progress: Omit<Progress, 'lessonId' | 'updatedAt'>) =>
    request<Progress>(`/lessons/${id}/progress`, { method: 'PUT', body: JSON.stringify(progress) }),
  modules: () => request<ModuleSummary[]>('/modules'),
  projects: () => request<ProjectSummary[]>('/curriculum/projects'),
  stats: () => request<DashboardStats>('/dashboard'),
  boardProfile: () => request<BoardProfile>('/board-profiles/esp32-wroom32-demo'),
  moduleSpecs: () => request<ModuleSpec[]>('/module-specs'),
  validateCircuit: (modules: ModuleInstance[]) =>
    request<CircuitValidation>('/circuits/validate', {
      method: 'POST',
      body: JSON.stringify({
        boardProfileId: 'esp32-wroom32-demo',
        boardProfileVersion: 1,
        modules,
      }),
    }),
  createProject: (project: Pick<MakerProject, 'title' | 'description' | 'code' | 'modules'>) =>
    request<MakerProject>('/projects', { method: 'POST', body: JSON.stringify(project) }),
  askAiTutor: (question: string, history: AiTutorMessage[]) =>
    request<AiTutorAnswer>('/ai/tutor', {
      method: 'POST',
      body: JSON.stringify({ question, history: history.slice(-8) }),
    }),
  aiTutorStatus: () => request<AiTutorStatus>('/ai/tutor/status'),
};
