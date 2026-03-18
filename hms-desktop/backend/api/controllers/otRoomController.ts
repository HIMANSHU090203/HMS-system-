import { Response } from 'express';
import { PrismaClient, OTStatus } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { getRequiredHospitalId } from '../utils/hospitalHelper';
import { logAudit } from '../utils/auditLogger';

const prisma = new PrismaClient();

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.string().min(1, 'Type is required').max(100),
  location: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  status: z.nativeEnum(OTStatus).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

const searchSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(OTStatus).optional(),
  isActive: z.string().transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)).optional(),
  page: z.string().transform((v) => parseInt(v, 10) || 1).optional(),
  limit: z.string().transform((v) => parseInt(v, 10) || 20).optional(),
});

export const createOTRoom = async (req: AuthRequest, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
    const hospitalId = await getRequiredHospitalId();

    const existing = await prisma.operationTheatre.findFirst({
      where: { hospitalId, name: data.name },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'OT room with this name already exists' });
    }

    const room = await prisma.operationTheatre.create({
      data: {
        name: data.name,
        hospitalId,
        type: data.type,
        location: data.location,
        description: data.description,
        status: 'AVAILABLE',
        isActive: true,
      },
    });

    await logAudit({
      userId: req.user!.id,
      action: 'CREATE_OT_ROOM',
      tableName: 'operation_theatres',
      recordId: room.id,
      newValue: { name: room.name, type: room.type },
    });

    return res.status(201).json({ success: true, message: 'OT room created', data: { room } });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: e.issues });
    }
    console.error('createOTRoom error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getOTRooms = async (req: AuthRequest, res: Response) => {
  try {
    const { search, status, isActive, page = 1, limit = 20 } = searchSchema.parse(req.query);
    const hospitalId = await getRequiredHospitalId();
    const skip = (page - 1) * limit;

    const where: any = { hospitalId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (isActive !== undefined) where.isActive = isActive;

    const [rooms, total] = await Promise.all([
      prisma.operationTheatre.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { surgeries: true } },
        },
      }),
      prisma.operationTheatre.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return res.json({
      success: true,
      data: {
        rooms,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: e.issues });
    }
    console.error('getOTRooms error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getOTRoomById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const room = await prisma.operationTheatre.findFirst({
      where: { id },
      include: {
        surgeries: {
          where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
          include: {
            patient: { select: { id: true, name: true, phone: true } },
            surgeon: { select: { id: true, fullName: true } },
          },
        },
      },
    });
    if (!room) {
      return res.status(404).json({ success: false, message: 'OT room not found' });
    }
    return res.json({ success: true, data: { room } });
  } catch (e) {
    console.error('getOTRoomById error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateOTRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateSchema.parse(req.body);
    const existing = await prisma.operationTheatre.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'OT room not found' });
    }
    const room = await prisma.operationTheatre.update({
      where: { id },
      data,
    });
    await logAudit({
      userId: req.user!.id,
      action: 'UPDATE_OT_ROOM',
      tableName: 'operation_theatres',
      recordId: id,
      oldValue: { name: existing.name, status: existing.status },
      newValue: { name: room.name, status: room.status },
    });
    return res.json({ success: true, message: 'OT room updated', data: { room } });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: e.issues });
    }
    console.error('updateOTRoom error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteOTRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.operationTheatre.findUnique({
      where: { id },
      include: { _count: { select: { surgeries: true } } },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'OT room not found' });
    }
    if (existing._count.surgeries > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete OT room with linked surgeries',
      });
    }
    await prisma.operationTheatre.delete({ where: { id } });
    await logAudit({
      userId: req.user!.id,
      action: 'DELETE_OT_ROOM',
      tableName: 'operation_theatres',
      recordId: id,
      oldValue: { name: existing.name },
    });
    return res.json({ success: true, message: 'OT room deleted' });
  } catch (e) {
    console.error('deleteOTRoom error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getOTRoomStats = async (req: AuthRequest, res: Response) => {
  try {
    const hospitalId = await getRequiredHospitalId();
    const [total, available, occupied, surgeriesToday] = await Promise.all([
      prisma.operationTheatre.count({ where: { hospitalId, isActive: true } }),
      prisma.operationTheatre.count({ where: { hospitalId, status: 'AVAILABLE', isActive: true } }),
      prisma.operationTheatre.count({ where: { hospitalId, status: 'OCCUPIED' } }),
      prisma.surgery.count({
        where: {
          operationTheatre: { hospitalId },
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          scheduledAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);
    return res.json({
      success: true,
      data: { totalRooms: total, available, occupied, surgeriesToday },
    });
  } catch (e) {
    console.error('getOTRoomStats error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
