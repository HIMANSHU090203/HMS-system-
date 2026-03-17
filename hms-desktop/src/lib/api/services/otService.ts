import apiClient from '../config';
import type { Surgery, OperationTheatre, ProcedureCatalog, PreOperativeChecklist, PostOperativeRecord, OTInventoryUsage } from '../../../types';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// OT Rooms
export async function getOTRoomStats() {
  const res = await apiClient.get<ApiResponse<{ totalRooms: number; available: number; occupied: number; surgeriesToday: number }>>('/ot-rooms/stats');
  return res.data;
}

export async function getOTRooms(params?: { search?: string; status?: string; isActive?: boolean; page?: number; limit?: number }) {
  const res = await apiClient.get<ApiResponse<{ rooms: OperationTheatre[]; pagination: any }>>('/ot-rooms', { params });
  return res.data;
}

export async function getOTRoomById(id: string) {
  const res = await apiClient.get<ApiResponse<{ room: OperationTheatre }>>(`/ot-rooms/${id}`);
  return res.data;
}

export async function createOTRoom(data: { name: string; type: string; location?: string; description?: string }) {
  const res = await apiClient.post<ApiResponse<{ room: OperationTheatre }>>('/ot-rooms', data);
  return res.data;
}

export async function updateOTRoom(id: string, data: Partial<OperationTheatre>) {
  const res = await apiClient.put<ApiResponse<{ room: OperationTheatre }>>(`/ot-rooms/${id}`, data);
  return res.data;
}

export async function deleteOTRoom(id: string) {
  const res = await apiClient.delete<ApiResponse>(`/ot-rooms/${id}`);
  return res.data;
}

// Surgeries
export async function getSurgeryStats() {
  const res = await apiClient.get<ApiResponse<{ scheduledToday: number; inProgress: number; completedToday: number; totalScheduled: number }>>('/surgeries/stats');
  return res.data;
}

export async function getSurgeries(params?: {
  patientId?: string;
  admissionId?: string;
  surgeonId?: string;
  operationTheatreId?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  const res = await apiClient.get<ApiResponse<{ surgeries: Surgery[]; pagination: any }>>('/surgeries', { params });
  return res.data;
}

export async function getSurgeryById(id: string) {
  const res = await apiClient.get<ApiResponse<{ surgery: Surgery }>>(`/surgeries/${id}`);
  return res.data;
}

export async function createSurgery(data: {
  patientId: string;
  admissionId?: string | null;
  operationTheatreId?: string | null;
  procedureCatalogId?: string | null;
  procedureName: string;
  surgeonId: string;
  scheduledAt: string;
  priority?: string;
  notes?: string;
  anesthesiaType?: string;
}) {
  const res = await apiClient.post<ApiResponse<{ surgery: Surgery }>>('/surgeries', data);
  return res.data;
}

export async function updateSurgery(id: string, data: Partial<Surgery>) {
  const res = await apiClient.put<ApiResponse<{ surgery: Surgery }>>(`/surgeries/${id}`, data);
  return res.data;
}

export async function deleteSurgery(id: string) {
  const res = await apiClient.delete<ApiResponse>(`/surgeries/${id}`);
  return res.data;
}

// Surgery team
export async function getSurgeryTeam(surgeryId: string) {
  const res = await apiClient.get<ApiResponse<{ team: any[] }>>(`/surgeries/${surgeryId}/team`);
  return res.data;
}

export async function addSurgeryTeamMember(surgeryId: string, data: { userId: string; role: string; isLead?: boolean }) {
  const res = await apiClient.post<ApiResponse<{ member: any }>>(`/surgeries/${surgeryId}/team`, data);
  return res.data;
}

export async function removeSurgeryTeamMember(surgeryId: string, userId: string) {
  const res = await apiClient.delete<ApiResponse>(`/surgeries/${surgeryId}/team/${userId}`);
  return res.data;
}

// Pre-op checklist
export async function getPreOpChecklist(surgeryId: string) {
  const res = await apiClient.get<ApiResponse<{ checklist: PreOperativeChecklist | null }>>(`/surgeries/${surgeryId}/pre-op-checklist`);
  return res.data;
}

export async function upsertPreOpChecklist(surgeryId: string, data: Partial<PreOperativeChecklist>) {
  const res = await apiClient.put<ApiResponse<{ checklist: PreOperativeChecklist }>>(`/surgeries/${surgeryId}/pre-op-checklist`, data);
  return res.data;
}

// Post-op record
export async function getPostOpRecord(surgeryId: string) {
  const res = await apiClient.get<ApiResponse<{ record: PostOperativeRecord | null }>>(`/surgeries/${surgeryId}/post-op-record`);
  return res.data;
}

export async function upsertPostOpRecord(surgeryId: string, data: Partial<PostOperativeRecord>) {
  const res = await apiClient.put<ApiResponse<{ record: PostOperativeRecord }>>(`/surgeries/${surgeryId}/post-op-record`, data);
  return res.data;
}

// Inventory usage
export async function getSurgeryInventoryUsage(surgeryId: string) {
  const res = await apiClient.get<ApiResponse<{ usage: OTInventoryUsage[] }>>(`/surgeries/${surgeryId}/inventory-usage`);
  return res.data;
}

export async function addSurgeryInventoryUsage(surgeryId: string, data: { itemName: string; quantity?: number; unit?: string; notes?: string }) {
  const res = await apiClient.post<ApiResponse<{ usage: OTInventoryUsage }>>(`/surgeries/${surgeryId}/inventory-usage`, data);
  return res.data;
}

// Procedure catalog
export async function getProcedures(params?: { search?: string; category?: string; page?: number; limit?: number }) {
  const res = await apiClient.get<ApiResponse<{ procedures: ProcedureCatalog[]; pagination: any }>>('/procedure-catalog', { params });
  return res.data;
}

export async function getProcedureById(id: string) {
  const res = await apiClient.get<ApiResponse<{ procedure: ProcedureCatalog }>>(`/procedure-catalog/${id}`);
  return res.data;
}

export async function createProcedure(data: { code: string; name: string; category: string; defaultDuration?: number }) {
  const res = await apiClient.post<ApiResponse<{ procedure: ProcedureCatalog }>>('/procedure-catalog', data);
  return res.data;
}

export async function updateProcedure(id: string, data: Partial<ProcedureCatalog>) {
  const res = await apiClient.put<ApiResponse<{ procedure: ProcedureCatalog }>>(`/procedure-catalog/${id}`, data);
  return res.data;
}

export async function deleteProcedure(id: string) {
  const res = await apiClient.delete<ApiResponse>(`/procedure-catalog/${id}`);
  return res.data;
}

const otService = {
  getOTRoomStats,
  getOTRooms,
  getOTRoomById,
  createOTRoom,
  updateOTRoom,
  deleteOTRoom,
  getSurgeryStats,
  getSurgeries,
  getSurgeryById,
  createSurgery,
  updateSurgery,
  deleteSurgery,
  getSurgeryTeam,
  addSurgeryTeamMember,
  removeSurgeryTeamMember,
  getPreOpChecklist,
  upsertPreOpChecklist,
  getPostOpRecord,
  upsertPostOpRecord,
  getSurgeryInventoryUsage,
  addSurgeryInventoryUsage,
  getProcedures,
  getProcedureById,
  createProcedure,
  updateProcedure,
  deleteProcedure,
};

export default otService;
