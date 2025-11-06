import apiClient from '../config';
import {
  ApiResponse,
  Consultation,
  ConsultationCreateRequest,
  ConsultationUpdateRequest,
  ConsultationSearchParams,
} from '../types';

class ConsultationService {
  // Get all consultations with search and pagination
  async getConsultations(params?: ConsultationSearchParams): Promise<{
    consultations: Consultation[];
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
      consultations: Consultation[];
      pagination: any;
    }>>('/consultations', { params });
    return response.data.data;
  }

  // Get consultation by ID
  async getConsultationById(id: string): Promise<{ consultation: Consultation }> {
    const response = await apiClient.get<ApiResponse<{ consultation: Consultation }>>(
      `/consultations/${id}`
    );
    return response.data.data;
  }

  // Create new consultation
  async createConsultation(consultationData: ConsultationCreateRequest): Promise<{ consultation: Consultation }> {
    const response = await apiClient.post<ApiResponse<{ consultation: Consultation }>>(
      '/consultations',
      consultationData
    );
    return response.data.data;
  }

  // Update consultation
  async updateConsultation(id: string, consultationData: ConsultationUpdateRequest): Promise<{ consultation: Consultation }> {
    const response = await apiClient.put<ApiResponse<{ consultation: Consultation }>>(
      `/consultations/${id}`,
      consultationData
    );
    return response.data.data;
  }

  // Delete consultation
  async deleteConsultation(id: string): Promise<void> {
    await apiClient.delete<ApiResponse>(`/consultations/${id}`);
  }

  // Get consultation statistics
  async getConsultationStats(): Promise<{
    totalConsultations: number;
    consultationsByDoctor: Array<{
      doctorId: string;
      doctorName: string;
      _count: { doctorId: number };
    }>;
    recentConsultations: number;
    todayConsultations: number;
  }> {
    const response = await apiClient.get<ApiResponse<{
      totalConsultations: number;
      consultationsByDoctor: Array<{
        doctorId: string;
        doctorName: string;
        _count: { doctorId: number };
      }>;
      recentConsultations: number;
      todayConsultations: number;
    }>>('/consultations/stats');
    return response.data.data;
  }

  // Get consultations by patient ID
  async getConsultationsByPatient(patientId: string): Promise<{ consultations: Consultation[] }> {
    const response = await apiClient.get<ApiResponse<{ consultations: Consultation[] }>>(
      '/consultations',
      { params: { patientId } }
    );
    return response.data.data;
  }

  // Get consultations by doctor ID
  async getConsultationsByDoctor(doctorId: string): Promise<{ consultations: Consultation[] }> {
    const response = await apiClient.get<ApiResponse<{ consultations: Consultation[] }>>(
      '/consultations',
      { params: { doctorId } }
    );
    return response.data.data;
  }

  // Get consultations by appointment ID
  async getConsultationsByAppointment(appointmentId: string): Promise<{ consultations: Consultation[] }> {
    const response = await apiClient.get<ApiResponse<{ consultations: Consultation[] }>>(
      '/consultations',
      { params: { appointmentId } }
    );
    return response.data.data;
  }

  // Search consultations
  async searchConsultations(searchTerm: string): Promise<{ consultations: Consultation[] }> {
    const response = await apiClient.get<ApiResponse<{ consultations: Consultation[] }>>(
      '/consultations',
      { params: { search: searchTerm } }
    );
    return response.data.data;
  }
}

export default new ConsultationService();