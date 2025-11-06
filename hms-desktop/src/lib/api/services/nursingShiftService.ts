import apiClient from '../config';
import { ApiResponse } from '../types';

export enum ShiftType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  NIGHT = 'NIGHT',
  GENERAL = 'GENERAL',
}

export interface NursingShift {
  id: string;
  admissionId: string;
  nurseId: string;
  shiftType: ShiftType;
  shiftDate: string;
  startTime: string;
  endTime?: string;
  notes?: string;
  medications?: any;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  admission?: any;
  nurse?: any;
}

export interface CreateNursingShiftRequest {
  admissionId: string;
  nurseId: string;
  shiftType: ShiftType;
  shiftDate: string;
  startTime: string;
  endTime?: string;
  notes?: string;
  medications?: any;
  isCompleted?: boolean;
}

class NursingShiftService {
  async createNursingShift(data: CreateNursingShiftRequest): Promise<NursingShift> {
    const response = await apiClient.post<ApiResponse<{ nursingShift: NursingShift }>>('/nursing-shifts', data);
    return response.data.data.nursingShift;
  }

  async getNursingShifts(params?: {
    admissionId?: string;
    nurseId?: string;
    shiftType?: ShiftType;
    isCompleted?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ nursingShifts: NursingShift[]; pagination: any }> {
    const response = await apiClient.get<ApiResponse<{ nursingShifts: NursingShift[]; pagination: any }>>('/nursing-shifts', { params });
    return response.data.data;
  }

  async getNursingShiftById(id: string): Promise<NursingShift> {
    const response = await apiClient.get<ApiResponse<{ nursingShift: NursingShift }>>(`/nursing-shifts/${id}`);
    return response.data.data.nursingShift;
  }

  async updateNursingShift(id: string, data: Partial<CreateNursingShiftRequest>): Promise<NursingShift> {
    const response = await apiClient.put<ApiResponse<{ nursingShift: NursingShift }>>(`/nursing-shifts/${id}`, data);
    return response.data.data.nursingShift;
  }

  async deleteNursingShift(id: string): Promise<void> {
    await apiClient.delete(`/nursing-shifts/${id}`);
  }

  async getAdmissionNursingShifts(admissionId: string): Promise<NursingShift[]> {
    const response = await apiClient.get<ApiResponse<{ nursingShifts: NursingShift[] }>>(`/nursing-shifts/admission/${admissionId}`);
    return response.data.data.nursingShifts;
  }
}

export default new NursingShiftService();

