import apiClient from "./api";

export interface ProfileUpdateDTO {
  full_name?: string;
  team_name?: string;
  branch?: string;
  semester?: number;
}

export interface PasswordUpdateDTO {
  current_password?: string;
  new_password?: string;
}

export const userService = {
  updateProfile: async (data: ProfileUpdateDTO) => {
    const response = await apiClient.put("/users/me", data);
    return response.data;
  },
  
  updatePassword: async (data: PasswordUpdateDTO) => {
    const response = await apiClient.put("/users/me/password", data);
    return response.data;
  }
};
