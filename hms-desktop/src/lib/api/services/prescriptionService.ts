import apiClient from '../config';
import {
  ApiResponse,
  Prescription,
  PrescriptionCreateRequest,
  PrescriptionUpdateRequest,
  PrescriptionSearchParams,
  PrescriptionStats,
} from '../types';

class PrescriptionService {
  async getPrescriptions(params?: PrescriptionSearchParams): Promise<{
    prescriptions: Prescription[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const response = await apiClient.get<ApiResponse<{
      prescriptions: Prescription[];
      pagination: any;
    }>>('/prescriptions', { params });
    return response.data.data;
  }

  async getPrescriptionById(id: string): Promise<{ prescription: Prescription }> {
    const response = await apiClient.get<ApiResponse<{ prescription: Prescription }>>(
      `/prescriptions/${id}`
    );
    return response.data.data;
  }

  async createPrescription(prescriptionData: PrescriptionCreateRequest): Promise<{ prescription: Prescription }> {
    const response = await apiClient.post<ApiResponse<{ prescription: Prescription }>>(
      '/prescriptions',
      prescriptionData
    );
    return response.data.data;
  }

  async updatePrescription(id: string, prescriptionData: PrescriptionUpdateRequest): Promise<{ prescription: Prescription }> {
    const response = await apiClient.put<ApiResponse<{ prescription: Prescription }>>(
      `/prescriptions/${id}`,
      prescriptionData
    );
    return response.data.data;
  }

  async getPendingPrescriptions(): Promise<{ prescriptions: Prescription[] }> {
    const response = await apiClient.get<ApiResponse<{ prescriptions: Prescription[] }>>(
      '/prescriptions/pending'
    );
    return response.data.data;
  }

  async getPrescriptionStats(): Promise<PrescriptionStats> {
    const response = await apiClient.get<ApiResponse<PrescriptionStats>>('/prescriptions/stats');
    return response.data.data;
  }

  async getPrescriptionsByPatient(patientId: string): Promise<{ prescriptions: Prescription[] }> {
    const response = await apiClient.get<ApiResponse<{ prescriptions: Prescription[] }>>(
      '/prescriptions',
      { params: { patientId } }
    );
    return response.data.data;
  }

  async getPrescriptionsByDoctor(doctorId: string): Promise<{ prescriptions: Prescription[] }> {
    const response = await apiClient.get<ApiResponse<{ prescriptions: Prescription[] }>>(
      '/prescriptions',
      { params: { doctorId } }
    );
    return response.data.data;
  }

  async getPrescriptionsByStatus(status: string): Promise<{ prescriptions: Prescription[] }> {
    const response = await apiClient.get<ApiResponse<{ prescriptions: Prescription[] }>>(
      '/prescriptions',
      { params: { status } }
    );
    return response.data.data;
  }

  async searchPrescriptions(searchTerm: string): Promise<{ prescriptions: Prescription[] }> {
    const response = await apiClient.get<ApiResponse<{ prescriptions: Prescription[] }>>(
      '/prescriptions',
      { params: { search: searchTerm } }
    );
    return response.data.data;
  }

  async dispensePrescription(id: string, notes?: string): Promise<{ prescription: Prescription }> {
    const response = await apiClient.post<ApiResponse<{ prescription: Prescription }>>(
      `/prescriptions/${id}/dispense`,
      { notes }
    );
    return response.data.data;
  }

  async cancelPrescription(id: string, reason?: string): Promise<{ prescription: Prescription }> {
    const response = await apiClient.post<ApiResponse<{ prescription: Prescription }>>(
      `/prescriptions/${id}/cancel`,
      { reason }
    );
    return response.data.data;
  }

  async deletePrescription(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/prescriptions/${id}`
    );
    return response.data.data;
  }
}

export default new PrescriptionService();