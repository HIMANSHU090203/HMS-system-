import apiClient from '../config';
import { ApiResponse, ProfitLossReport } from '../types';

export interface ProfitLossParams {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

const financeService = {
  async getProfitLoss(params: ProfitLossParams = {}): Promise<ProfitLossReport> {
    const res = await apiClient.get<ApiResponse<ProfitLossReport>>('/finance/pl', { params });
    return res.data.data;
  },
};

export default financeService;

