import apiClient from "@/services/api";

export interface Evaluation {
  id: string;
  submission_id: string;
  judge_id: string;
  innovation_score: number;
  technical_score: number;
  presentation_score: number;
  impact_score: number;
  ui_ux_score: number;
  documentation_score: number;
  total_score: number;
  remarks?: string;
  created_at: string;
}

export interface EvaluationCreate {
  submission_id: string;
  innovation_score: number;
  technical_score: number;
  presentation_score: number;
  impact_score: number;
  ui_ux_score: number;
  documentation_score: number;
  remarks?: string;
}

export const evaluationService = {
  async evaluateSubmission(data: EvaluationCreate): Promise<Evaluation> {
    const response = await apiClient.post<Evaluation>("/evaluations", data);
    return response.data;
  },

  async declareWinners(problemStatementId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/evaluations/declare-winners/${problemStatementId}`);
    return response.data;
  }
};
