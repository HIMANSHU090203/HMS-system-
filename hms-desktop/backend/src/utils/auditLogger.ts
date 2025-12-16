import { PrismaClient } from '@prisma/client';
import { getHospitalId } from './hospitalHelper';

const prisma = new PrismaClient();

export interface AuditLogData {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: any;
  oldValue?: any;
}

/**
 * Create an audit log entry
 * Automatically includes hospitalId from hospital configuration
 */
export const createAuditLog = async (data: AuditLogData) => {
  try {
    const hospitalId = await getHospitalId();
    if (!hospitalId) {
      console.warn('Cannot create audit log: Hospital ID not found');
      return;
    }

    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        hospitalId: hospitalId,
        action: data.action,
        tableName: data.entityType,
        recordId: data.entityId,
        oldValue: data.oldValue,
        newValue: data.details,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid breaking the main operation
  }
};

/**
 * Helper function to create audit log with all required fields
 * Use this instead of direct prisma.auditLog.create() calls
 */
export const logAudit = async (params: {
  userId: string;
  action: string;
  tableName: string;
  recordId: string;
  oldValue?: any;
  newValue?: any;
}) => {
  try {
    const hospitalId = await getHospitalId();
    if (!hospitalId) {
      console.warn('Cannot create audit log: Hospital ID not found');
      return;
    }

    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        hospitalId: hospitalId,
        action: params.action,
        tableName: params.tableName,
        recordId: params.recordId,
        oldValue: params.oldValue ? JSON.parse(JSON.stringify(params.oldValue)) : null,
        newValue: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : null,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid breaking the main operation
  }
};
