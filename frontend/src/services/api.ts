import axios from "axios";
import type {
  AuthResponseDto,
  UserDto,
  UpdateUserProfileDto,
  FeatureDto,
  CreateFeatureDto,
  ProjectDto,
  CreateProjectDto,
  UpdateProjectDto,
  GenerateProjectRequestDto,
  GenerateProjectResponseDto,
  LLMLogDto,
  MDFileDto,
  CreateMDFileDto,
  UpdateMDFileDto,
} from "../types/api";

const api = axios.create({ baseURL: "/api" });

// Attach JWT / auth header if we ever add token-based auth downstream
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("auth");
  if (raw) {
    const auth = JSON.parse(raw) as AuthResponseDto;
    config.headers["X-User-Id"] = String(auth.userId);
  }
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const googleLogin = (idToken: string) =>
  api.post<AuthResponseDto>("/auth/google", { idToken }).then((r) => r.data);

// ─── Users ────────────────────────────────────────────────────────────────────
export const getUsers = () => api.get<UserDto[]>("/users").then((r) => r.data);
export const getUserById = (id: number) =>
  api.get<UserDto>(`/users/${id}`).then((r) => r.data);
export const updateUserProfile = (id: number, dto: UpdateUserProfileDto) =>
  api.put<UserDto>(`/users/${id}/profile`, dto).then((r) => r.data);
export const deleteUser = (id: number) => api.delete(`/users/${id}`);
export const assignRole = (userId: number, roleId: number) =>
  api.post(`/users/${userId}/roles/${roleId}`);
export const removeRole = (userId: number, roleId: number) =>
  api.delete(`/users/${userId}/roles/${roleId}`);

// ─── Features ─────────────────────────────────────────────────────────────────
export const getFeatures = () =>
  api.get<FeatureDto[]>("/features").then((r) => r.data);
export const createFeature = (dto: CreateFeatureDto) =>
  api.post<FeatureDto>("/features", dto).then((r) => r.data);
export const deleteFeature = (id: number) => api.delete(`/features/${id}`);

// ─── Projects ─────────────────────────────────────────────────────────────────
export const getProjects = () =>
  api.get<ProjectDto[]>("/projects").then((r) => r.data);
export const getProjectsByUser = (userId: number) =>
  api.get<ProjectDto[]>(`/projects/user/${userId}`).then((r) => r.data);
export const getProjectById = (id: number) =>
  api.get<ProjectDto>(`/projects/${id}`).then((r) => r.data);
export const createProject = (userId: number, dto: CreateProjectDto) =>
  api.post<ProjectDto>(`/projects/${userId}`, dto).then((r) => r.data);
export const updateProject = (id: number, dto: UpdateProjectDto) =>
  api.put<ProjectDto>(`/projects/${id}`, dto).then((r) => r.data);
export const deleteProject = (id: number) => api.delete(`/projects/${id}`);
export const generateProject = (dto: GenerateProjectRequestDto) =>
  api
    .post<GenerateProjectResponseDto>("/projects/generate", dto)
    .then((r) => r.data);
export const downloadProject = (id: number) =>
  api
    .get(`/projects/${id}/download`, { responseType: "blob" })
    .then((r) => r.data as Blob);

// ─── LLM Logs ─────────────────────────────────────────────────────────────────
export const getLLMLogsByProject = (projectId: number) =>
  api.get<LLMLogDto[]>(`/llmlogs/project/${projectId}`).then((r) => r.data);
export const getLLMLogById = (id: number) =>
  api.get<LLMLogDto>(`/llmlogs/${id}`).then((r) => r.data);

// ─── MD Files ─────────────────────────────────────────────────────────────────
export const getMDFiles = () =>
  api.get<MDFileDto[]>("/mdfiles").then((r) => r.data);
export const getMDFileById = (id: number) =>
  api.get<MDFileDto>(`/mdfiles/${id}`).then((r) => r.data);
export const createMDFile = (dto: CreateMDFileDto) =>
  api.post<MDFileDto>("/mdfiles", dto).then((r) => r.data);
export const updateMDFile = (id: number, dto: UpdateMDFileDto) =>
  api.put<MDFileDto>(`/mdfiles/${id}`, dto).then((r) => r.data);
export const deleteMDFile = (id: number) => api.delete(`/mdfiles/${id}`);
