import apiClient from "@/services/api";

export interface DashboardStats {
  total_hackathons: number;
  total_students: number;
  total_teams: number;
  registrations: {
    pending: number;
    approved: number;
    rejected: number;
  };
  submissions: {
    total: number;
    accepted: number;
    rejected: number;
  };
  leaderboard?: Array<{
    id: string;
    team_name: string;
    score: number;
    placement: number | null;
    problem_code: string;
  }>;
}

export interface StudentStats {
  registered_hackathons: number;
  recent_registrations: Array<{ team_name: string; status: string }>;
  submission_statuses: Array<{ id: string; status: string }>;
  upcoming_deadlines: Array<{ title: string; deadline: string }>;
  notifications: Array<{ id: number; message: string }>;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<{ data: DashboardStats }>("/dashboard/stats");
    return response.data.data;
  },
  async getStudentStats(): Promise<StudentStats> {
    const response = await apiClient.get<{ data: StudentStats }>("/dashboard/student-stats");
    return response.data.data;
  }
};
