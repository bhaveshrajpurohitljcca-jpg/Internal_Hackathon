import apiClient from "./api";
import type { PaginatedResponse } from "./hackathon.service";

export enum ProblemDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export interface ProblemStatement {
  id: string;
  hackathon_id: string;
  problem_code: string;
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
  category: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProblemStatementDTO {
  hackathon_id: string;
  problem_code: string;
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
  category: string;
}

export interface UpdateProblemStatementDTO {
  title?: string;
  description?: string;
  difficulty?: ProblemDifficulty;
  category?: string;
}

export interface ProblemStatementQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  hackathon_id?: string;
  is_published?: boolean;
}

export const problemStatementService = {
  // Admin Methods
  getAll: async (params?: ProblemStatementQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<ProblemStatement>>("/problem-statements", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ProblemStatement>(`/problem-statements/${id}`);
    return response.data;
  },

  create: async (data: CreateProblemStatementDTO) => {
    const response = await apiClient.post<ProblemStatement>("/problem-statements", data);
    return response.data;
  },

  update: async (id: string, data: UpdateProblemStatementDTO) => {
    const response = await apiClient.put<ProblemStatement>(`/problem-statements/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ProblemStatement>(`/problem-statements/${id}`);
    return response.data;
  },

  publish: async (id: string) => {
    const response = await apiClient.patch<ProblemStatement>(`/problem-statements/${id}/publish`);
    return response.data;
  },

  unpublish: async (id: string) => {
    const response = await apiClient.patch<ProblemStatement>(`/problem-statements/${id}/unpublish`);
    return response.data;
  },

  // Student Methods
  getForHackathon: async (slug: string, params?: { page?: number; page_size?: number }) => {
    const response = await apiClient.get<PaginatedResponse<ProblemStatement>>(`/hackathons/${slug}/problem-statements`, { params });
    return response.data;
  },

  getForHackathonById: async (slug: string, id: string) => {
    const response = await apiClient.get<ProblemStatement>(`/hackathons/${slug}/problem-statements/${id}`);
    return response.data;
  },
};
