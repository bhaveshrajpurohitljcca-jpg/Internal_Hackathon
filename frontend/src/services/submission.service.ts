import apiClient from "./api";
import type { PaginatedResponse } from "./hackathon.service";

export enum SubmissionStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface Submission {
  id: string;
  registration_id: string;
  problem_statement_id: string;
  repository_url: string | null;
  demo_video_url: string | null;
  ppt_url: string | null;
  zip_url: string | null;
  project_description: string | null;
  tech_stack: string | null;
  notes: string | null;
  score: number | null;
  feedback: string | null;
  remarks: string | null;
  status: SubmissionStatus;
  created_at: string;
  updated_at: string;
}

export interface UpdateSubmissionDTO {
  repository_url?: string | null;
  demo_video_url?: string | null;
  ppt_url?: string | null;
  zip_url?: string | null;
  project_description?: string | null;
  tech_stack?: string | null;
  notes?: string | null;
}

export interface SubmissionAdminUpdateDTO {
  status?: SubmissionStatus;
  score?: number | null;
  feedback?: string | null;
  remarks?: string | null;
}

export interface SubmissionQueryParams {
  page?: number;
  page_size?: number;
  registration_id?: string;
  problem_statement_id?: string;
  status?: SubmissionStatus;
}

export const submissionService = {
  // Admin Methods
  getAll: async (params?: SubmissionQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<Submission>>("/submissions", { params });
    return response.data;
  },

  adminUpdate: async (id: string, data: SubmissionAdminUpdateDTO) => {
    const response = await apiClient.patch<Submission>(`/submissions/${id}/admin`, data);
    return response.data;
  },

  // General Methods
  getById: async (id: string) => {
    const response = await apiClient.get<Submission>(`/submissions/${id}`);
    return response.data;
  },

  getByRegistrationId: async (registrationId: string) => {
    const response = await apiClient.get<Submission>(`/submissions/by-registration/${registrationId}`);
    return response.data;
  },

  // Student Methods
  update: async (id: string, data: UpdateSubmissionDTO) => {
    const response = await apiClient.put<Submission>(`/submissions/${id}`, data);
    return response.data;
  },
};
