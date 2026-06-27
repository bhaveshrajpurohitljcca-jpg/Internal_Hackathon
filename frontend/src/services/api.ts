import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import toast from "react-hot-toast";
import { getAccessToken } from "@/lib/auth";
import type { ApiResponse } from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 30_000),
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => response,
  (error: AxiosError<ApiResponse>) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      "An unexpected error occurred";

    if (error.response?.status !== 401 && error.response?.status !== 404) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
