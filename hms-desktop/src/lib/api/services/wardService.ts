import apiClient from '../config';
import {
  ApiResponse,
  Ward,
  CreateWardRequest,
  UpdateWardRequest,
  WardStats,
} from '../types';

class WardService {
  // Create new ward
  async createWard(wardData: CreateWardRequest): Promise<Ward> {
    const response = await apiClient.post<ApiResponse<{ ward: Ward }>>(
      '/wards',
      wardData
    );
    return response.data.data.ward;
  }

  // Get all wards with pagination and search
  async getWards(params?: {
    search?: string;
    type?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ wards: Ward[]; pagination: any }> {
    const response = await apiClient.get<ApiResponse<{ wards: Ward[]; pagination: any }>>(
      '/wards',
      { params }
    );
    return response.data.data;
  }

  // Get ward by ID
  async getWardById(id: string): Promise<Ward> {
    const response = await apiClient.get<ApiResponse<{ ward: Ward }>>(
      `/wards/${id}`
    );
    return response.data.data.ward;
  }

  // Update ward
  async updateWard(id: string, wardData: UpdateWardRequest): Promise<Ward> {
    const response = await apiClient.put<ApiResponse<{ ward: Ward }>>(
      `/wards/${id}`,
      wardData
    );
    return response.data.data.ward;
  }

  // Delete ward
  async deleteWard(id: string, params?: { force?: string }): Promise<void> {
    await apiClient.delete<ApiResponse>(`/wards/${id}`, { params });
  }

  // Get ward statistics
  async getWardStats(): Promise<WardStats> {
    const response = await apiClient.get<ApiResponse<WardStats>>('/wards/stats');
    return response.data.data;
  }
}

export default new WardService();
