import apiClient from '../config';
import { Medicine, CreateMedicineRequest, UpdateMedicineRequest, MedicineSearchParams, UpdateStockRequest, MedicineStats } from '../types';

const medicineService = {
  // Create a new medicine
  createMedicine: async (data: CreateMedicineRequest) => {
    const response = await apiClient.post('/medicines', data);
    return response.data;
  },

  // Get all medicines with optional search and pagination
  getMedicines: async (params?: MedicineSearchParams) => {
    const response = await apiClient.get('/medicines', { params });
    return response.data;
  },

  // Get medicine by ID
  getMedicineById: async (id: string) => {
    const response = await apiClient.get(`/medicines/${id}`);
    return response.data;
  },

  // Update medicine
  updateMedicine: async (id: string, data: UpdateMedicineRequest) => {
    const response = await apiClient.put(`/medicines/${id}`, data);
    return response.data;
  },

  // Update medicine stock
  updateStock: async (id: string, data: UpdateStockRequest) => {
    const response = await apiClient.patch(`/medicines/${id}/stock`, data);
    return response.data;
  },

  // Delete medicine
  deleteMedicine: async (id: string) => {
    const response = await apiClient.delete(`/medicines/${id}`);
    return response.data;
  },

  // Get medicine statistics
  getStats: async (): Promise<{ data: MedicineStats }> => {
    const response = await apiClient.get('/medicines/stats');
    return response.data;
  },

  // Get low stock medicines
  getLowStockMedicines: async () => {
    const response = await apiClient.get('/medicines/low-stock');
    return response.data;
  },

  // Get medicine transactions
  getTransactions: async (medicineId?: string, page = 1, limit = 20) => {
    const params: any = { page, limit };
    if (medicineId) {
      params.medicineId = medicineId;
    }
    const response = await apiClient.get('/medicines/transactions', { params });
    return response.data;
  },

  // Enhanced functionality - Import medicine catalog
  importCatalog: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/medicines/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Order management
  createOrder: async (orderData: any) => {
    const response = await apiClient.post('/medicines/orders', orderData);
    return response.data;
  },

  getOrders: async (params?: any) => {
    const response = await apiClient.get('/medicines/orders', { params });
    return response.data;
  },

  updateOrderStatus: async (orderId: string, statusData: any) => {
    const response = await apiClient.put(`/medicines/orders/${orderId}/status`, statusData);
    return response.data;
  },

  uploadInvoice: async (orderId: string, file: File) => {
    const formData = new FormData();
    formData.append('invoice', file);
    
    const response = await apiClient.post(`/medicines/orders/${orderId}/invoice`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Supplier management
  getSuppliers: async () => {
    const response = await apiClient.get('/medicines/suppliers');
    return response.data;
  },

  createSupplier: async (supplierData: any) => {
    const response = await apiClient.post('/medicines/suppliers', supplierData);
    return response.data;
  },
};

export default medicineService;
