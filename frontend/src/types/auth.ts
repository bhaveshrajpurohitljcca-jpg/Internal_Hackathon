export type Role = "STUDENT" | "ADMIN" | "JUDGE";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  team_name?: string | null;
  enrollment_number?: string | null;
  branch?: string | null;
  semester?: number | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  full_name: string;
  team_name: string;
  enrollment_number: string;
  branch: string;
  semester: number;
}
