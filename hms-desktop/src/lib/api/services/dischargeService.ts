import apiClient from '../config';
import { ApiResponse } from '../types';

export interface DischargeSummary {
  id: string;
  admissionId: string;
  patientId: string;
  doctorId: string;
  admissionDate: string;
  dischargeDate: string;
  diagnosis: string;
  treatmentGiven: string;
  proceduresPerformed?: string;
  medicationsPrescribed?: string;
  followUpInstructions?: string;
  nextAppointmentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  admission?: any;
  patient?: any;
  doctor?: any;
}

export interface CreateDischargeSummaryRequest {
  admissionId: string;
  doctorId: string;
  diagnosis: string;
  treatmentGiven: string;
  proceduresPerformed?: string;
  medicationsPrescribed?: string;
  followUpInstructions?: string;
  nextAppointmentDate?: string;
  notes?: string;
}

class DischargeService {
  async createDischargeSummary(data: CreateDischargeSummaryRequest): Promise<DischargeSummary> {
    const response = await apiClient.post<ApiResponse<{ dischargeSummary: DischargeSummary }>>('/discharge', data);
    return response.data.data.dischargeSummary;
  }

  async getDischargeSummaries(params?: {
    patientId?: string;
    doctorId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ dischargeSummaries: DischargeSummary[]; pagination: any }> {
    const response = await apiClient.get<ApiResponse<{ dischargeSummaries: DischargeSummary[]; pagination: any }>>('/discharge', { params });
    return response.data.data;
  }

  async getDischargeSummaryById(id: string): Promise<DischargeSummary> {
    const response = await apiClient.get<ApiResponse<{ dischargeSummary: DischargeSummary }>>(`/discharge/${id}`);
    return response.data.data.dischargeSummary;
  }

  async getDischargeSummaryByAdmission(admissionId: string): Promise<DischargeSummary | null> {
    try {
      const response = await apiClient.get<ApiResponse<{ dischargeSummary: DischargeSummary }>>(`/discharge/admission/${admissionId}`);
      return response.data.data.dischargeSummary;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async updateDischargeSummary(id: string, data: Partial<CreateDischargeSummaryRequest>): Promise<DischargeSummary> {
    const response = await apiClient.put<ApiResponse<{ dischargeSummary: DischargeSummary }>>(`/discharge/${id}`, data);
    return response.data.data.dischargeSummary;
  }
}

export default new DischargeService();

