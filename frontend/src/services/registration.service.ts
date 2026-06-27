import apiClient from "./api";
import type { PaginatedResponse } from "./hackathon.service";

export enum RegistrationStatus {
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN"
}

export interface Registration {
  id: string;
  hackathon_id: string;
  problem_statement_id: string | null;
  user_id: string;
  leader_id: string | null;
  team_id: string | null;
  team_name: string;
  status: RegistrationStatus;
  admin_remarks: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRegistrationDTO {
  hackathon_id: string;
  problem_statement_id: string;
  team_name: string;
}

export interface RegistrationQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  hackathon_id?: string;
  user_id?: string;
  status?: RegistrationStatus;
}

export const registrationService = {
  // Admin Methods
  getAll: async (params?: RegistrationQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<Registration>>("/registrations", { params });
    return response.data;
  },

  approve: async (id: string) => {
    const response = await apiClient.patch<Registration>(`/registrations/${id}/approve`);
    return response.data;
  },

  reject: async (id: string, admin_remarks: string) => {
    const response = await apiClient.patch<Registration>(`/registrations/${id}/reject`, { admin_remarks });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Registration>(`/registrations/${id}`);
    return response.data;
  },

  // Student Methods
  getMyRegistrations: async (params?: { page?: number; page_size?: number }) => {
    const response = await apiClient.get<PaginatedResponse<Registration>>("/registrations/my", { params });
    return response.data;
  },

  create: async (data: CreateRegistrationDTO) => {
    const response = await apiClient.post<Registration>("/registrations", data);
    return response.data;
  },
};
