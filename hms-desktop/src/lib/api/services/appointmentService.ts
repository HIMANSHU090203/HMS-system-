import apiClient from '../config';
import {
  ApiResponse,
  PaginatedResponse,
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentStats,
} from '../types';

class AppointmentService {
  // Create new appointment
  async createAppointment(appointmentData: CreateAppointmentRequest): Promise<Appointment> {
    const response = await apiClient.post<ApiResponse<{ appointment: Appointment }>>(
      '/appointments',
      appointmentData
    );
    return response.data.data.appointment;
  }

  // Get all appointments with pagination and filters
  async getAppointments(params?: {
    patientId?: string;
    doctorId?: string;
    date?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ appointments: Appointment[]; pagination: any }> {
    const response = await apiClient.get<ApiResponse<{ appointments: Appointment[]; pagination: any }>>(
      '/appointments',
      { params }
    );
    return response.data.data;
  }

  // Get appointment by ID
  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await apiClient.get<ApiResponse<{ appointment: Appointment }>>(
      `/appointments/${id}`
    );
    return response.data.data.appointment;
  }

  // Update appointment
  async updateAppointment(id: string, appointmentData: UpdateAppointmentRequest): Promise<Appointment> {
    const response = await apiClient.put<ApiResponse<{ appointment: Appointment }>>(
      `/appointments/${id}`,
      appointmentData
    );
    return response.data.data.appointment;
  }

  // Delete appointment
  async deleteAppointment(id: string): Promise<void> {
    await apiClient.delete<ApiResponse>(`/appointments/${id}`);
  }

  // Get available doctors
  async getAvailableDoctors(): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<{ doctors: any[] }>>(
      '/appointments/doctors'
    );
    return response.data.data.doctors;
  }

  // Get today's appointments
  async getTodayAppointments(): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await this.getAppointments({ date: today });
    return response.appointments;
  }

  // Get appointment statistics
  async getAppointmentStats(): Promise<AppointmentStats> {
    const response = await apiClient.get<ApiResponse<AppointmentStats>>('/appointments/stats');
    return response.data.data;
  }
}

export default new AppointmentService();
