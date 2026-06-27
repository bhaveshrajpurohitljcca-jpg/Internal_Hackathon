import apiClient from "@/services/api";
import type { User, LoginCredentials, SignupCredentials, AuthResponse } from "@/types/auth";
import { setAccessToken, clearAccessToken } from "@/lib/auth";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
    setAccessToken(response.data.access_token);
    return response.data;
  },

  async signup(data: SignupCredentials): Promise<User> {
    const response = await apiClient.post<User>("/auth/signup", data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },

  logout(): void {
    clearAccessToken();
  },
};
