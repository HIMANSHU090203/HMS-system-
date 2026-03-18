import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLogger';

const prisma = new PrismaClient();

const createSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50),
  name: z.string().min(1, 'Name is required').max(200),
  category: z.string().min(1, 'Category is required').max(100),
  defaultDuration: z.number().int().min(0).optional().nullable(),
});

const updateSchema = z.object({
  code: z.string().max(50).optional(),
  name: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  defaultDuration: z.number().int().min(0).nullable().optional(),
  isActive: z.boolean().optional(),
});

const listSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  isActive: z.string().transform((v) => v === 'true').optional(),
  page: z.string().transform((v) => parseInt(v, 10) || 1).optional(),
  limit: z.string().transform((v) => parseInt(v, 10) || 50).optional(),
});

export const createProcedure = async (req: AuthRequest, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
    const existing = await prisma.procedureCatalog.findUnique({ where: { code: data.code } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Procedure code already exists' });
    }
    const procedure = await prisma.procedureCatalog.create({
      data: {
        code: data.code,
        name: data.name,
        category: data.category,
        defaultDuration: data.defaultDuration ?? undefined,
      },
    });
    await logAudit({
      userId: req.user!.id,
      action: 'CREATE_PROCEDURE_CATALOG',
      tableName: 'procedure_catalog',
      recordId: procedure.id,
      newValue: { code: procedure.code, name: procedure.name },
    });
    return res.status(201).json({ success: true, message: 'Procedure added', data: { procedure } });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: e.issues });
    }
    console.error('createProcedure error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getProcedures = async (req: AuthRequest, res: Response) => {
  try {
    const { search, category, isActive, page = 1, limit = 50 } = listSchema.parse(req.query);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;

    const [procedures, total] = await Promise.all([
      prisma.procedureCatalog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.procedureCatalog.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return res.json({
      success: true,
      data: {
        procedures,
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
    console.error('getProcedures error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getProcedureById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const procedure = await prisma.procedureCatalog.findUnique({ where: { id } });
    if (!procedure) {
      return res.status(404).json({ success: false, message: 'Procedure not found' });
    }
    return res.json({ success: true, data: { procedure } });
  } catch (e) {
    console.error('getProcedureById error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateProcedure = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateSchema.parse(req.body);
    const existing = await prisma.procedureCatalog.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Procedure not found' });
    }
    const procedure = await prisma.procedureCatalog.update({
      where: { id },
      data,
    });
    await logAudit({
      userId: req.user!.id,
      action: 'UPDATE_PROCEDURE_CATALOG',
      tableName: 'procedure_catalog',
      recordId: id,
      oldValue: { code: existing.code },
      newValue: { code: procedure.code },
    });
    return res.json({ success: true, message: 'Procedure updated', data: { procedure } });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: e.issues });
    }
    console.error('updateProcedure error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteProcedure = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.procedureCatalog.findUnique({
      where: { id },
      include: { _count: { select: { surgeries: true } } },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Procedure not found' });
    }
    if (existing._count.surgeries > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete procedure with linked surgeries',
      });
    }
    await prisma.procedureCatalog.delete({ where: { id } });
    await logAudit({
      userId: req.user!.id,
      action: 'DELETE_PROCEDURE_CATALOG',
      tableName: 'procedure_catalog',
      recordId: id,
      oldValue: { code: existing.code },
    });
    return res.json({ success: true, message: 'Procedure deleted' });
  } catch (e) {
    console.error('deleteProcedure error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
