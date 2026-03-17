import { Response } from 'express';
import { PrismaClient, SurgeryStatus, SurgeryPriority } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { getHospitalId } from '../utils/hospitalHelper';
import { logAudit } from '../utils/auditLogger';

const prisma = new PrismaClient();

const createSurgerySchema = z.object({
  patientId: z.string().min(1),
  admissionId: z.string().optional().nullable(),
  operationTheatreId: z.string().optional().nullable(),
  procedureCatalogId: z.string().optional().nullable(),
  procedureName: z.string().min(1, 'Procedure name is required'),
  surgeonId: z.string().min(1, 'Surgeon is required'),
  scheduledAt: z.string().datetime().or(z.coerce.date()),
  priority: z.nativeEnum(SurgeryPriority).optional().default('ELECTIVE'),
  notes: z.string().optional(),
  anesthesiaType: z.string().optional(),
});

const updateSurgerySchema = z.object({
  operationTheatreId: z.string().nullable().optional(),
  procedureCatalogId: z.string().nullable().optional(),
  procedureName: z.string().optional(),
  surgeonId: z.string().optional(),
  scheduledAt: z.string().datetime().or(z.coerce.date()).optional(),
  startTime: z.string().datetime().or(z.coerce.date()).nullable().optional(),
  endTime: z.string().datetime().or(z.coerce.date()).nullable().optional(),
  status: z.nativeEnum(SurgeryStatus).optional(),
  priority: z.nativeEnum(SurgeryPriority).optional(),
  notes: z.string().optional(),
  anesthesiaType: z.string().optional(),
  complications: z.string().optional(),
  surgicalNotes: z.string().optional(),
  implantsUsed: z.string().optional(),
});

const listSchema = z.object({
  patientId: z.string().optional(),
  admissionId: z.string().optional(),
  surgeonId: z.string().optional(),
  operationTheatreId: z.string().optional(),
  status: z.nativeEnum(SurgeryStatus).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.string().transform((v) => parseInt(v, 10) || 1).optional(),
  limit: z.string().transform((v) => parseInt(v, 10) || 20).optional(),
});

export const createSurgery = async (req: AuthRequest, res: Response) => {
  try {
    const data = createSurgerySchema.parse(req.body);
    const scheduledAt = typeof data.scheduledAt === 'string' ? new Date(data.scheduledAt) : data.scheduledAt;

    const surgery = await prisma.surgery.create({
      data: {
        patientId: data.patientId,
        admissionId: data.admissionId ?? undefined,
        operationTheatreId: data.operationTheatreId ?? undefined,
        procedureCatalogId: data.procedureCatalogId ?? undefined,
        procedureName: data.procedureName,
        surgeonId: data.surgeonId,
        scheduledAt,
        priority: data.priority,
        notes: data.notes,
        anesthesiaType: data.anesthesiaType,
        status: 'SCHEDULED',
      },
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        surgeon: { select: { id: true, fullName: true } },
        operationTheatre: { select: { id: true, name: true } },
        admission: { select: { id: true, admissionReason: true } },
      },
    });

    const hospitalId = await getHospitalId();
    if (hospitalId) {
      await logAudit({
        userId: req.user!.id,
        action: 'CREATE_SURGERY',
        tableName: 'surgeries',
        recordId: surgery.id,
        newValue: { procedureName: surgery.procedureName, patientId: surgery.patientId },
      });
    }

    return res.status(201).json({ success: true, message: 'Surgery scheduled', data: { surgery } });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: e.issues });
    }
    console.error('createSurgery error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getSurgeries = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, admissionId, surgeonId, operationTheatreId, status, from, to, page = 1, limit = 20 } = listSchema.parse(req.query);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (admissionId) where.admissionId = admissionId;
    if (surgeonId) where.surgeonId = surgeonId;
    if (operationTheatreId) where.operationTheatreId = operationTheatreId;
    if (status) where.status = status;
    if (from || to) {
      where.scheduledAt = {};
      if (from) where.scheduledAt.gte = new Date(from);
      if (to) where.scheduledAt.lte = new Date(to);
    }

    const [surgeries, total] = await Promise.all([
      prisma.surgery.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'asc' },
        include: {
          patient: { select: { id: true, name: true, phone: true } },
          surgeon: { select: { id: true, fullName: true } },
          operationTheatre: { select: { id: true, name: true, status: true } },
          admission: { select: { id: true, admissionReason: true, status: true } },
        },
      }),
      prisma.surgery.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return res.json({
      success: true,
      data: {
        surgeries,
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
    console.error('getSurgeries error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getSurgeryById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const surgery = await prisma.surgery.findUnique({
      where: { id },
      include: {
        patient: true,
        surgeon: { select: { id: true, fullName: true, username: true } },
        operationTheatre: true,
        procedureCatalog: true,
        admission: { include: { ward: true, bed: true } },
        teamMembers: { include: { user: { select: { id: true, fullName: true } } } },
        preOpChecklist: true,
        postOpRecord: true,
        inventoryUsage: true,
      },
    });
    if (!surgery) {
      return res.status(404).json({ success: false, message: 'Surgery not found' });
    }
    return res.json({ success: true, data: { surgery } });
  } catch (e) {
    console.error('getSurgeryById error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateSurgery = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateSurgerySchema.parse(req.body);
    const existing = await prisma.surgery.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Surgery not found' });
    }

    const payload: any = { ...data };
    if (data.scheduledAt !== undefined) payload.scheduledAt = typeof data.scheduledAt === 'string' ? new Date(data.scheduledAt) : data.scheduledAt;
    if (data.startTime !== undefined) payload.startTime = data.startTime == null ? null : (typeof data.startTime === 'string' ? new Date(data.startTime) : data.startTime);
    if (data.endTime !== undefined) payload.endTime = data.endTime == null ? null : (typeof data.endTime === 'string' ? new Date(data.endTime) : data.endTime);

    const surgery = await prisma.surgery.update({
      where: { id },
      data: payload,
      include: {
        patient: { select: { id: true, name: true } },
        surgeon: { select: { id: true, fullName: true } },
        operationTheatre: { select: { id: true, name: true } },
      },
    });

    await logAudit({
      userId: req.user!.id,
      action: 'UPDATE_SURGERY',
      tableName: 'surgeries',
      recordId: id,
      oldValue: { status: existing.status },
      newValue: { status: surgery.status },
    });

    return res.json({ success: true, message: 'Surgery updated', data: { surgery } });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: e.issues });
    }
    console.error('updateSurgery error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteSurgery = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.surgery.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Surgery not found' });
    }
    if (existing.status === 'IN_PROGRESS') {
      return res.status(400).json({ success: false, message: 'Cannot delete surgery in progress' });
    }
    await prisma.surgery.delete({ where: { id } });
    await logAudit({
      userId: req.user!.id,
      action: 'DELETE_SURGERY',
      tableName: 'surgeries',
      recordId: id,
      oldValue: { procedureName: existing.procedureName },
    });
    return res.json({ success: true, message: 'Surgery cancelled/deleted' });
  } catch (e) {
    console.error('deleteSurgery error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Surgery team
const surgeryTeamSchema = z.object({
  userId: z.string(),
  role: z.enum(['SURGEON', 'ASSISTANT_SURGEON', 'ANESTHESIOLOGIST', 'SCRUB_NURSE', 'CIRCULATING_NURSE', 'TECHNICIAN']),
  isLead: z.boolean().optional(),
});

export const getSurgeryTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const team = await prisma.surgeryTeam.findMany({
      where: { surgeryId: id },
      include: { user: { select: { id: true, fullName: true, username: true } } },
    });
    return res.json({ success: true, data: { team } });
  } catch (e) {
    console.error('getSurgeryTeam error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const addSurgeryTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = surgeryTeamSchema.parse(req.body);
    const member = await prisma.surgeryTeam.create({
      data: {
        surgeryId: id,
        userId: data.userId,
        role: data.role as any,
        isLead: data.isLead ?? false,
      },
      include: { user: { select: { id: true, fullName: true } } },
    });
    return res.status(201).json({ success: true, message: 'Team member added', data: { member } });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: e.issues });
    }
    console.error('addSurgeryTeamMember error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const removeSurgeryTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id, userId } = req.params;
    await prisma.surgeryTeam.deleteMany({
      where: { surgeryId: id, userId },
    });
    return res.json({ success: true, message: 'Team member removed' });
  } catch (e) {
    console.error('removeSurgeryTeamMember error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Pre-operative checklist
const preOpSchema = z.object({
  consentSigned: z.boolean().optional(),
  labTestsCompleted: z.boolean().optional(),
  anesthesiaClearance: z.boolean().optional(),
  bloodAvailable: z.boolean().optional(),
  fastingConfirmed: z.boolean().optional(),
  allergyReview: z.boolean().optional(),
  notes: z.string().optional(),
  completedAt: z.string().datetime().or(z.coerce.date()).nullable().optional(),
});

export const getPreOpChecklist = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const checklist = await prisma.preOperativeChecklist.findUnique({
      where: { surgeryId: id },
    });
    return res.json({ success: true, data: { checklist } });
  } catch (e) {
    console.error('getPreOpChecklist error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const upsertPreOpChecklist = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = preOpSchema.parse(req.body);
    const surgery = await prisma.surgery.findUnique({ where: { id } });
    if (!surgery) return res.status(404).json({ success: false, message: 'Surgery not found' });

    const completedAt = data.completedAt != null ? (typeof data.completedAt === 'string' ? new Date(data.completedAt) : data.completedAt) : undefined;
    const checklist = await prisma.preOperativeChecklist.upsert({
      where: { surgeryId: id },
      create: {
        surgeryId: id,
        consentSigned: data.consentSigned ?? false,
        labTestsCompleted: data.labTestsCompleted ?? false,
        anesthesiaClearance: data.anesthesiaClearance ?? false,
        bloodAvailable: data.bloodAvailable ?? false,
        fastingConfirmed: data.fastingConfirmed ?? false,
        allergyReview: data.allergyReview ?? false,
        notes: data.notes,
        completedAt,
      },
      update: {
        ...(data.consentSigned !== undefined && { consentSigned: data.consentSigned }),
        ...(data.labTestsCompleted !== undefined && { labTestsCompleted: data.labTestsCompleted }),
        ...(data.anesthesiaClearance !== undefined && { anesthesiaClearance: data.anesthesiaClearance }),
        ...(data.bloodAvailable !== undefined && { bloodAvailable: data.bloodAvailable }),
        ...(data.fastingConfirmed !== undefined && { fastingConfirmed: data.fastingConfirmed }),
        ...(data.allergyReview !== undefined && { allergyReview: data.allergyReview }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(completedAt !== undefined && { completedAt }),
      },
    });
    return res.json({ success: true, message: 'Pre-op checklist saved', data: { checklist } });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: e.issues });
    }
    console.error('upsertPreOpChecklist error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Post-operative record
const postOpSchema = z.object({
  recoveryNotes: z.string().optional(),
  complications: z.string().optional(),
  dischargeInstructions: z.string().optional(),
  painLevel: z.number().int().min(0).max(10).optional().nullable(),
});

export const getPostOpRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const record = await prisma.postOperativeRecord.findUnique({
      where: { surgeryId: id },
    });
    return res.json({ success: true, data: { record } });
  } catch (e) {
    console.error('getPostOpRecord error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const upsertPostOpRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = postOpSchema.parse(req.body);
    const surgery = await prisma.surgery.findUnique({ where: { id } });
    if (!surgery) return res.status(404).json({ success: false, message: 'Surgery not found' });

    const record = await prisma.postOperativeRecord.upsert({
      where: { surgeryId: id },
      create: { surgeryId: id, ...data },
      update: data,
    });
    return res.json({ success: true, message: 'Post-op record saved', data: { record } });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: e.issues });
    }
    console.error('upsertPostOpRecord error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// OT inventory usage
const inventoryUsageSchema = z.object({
  itemName: z.string().min(1),
  quantity: z.number().int().min(1).optional().default(1),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

export const getSurgeryInventoryUsage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const usage = await prisma.oTInventoryUsage.findMany({
      where: { surgeryId: id },
    });
    return res.json({ success: true, data: { usage } });
  } catch (e) {
    console.error('getSurgeryInventoryUsage error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const addSurgeryInventoryUsage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = inventoryUsageSchema.parse(req.body);
    const surgery = await prisma.surgery.findUnique({ where: { id } });
    if (!surgery) return res.status(404).json({ success: false, message: 'Surgery not found' });

    const usage = await prisma.oTInventoryUsage.create({
      data: { surgeryId: id, ...data },
    });
    return res.status(201).json({ success: true, message: 'Usage recorded', data: { usage } });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: e.issues });
    }
    console.error('addSurgeryInventoryUsage error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getSurgeryStats = async (req: AuthRequest, res: Response) => {
  try {
    const hospitalId = await getHospitalId();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const where = hospitalId ? { operationTheatre: { hospitalId } } : {};
    const [scheduledToday, inProgress, completedToday, totalScheduled] = await Promise.all([
      prisma.surgery.count({
        where: {
          ...where,
          status: 'SCHEDULED',
          scheduledAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.surgery.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.surgery.count({
        where: {
          ...where,
          status: 'COMPLETED',
          endTime: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.surgery.count({ where: { ...where, status: 'SCHEDULED' } }),
    ]);

    return res.json({
      success: true,
      data: { scheduledToday, inProgress, completedToday, totalScheduled },
    });
  } catch (e) {
    console.error('getSurgeryStats error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
