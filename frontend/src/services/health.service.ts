import apiClient from "@/services/api";
import type { ApiResponse, HealthData, ProjectMetadata } from "@/types";

export const healthService = {
  async check(): Promise<HealthData> {
    const { data } = await apiClient.get<ApiResponse<HealthData>>("/health");
    return data.data!;
  },
};

export const metadataService = {
  async get(): Promise<ProjectMetadata> {
    const { data } = await apiClient.get<ApiResponse<ProjectMetadata>>("/metadata");
    return data.data!;
  },
};
