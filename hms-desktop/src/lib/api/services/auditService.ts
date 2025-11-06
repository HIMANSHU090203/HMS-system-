import apiClient from '../config';

class AuditService {
  // Get prescription audit logs
  async getPrescriptionAuditLogs(prescriptionId: string): Promise<{
    logs: Array<{
      id: string;
      action: string;
      performedBy: string;
      performedAt: string;
      changes?: any;
      notes?: string;
      user?: {
        fullName: string;
        role: string;
      };
    }>;
  }> {
    try {
      const response = await apiClient.get(`/audit/prescriptions/${prescriptionId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting prescription audit logs:', error);
      return { logs: [] };
    }
  }

  // Get all audit logs with filtering
  async getAllAuditLogs(params?: {
    entityType?: string;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    logs: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    try {
      const response = await apiClient.get('/audit', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return { logs: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20, hasNextPage: false, hasPrevPage: false } };
    }
  }

  // Get audit statistics
  async getAuditStats(): Promise<{
    totalLogs: number;
    logsByAction: Record<string, number>;
    logsByUser: Array<{ userId: string; userName: string; count: number }>;
    recentActivity: number;
  }> {
    try {
      const response = await apiClient.get('/audit/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error getting audit stats:', error);
      return {
        totalLogs: 0,
        logsByAction: {},
        logsByUser: [],
        recentActivity: 0
      };
    }
  }
}

export default new AuditService();
