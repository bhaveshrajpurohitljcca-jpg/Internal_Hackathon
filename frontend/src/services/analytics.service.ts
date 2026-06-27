import apiClient from "@/services/api";

export interface AnalyticsData {
  total_hackathons: number;
  total_registrations: number;
  total_submissions: number;
  total_evaluations: number;
  registrations_by_hackathon: Record<string, number>;
  submissions_by_status: Record<string, number>;
  department_participation: Record<string, number>;
}

export const analyticsService = {
  async getDashboardAnalytics(): Promise<AnalyticsData> {
    const response = await apiClient.get<AnalyticsData>("/analytics/dashboard");
    return response.data;
  }
};
