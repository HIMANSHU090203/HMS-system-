import apiClient from '../config';
import { ApiResponse } from '../types';

export interface DailyRound {
  id: string;
  admissionId: string;
  doctorId: string;
  roundDate: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  nextRoundDate?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  admission?: any;
  doctor?: any;
}

export interface CreateDailyRoundRequest {
  admissionId: string;
  doctorId: string;
  roundDate: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  nextRoundDate?: string;
  isCompleted?: boolean;
}

class DailyRoundService {
  async createDailyRound(data: CreateDailyRoundRequest): Promise<DailyRound> {
    const response = await apiClient.post<ApiResponse<{ dailyRound: DailyRound }>>('/daily-rounds', data);
    return response.data.data.dailyRound;
  }

  async getDailyRounds(params?: {
    admissionId?: string;
    doctorId?: string;
    isCompleted?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ dailyRounds: DailyRound[]; pagination: any }> {
    const response = await apiClient.get<ApiResponse<{ dailyRounds: DailyRound[]; pagination: any }>>('/daily-rounds', { params });
    return response.data.data;
  }

  async getDailyRoundById(id: string): Promise<DailyRound> {
    const response = await apiClient.get<ApiResponse<{ dailyRound: DailyRound }>>(`/daily-rounds/${id}`);
    return response.data.data.dailyRound;
  }

  async updateDailyRound(id: string, data: Partial<CreateDailyRoundRequest>): Promise<DailyRound> {
    const response = await apiClient.put<ApiResponse<{ dailyRound: DailyRound }>>(`/daily-rounds/${id}`, data);
    return response.data.data.dailyRound;
  }

  async deleteDailyRound(id: string): Promise<void> {
    await apiClient.delete(`/daily-rounds/${id}`);
  }

  async getAdmissionDailyRounds(admissionId: string): Promise<DailyRound[]> {
    const response = await apiClient.get<ApiResponse<{ dailyRounds: DailyRound[] }>>(`/daily-rounds/admission/${admissionId}`);
    return response.data.data.dailyRounds;
  }
}

export default new DailyRoundService();

