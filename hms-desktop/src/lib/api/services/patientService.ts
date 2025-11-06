import apiClient from '../config';
import {
  ApiResponse,
  PaginatedResponse,
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientStats,
} from '../types';

class PatientService {
  // Create new patient
  async createPatient(patientData: CreatePatientRequest): Promise<Patient> {
    const response = await apiClient.post<ApiResponse<{ patient: Patient }>>(
      '/patients',
      patientData
    );
    return response.data.data.patient;
  }

  // Get all patients with pagination and search
  async getPatients(params?: {
    search?: string;
    gender?: string;
    bloodGroup?: string;
    page?: number;
    limit?: number;
  }): Promise<{ patients: Patient[]; pagination: any }> {
    const response = await apiClient.get<ApiResponse<{ patients: Patient[]; pagination: any }>>(
      '/patients',
      { params }
    );
    return response.data.data;
  }

  // Get patient by ID
  async getPatientById(id: string): Promise<Patient> {
    const response = await apiClient.get<ApiResponse<{ patient: Patient }>>(
      `/patients/${id}`
    );
    return response.data.data.patient;
  }

  // Update patient
  async updatePatient(id: string, patientData: UpdatePatientRequest): Promise<Patient> {
    const response = await apiClient.put<ApiResponse<{ patient: Patient }>>(
      `/patients/${id}`,
      patientData
    );
    return response.data.data.patient;
  }

  // Delete patient
  async deletePatient(id: string, force: boolean = false): Promise<void> {
    const params = force ? { force: 'true' } : {};
    await apiClient.delete<ApiResponse>(`/patients/${id}`, { params });
  }

  // Search patients by phone number
  async searchPatientsByPhone(phone: string): Promise<Patient[]> {
    const response = await apiClient.get<ApiResponse<{ patients: Patient[] }>>(
      `/patients/search/${phone}`
    );
    return response.data.data.patients;
  }

  // Search patients (general search)
  async searchPatients(searchTerm: string): Promise<{ patients: Patient[]; pagination: any }> {
    const response = await apiClient.get<ApiResponse<{ patients: Patient[]; pagination: any }>>(
      '/patients',
      { params: { search: searchTerm } }
    );
    return response.data.data;
  }

  // Get patient statistics
  async getPatientStats(): Promise<PatientStats> {
    const response = await apiClient.get<ApiResponse<PatientStats>>('/patients/stats');
    return response.data.data;
  }
}

export default new PatientService();
