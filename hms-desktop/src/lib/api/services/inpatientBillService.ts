import apiClient from '../config';
import { ApiResponse, PaymentStatus, PaymentMode } from '../types';

export interface InpatientBill {
  id: string;
  admissionId: string;
  patientId: string;
  roomCharges: number;
  procedureCharges: number;
  medicineCharges: number;
  labCharges: number;
  otherCharges: number;
  totalAmount: number;
  status: PaymentStatus;
  paymentMode?: PaymentMode;
  paidAmount?: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  admission?: any;
  patient?: any;
  createdByUser?: any;
}

export interface CreateInpatientBillRequest {
  admissionId: string;
  roomCharges: number;
  procedureCharges?: number;
  medicineCharges?: number;
  labCharges?: number;
  otherCharges?: number;
  notes?: string;
}

class InpatientBillService {
  async createInpatientBill(data: CreateInpatientBillRequest): Promise<InpatientBill> {
    const response = await apiClient.post<ApiResponse<{ inpatientBill: InpatientBill }>>('/inpatient-bills', data);
    return response.data.data.inpatientBill;
  }

  async getInpatientBills(params?: {
    admissionId?: string;
    patientId?: string;
    status?: PaymentStatus;
    page?: number;
    limit?: number;
  }): Promise<{ inpatientBills: InpatientBill[]; pagination: any }> {
    const response = await apiClient.get<ApiResponse<{ inpatientBills: InpatientBill[]; pagination: any }>>('/inpatient-bills', { params });
    return response.data.data;
  }

  async getInpatientBillById(id: string): Promise<InpatientBill> {
    const response = await apiClient.get<ApiResponse<{ inpatientBill: InpatientBill }>>(`/inpatient-bills/${id}`);
    return response.data.data.inpatientBill;
  }

  async updateInpatientBill(id: string, data: Partial<CreateInpatientBillRequest> & { status?: PaymentStatus; paymentMode?: PaymentMode; paidAmount?: number }): Promise<InpatientBill> {
    const response = await apiClient.put<ApiResponse<{ inpatientBill: InpatientBill }>>(`/inpatient-bills/${id}`, data);
    return response.data.data.inpatientBill;
  }

  async getAdmissionInpatientBills(admissionId: string): Promise<InpatientBill[]> {
    const response = await apiClient.get<ApiResponse<{ inpatientBills: InpatientBill[] }>>(`/inpatient-bills/admission/${admissionId}`);
    return response.data.data.inpatientBills;
  }
}

export default new InpatientBillService();

