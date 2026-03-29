// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface GoogleLoginDto {
  idToken: string;
}

export interface AuthResponseDto {
  userId: number;
  email: string;
  fullName: string;
  roles: string[];
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface UserProfileDto {
  id: number;
  userId: number;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
}

export interface UserDto {
  id: number;
  email: string;
  createdAt: string;
  profile?: UserProfileDto;
  roles: string[];
}

export interface UpdateUserProfileDto {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
}

// ─── Role ─────────────────────────────────────────────────────────────────────
export interface RoleDto {
  id: number;
  name: string;
}

export interface CreateRoleDto {
  name: string;
}

// ─── Feature ──────────────────────────────────────────────────────────────────
export interface FeatureDto {
  id: number;
  name: string;
  description?: string;
}

export interface CreateFeatureDto {
  name: string;
  description?: string;
}

export interface UpdateFeatureDto {
  name: string;
  description?: string;
}

// ─── Project ──────────────────────────────────────────────────────────────────
export type ProjectStatus = "Pending" | "Generating" | "Generated" | "Failed";

export interface ProjectDto {
  id: number;
  name: string;
  userId: number;
  siteType: string;
  jsonInput: string;
  designFramework?: string;
  theme?: string;
  figmaLink?: string;
  status: ProjectStatus;
  generatedAt?: string;
  filePath?: string;
  apiJson?: string;
}

export interface CreateProjectDto {
  name: string;
  siteType: string;
  jsonInput: string;
  designFramework?: string;
  theme?: string;
  figmaLink?: string;
}

export interface UpdateProjectDto {
  name?: string;
  designFramework?: string;
  theme?: string;
  figmaLink?: string;
  status?: string;
  filePath?: string;
}

// ─── Generation ───────────────────────────────────────────────────────────────
export interface GenerateProjectRequestDto {
  userId: number;
  projectName: string;
  siteType: string;
  designFramework?: string;
  theme?: string;
  figmaLink?: string;
  description?: string;
  features: number[];
  mdFileIds?: number[];
}

export interface GenerateProjectResponseDto {
  projectId: number;
  projectName: string;
  archivePath: string;
  status: string;
}

// ─── LLM Log ──────────────────────────────────────────────────────────────────
export type LLMLogStatus = "Pending" | "Success" | "Failed";

export interface LLMLogDto {
  id: number;
  projectId: number;
  stepType?: string;
  prompt?: string;
  response?: string;
  tokensUsed: number;
  status: LLMLogStatus;
  createdAt: string;
}

export interface MDFileDto {
  id: number;
  fileName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMDFileDto {
  fileName: string;
  content: string;
}

export interface UpdateMDFileDto {
  fileName?: string;
  content?: string;
}

// ─── Project MD Files ─────────────────────────────────────────────────────────
export interface ProjectMDFileDto {
  id: number;
  projectId: number;
  mdFileId: number;
  mdFileName: string;
  stepOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProjectMDFileDto {
  mdFileId: number;
  stepOrder: number;
  isActive?: boolean;
}

export interface UpdateProjectMDFileDto {
  stepOrder?: number;
  isActive?: boolean;
}
