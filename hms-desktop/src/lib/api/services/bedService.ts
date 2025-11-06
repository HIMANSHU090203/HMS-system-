import apiClient from '../config';
import {
  ApiResponse,
  PaginatedResponse,
  Bed,
  CreateBedRequest,
  UpdateBedRequest,
  BedStats,
} from '../types';

class BedService {
  // Create new bed
  async createBed(bedData: CreateBedRequest): Promise<Bed> {
    const response = await apiClient.post<ApiResponse<{ bed: Bed }>>(
      '/beds',
      bedData
    );
    return response.data.data.bed;
  }

  // Get all beds with pagination and search
  async getBeds(params?: {
    wardId?: string;
    bedType?: string;
    isOccupied?: boolean;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ beds: Bed[]; pagination: any }> {
    const response = await apiClient.get<ApiResponse<{ beds: Bed[]; pagination: any }>>(
      '/beds',
      { params }
    );
    return response.data.data;
  }

  // Get bed by ID
  async getBedById(id: string): Promise<Bed> {
    const response = await apiClient.get<ApiResponse<{ bed: Bed }>>(
      `/beds/${id}`
    );
    return response.data.data.bed;
  }

  // Update bed
  async updateBed(id: string, bedData: UpdateBedRequest): Promise<Bed> {
    const response = await apiClient.put<ApiResponse<{ bed: Bed }>>(
      `/beds/${id}`,
      bedData
    );
    return response.data.data.bed;
  }

  // Delete bed
  async deleteBed(id: string): Promise<void> {
    await apiClient.delete<ApiResponse>(`/beds/${id}`);
  }

  // Get available beds
  async getAvailableBeds(params?: {
    wardId?: string;
    bedType?: string;
  }): Promise<Bed[]> {
    const response = await apiClient.get<ApiResponse<{ beds: Bed[] }>>(
      '/beds/available',
      { params }
    );
    return response.data.data.beds;
  }

  // Get bed statistics
  async getBedStats(): Promise<BedStats> {
    const response = await apiClient.get<ApiResponse<BedStats>>('/beds/stats');
    return response.data.data;
  }
}

export default new BedService();
