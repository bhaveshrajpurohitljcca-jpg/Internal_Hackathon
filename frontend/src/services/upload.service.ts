import apiClient from "./api";

export interface UploadResponse {
  url: string;
}

export const uploadService = {
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<UploadResponse>("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (onProgress) {
            onProgress(percentCompleted);
          }
        }
      },
    });

    return response.data.url;
  },
};
