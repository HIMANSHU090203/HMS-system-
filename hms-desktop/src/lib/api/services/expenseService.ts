import apiClient from '../config';
import { ApiResponse, Expense, ExpenseCategory, PaginatedResponse, PaymentStatus } from '../types';

export interface ExpenseSearchParams {
  from?: string;
  to?: string;
  category?: ExpenseCategory;
  paymentStatus?: PaymentStatus;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface CreateExpenseRequest {
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate?: string;
  paymentStatus?: PaymentStatus;
  paidAt?: string | null;
  userId?: string | null;
}

export interface UpdateExpenseRequest extends Partial<CreateExpenseRequest> {}

export interface UpsertMonthlySalariesRequest {
  month: string; // YYYY-MM
  items: Array<{ userId: string; amount: number; paymentStatus?: PaymentStatus }>;
}

const expenseService = {
  async getExpenses(params: ExpenseSearchParams = {}): Promise<PaginatedResponse<Expense>> {
    const res = await apiClient.get<ApiResponse<{ expenses: Expense[]; pagination: any }>>('/expenses', { params });
    // Backend returns { expenses, pagination }
    return { data: res.data.data.expenses, pagination: res.data.data.pagination };
  },

  async createExpense(payload: CreateExpenseRequest): Promise<Expense> {
    const res = await apiClient.post<ApiResponse<{ expense: Expense }>>('/expenses', payload);
    return res.data.data.expense;
  },

  async updateExpense(id: string, payload: UpdateExpenseRequest): Promise<Expense> {
    const res = await apiClient.put<ApiResponse<{ expense: Expense }>>(`/expenses/${id}`, payload);
    return res.data.data.expense;
  },

  async deleteExpense(id: string): Promise<void> {
    await apiClient.delete<ApiResponse>(`/expenses/${id}`);
  },

  async upsertMonthlySalaries(payload: UpsertMonthlySalariesRequest): Promise<Expense[]> {
    const res = await apiClient.put<ApiResponse<{ expenses: Expense[] }>>('/expenses/salaries/monthly', payload);
    return res.data.data.expenses;
  },
};

export default expenseService;

