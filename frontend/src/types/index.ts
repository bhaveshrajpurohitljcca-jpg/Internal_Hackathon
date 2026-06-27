export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[] | Record<string, string[]> | null;
}

export interface HealthData {
  status: string;
  service: string;
  environment: string;
  version: string;
}

export interface ProjectMetadata {
  name: string;
  description: string;
  version: string;
  environment: string;
  service: string;
  api_version: string;
  docs_url: string;
  health_url: string;
}
