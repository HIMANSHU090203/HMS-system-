import apiClient from '../config';
import {
  ApiResponse,
  PaginatedResponse,
  Admission,
  CreateAdmissionRequest,
  UpdateAdmissionRequest,
  AdmissionStats,
} from '../types';

class AdmissionService {
  // Create new admission
  async createAdmission(admissionData: CreateAdmissionRequest): Promise<Admission> {
    const response = await apiClient.post<ApiResponse<{ admission: Admission }>>(
      '/admissions',
      admissionData
    );
    return response.data.data.admission;
  }

  // Get all admissions with pagination and search
  async getAdmissions(params?: {
    search?: string;
    patientId?: string;
    wardId?: string;
    status?: string;
    admissionType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ admissions: Admission[]; pagination: any }> {
    const response = await apiClient.get<ApiResponse<{ admissions: Admission[]; pagination: any }>>(
      '/admissions',
      { params }
    );
    return response.data.data;
  }

  // Get admission by ID
  async getAdmissionById(id: string): Promise<Admission> {
    const response = await apiClient.get<ApiResponse<{ admission: Admission }>>(
      `/admissions/${id}`
    );
    return response.data.data.admission;
  }

  // Update admission
  async updateAdmission(id: string, admissionData: UpdateAdmissionRequest): Promise<Admission> {
    const response = await apiClient.put<ApiResponse<{ admission: Admission }>>(
      `/admissions/${id}`,
      admissionData
    );
    return response.data.data.admission;
  }

  // Discharge patient
  async dischargePatient(id: string, dischargeNotes?: string): Promise<Admission> {
    const response = await apiClient.put<ApiResponse<{ admission: Admission }>>(
      `/admissions/${id}/discharge`,
      { dischargeNotes }
    );
    return response.data.data.admission;
  }

  // Get current admissions
  async getCurrentAdmissions(params?: {
    wardId?: string;
  }): Promise<Admission[]> {
    const response = await apiClient.get<ApiResponse<{ admissions: Admission[] }>>(
      '/admissions/current',
      { params }
    );
    return response.data.data.admissions;
  }

  // Get admission statistics
  async getAdmissionStats(): Promise<AdmissionStats> {
    const response = await apiClient.get<ApiResponse<AdmissionStats>>('/admissions/stats');
    return response.data.data;
  }

  // Get charges preview for an admission
  async getChargesPreview(admissionId: string): Promise<{
    roomCharges: number;
    procedureCharges: number;
    medicineCharges: number;
    labCharges: number;
    otherCharges: number;
    totalAmount: number;
    details: {
      wardType?: string;
      tariffPerDay?: number;
      daysCharged?: number;
    };
  }> {
    const response = await apiClient.get<ApiResponse<{
      roomCharges: number;
      procedureCharges: number;
      medicineCharges: number;
      labCharges: number;
      otherCharges: number;
      totalAmount: number;
      details: any;
    }>>(`/admissions/${admissionId}/charges-preview`);
    return response.data.data;
  }
}

export default new AdmissionService();
