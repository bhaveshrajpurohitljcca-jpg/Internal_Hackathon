import apiClient from "@/services/api";

export enum HackathonStatus {
  UPCOMING = "UPCOMING",
  REGISTRATION_OPEN = "REGISTRATION_OPEN",
  SUBMISSION_OPEN = "SUBMISSION_OPEN",
  CLOSED = "CLOSED"
}

export enum HackathonMode {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  HYBRID = "HYBRID"
}

export interface Hackathon {
  id: string;
  title: string;
  slug: string;
  description: string;
  registration_start_date: string;
  registration_end_date: string;
  submission_deadline: string;
  status: HackathonStatus;
  is_registration_open?: boolean;
  max_teams: number | null;
  is_featured: boolean;
  banner_image: string | null;
  location: string;
  mode: HackathonMode;
  min_team_members: number;
  max_team_members: number;
  min_female_members: number;
  max_female_members: number | null;
  allow_individual: boolean;
  allow_cross_department: boolean;
  allow_multiple_teams_per_student: boolean;
  is_private: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface HackathonQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: HackathonStatus;
  sort_by?: "latest" | "deadline";
}

export type CreateHackathonDTO = Omit<Hackathon, "id" | "slug" | "status" | "created_by" | "created_at" | "updated_at">;
export type UpdateHackathonDTO = Partial<CreateHackathonDTO> & { status?: HackathonStatus };

export const hackathonService = {
  async getAll(params?: HackathonQueryParams): Promise<PaginatedResponse<Hackathon>> {
    const response = await apiClient.get<PaginatedResponse<Hackathon>>("/hackathons", { params });
    return response.data;
  },

  async getBySlug(slug: string): Promise<Hackathon> {
    const response = await apiClient.get<Hackathon>(`/hackathons/${slug}`);
    return response.data;
  },

  async create(data: CreateHackathonDTO): Promise<Hackathon> {
    const response = await apiClient.post<Hackathon>("/hackathons", data);
    return response.data;
  },

  async update(id: string, data: UpdateHackathonDTO): Promise<Hackathon> {
    const response = await apiClient.put<Hackathon>(`/hackathons/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/hackathons/${id}`);
  }
};
