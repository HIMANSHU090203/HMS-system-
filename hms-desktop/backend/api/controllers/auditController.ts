import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Get prescription audit logs
export const getPrescriptionAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { prescriptionId } = req.params;

    if (!prescriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Prescription ID is required',
      });
    }

    // Get audit logs for the prescription using PrescriptionAudit table
    const rawLogs = await prisma.prescriptionAudit.findMany({
      where: {
        prescriptionId: prescriptionId,
      },
      orderBy: {
        performedAt: 'desc',
      },
    });

    // Fetch user details for each log
    const userIds = rawLogs.map(log => log.performedBy);
    const uniqueUserIds = [...new Set(userIds)];
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: uniqueUserIds,
        },
      },
      select: {
        id: true,
        fullName: true,
        role: true,
        username: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    // Format logs with user details
    const logs = rawLogs.map(log => ({
      ...log,
      user: userMap.get(log.performedBy) || {
        id: log.performedBy,
        fullName: 'Unknown User',
        role: 'UNKNOWN',
        username: 'unknown',
      },
    }));

    res.json({
      success: true,
      data: { logs },
    });
  } catch (error: any) {
    console.error('Get prescription audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error?.message || 'Internal server error',
    });
  }
};

// Get all audit logs with filtering and pagination
export const getAllAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const {
      action,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (userId) {
      where.performedBy = userId;
    }

    if (startDate || endDate) {
      where.performedAt = {};
      if (startDate) {
        where.performedAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.performedAt.lte = new Date(endDate as string);
      }
    }

    // Get audit logs with pagination from PrescriptionAudit table
    const [rawLogs, total] = await Promise.all([
      prisma.prescriptionAudit.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: {
          performedAt: 'desc',
        },
      }),
      prisma.prescriptionAudit.count({ where }),
    ]);

    // Fetch user details for each log
    const userIds = rawLogs.map(log => log.performedBy);
    const uniqueUserIds = [...new Set(userIds)];
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: uniqueUserIds,
        },
      },
      select: {
        id: true,
        fullName: true,
        role: true,
        username: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    // Format logs with user details
    const logs = rawLogs.map(log => ({
      ...log,
      user: userMap.get(log.performedBy) || {
        id: log.performedBy,
        fullName: 'Unknown User',
        role: 'UNKNOWN',
        username: 'unknown',
      },
    }));

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: total,
          itemsPerPage: Number(limit),
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1,
        },
      },
    });
  } catch (error: any) {
    console.error('Get all audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error?.message || 'Internal server error',
    });
  }
};

// Get audit statistics
export const getAuditStats = async (req: AuthRequest, res: Response) => {
  try {
    // Get total logs count from PrescriptionAudit table
    const totalLogs = await prisma.prescriptionAudit.count();

    // Get logs by action
    const logsByActionRaw = await prisma.prescriptionAudit.groupBy({
      by: ['action'],
      _count: {
        action: true,
      },
    });

    const logsByAction: Record<string, number> = {};
    logsByActionRaw.forEach((item) => {
      logsByAction[item.action] = item._count.action;
    });

    // Get logs by user (top 10)
    const logsByUserRaw = await prisma.prescriptionAudit.groupBy({
      by: ['performedBy'],
      _count: {
        performedBy: true,
      },
      orderBy: {
        _count: {
          performedBy: 'desc',
        },
      },
      take: 10,
    });

    // Fetch user details for the top users
    const userIds = logsByUserRaw.map((item) => item.performedBy);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        fullName: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u.fullName]));

    const logsByUser = logsByUserRaw.map((item) => ({
      userId: item.performedBy,
      userName: userMap.get(item.performedBy) || 'Unknown User',
      count: item._count.performedBy,
    }));

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await prisma.prescriptionAudit.count({
      where: {
        performedAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    res.json({
      success: true,
      data: {
        totalLogs,
        logsByAction,
        logsByUser,
        recentActivity,
      },
    });
  } catch (error: any) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit statistics',
      error: error?.message || 'Internal server error',
    });
  }
};

