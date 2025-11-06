import apiClient from '../config';
import { ApiResponse } from '../types';

export interface VitalSign {
  id: string;
  admissionId: string;
  recordedBy: string;
  temperature?: number;
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  notes?: string;
  recordedAt: string;
  createdAt: string;
  admission?: any;
  recordedByUser?: any;
}

export interface CreateVitalSignRequest {
  admissionId: string;
  recordedBy: string;
  temperature?: number;
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  notes?: string;
  recordedAt?: string;
}

class VitalSignService {
  async createVitalSign(data: CreateVitalSignRequest): Promise<VitalSign> {
    const response = await apiClient.post<ApiResponse<{ vitalSign: VitalSign }>>('/vital-signs', data);
    return response.data.data.vitalSign;
  }

  async getVitalSigns(params?: {
    admissionId?: string;
    recordedBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ vitalSigns: VitalSign[]; pagination: any }> {
    const response = await apiClient.get<ApiResponse<{ vitalSigns: VitalSign[]; pagination: any }>>('/vital-signs', { params });
    return response.data.data;
  }

  async getVitalSignById(id: string): Promise<VitalSign> {
    const response = await apiClient.get<ApiResponse<{ vitalSign: VitalSign }>>(`/vital-signs/${id}`);
    return response.data.data.vitalSign;
  }

  async updateVitalSign(id: string, data: Partial<CreateVitalSignRequest>): Promise<VitalSign> {
    const response = await apiClient.put<ApiResponse<{ vitalSign: VitalSign }>>(`/vital-signs/${id}`, data);
    return response.data.data.vitalSign;
  }

  async deleteVitalSign(id: string): Promise<void> {
    await apiClient.delete(`/vital-signs/${id}`);
  }

  async getAdmissionVitalSigns(admissionId: string): Promise<VitalSign[]> {
    const response = await apiClient.get<ApiResponse<{ vitalSigns: VitalSign[] }>>(`/vital-signs/admission/${admissionId}`);
    return response.data.data.vitalSigns;
  }

  async getLatestVitalSigns(admissionId: string): Promise<VitalSign | null> {
    const response = await apiClient.get<ApiResponse<{ vitalSign: VitalSign | null }>>(`/vital-signs/admission/${admissionId}/latest`);
    return response.data.data.vitalSign;
  }
}

export default new VitalSignService();

