import { Response } from 'express';
import { PrismaClient, ShiftType } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const nursingShiftCreateSchema = z.object({
  admissionId: z.string().min(1, 'Admission ID is required'),
  nurseId: z.string().min(1, 'Nurse ID is required'),
  shiftType: z.nativeEnum(ShiftType, { message: 'Invalid shift type' }),
  shiftDate: z.string().transform(str => new Date(str)),
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str)).optional().nullable(),
  notes: z.string().max(2000).optional(),
  medications: z.any().optional(), // JSON array of medications
  isCompleted: z.boolean().optional(),
});

const nursingShiftUpdateSchema = z.object({
  shiftType: z.nativeEnum(ShiftType).optional(),
  shiftDate: z.string().transform(str => new Date(str)).optional(),
  startTime: z.string().transform(str => new Date(str)).optional(),
  endTime: z.string().transform(str => new Date(str)).optional().nullable(),
  notes: z.string().max(2000).optional(),
  medications: z.any().optional(),
  isCompleted: z.boolean().optional(),
});

const nursingShiftSearchSchema = z.object({
  admissionId: z.string().optional(),
  nurseId: z.string().optional(),
  shiftType: z.nativeEnum(ShiftType).optional(),
  isCompleted: z.string().transform(val => val === 'true').optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional(),
});

// Create new nursing shift
export const createNursingShift = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = nursingShiftCreateSchema.parse(req.body);

    // Check if admission exists
    const admission = await prisma.admission.findUnique({
      where: { id: validatedData.admissionId },
      include: { patient: true },
    });

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found',
      });
    }

    if (admission.status !== 'ADMITTED') {
      return res.status(400).json({
        success: false,
        message: 'Can only create shifts for admitted patients',
      });
    }

    // Check if nurse exists
    const nurse = await prisma.user.findUnique({
      where: { id: validatedData.nurseId },
    });

    if (!nurse) {
      return res.status(404).json({
        success: false,
        message: 'Nurse not found',
      });
    }

    const nursingShift = await prisma.nursingShift.create({
      data: {
        admissionId: validatedData.admissionId,
        nurseId: validatedData.nurseId,
        shiftType: validatedData.shiftType,
        shiftDate: validatedData.shiftDate,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        notes: validatedData.notes,
        medications: validatedData.medications,
        isCompleted: validatedData.isCompleted || false,
      },
      include: {
        admission: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                age: true,
                gender: true,
              },
            },
            ward: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            bed: {
              select: {
                id: true,
                bedNumber: true,
              },
            },
          },
        },
        nurse: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE_NURSING_SHIFT',
        tableName: 'nursing_shifts',
        recordId: nursingShift.id,
        newValue: {
          admissionId: nursingShift.admissionId,
          nurseId: nursingShift.nurseId,
          shiftType: nursingShift.shiftType,
          shiftDate: nursingShift.shiftDate,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Nursing shift created successfully',
      data: { nursingShift },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }

    console.error('Create nursing shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all nursing shifts
export const getNursingShifts = async (req: AuthRequest, res: Response) => {
  try {
    const { admissionId, nurseId, shiftType, isCompleted, page = 1, limit = 20 } = nursingShiftSearchSchema.parse(req.query);

    const skip = (page - 1) * limit;
    const where: any = {};

    if (admissionId) where.admissionId = admissionId;
    if (nurseId) where.nurseId = nurseId;
    if (shiftType) where.shiftType = shiftType;
    if (isCompleted !== undefined) where.isCompleted = isCompleted;

    const [nursingShifts, total] = await Promise.all([
      prisma.nursingShift.findMany({
        where,
        skip,
        take: limit,
        orderBy: { shiftDate: 'desc' },
        include: {
          admission: {
            include: {
              patient: {
                select: {
                  id: true,
                  name: true,
                  age: true,
                  gender: true,
                },
              },
              ward: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
              bed: {
                select: {
                  id: true,
                  bedNumber: true,
                },
              },
            },
          },
          nurse: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
        },
      }),
      prisma.nursingShift.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        nursingShifts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: skip + limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }

    console.error('Get nursing shifts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get nursing shift by ID
export const getNursingShiftById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const nursingShift = await prisma.nursingShift.findUnique({
      where: { id },
      include: {
        admission: {
          include: {
            patient: true,
            ward: true,
            bed: true,
          },
        },
        nurse: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    if (!nursingShift) {
      return res.status(404).json({
        success: false,
        message: 'Nursing shift not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { nursingShift },
    });
  } catch (error) {
    console.error('Get nursing shift by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update nursing shift
export const updateNursingShift = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = nursingShiftUpdateSchema.parse(req.body);

    const existingShift = await prisma.nursingShift.findUnique({
      where: { id },
    });

    if (!existingShift) {
      return res.status(404).json({
        success: false,
        message: 'Nursing shift not found',
      });
    }

    const nursingShift = await prisma.nursingShift.update({
      where: { id },
      data: validatedData,
      include: {
        admission: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                age: true,
                gender: true,
              },
            },
            ward: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            bed: {
              select: {
                id: true,
                bedNumber: true,
              },
            },
          },
        },
        nurse: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE_NURSING_SHIFT',
        tableName: 'nursing_shifts',
        recordId: nursingShift.id,
        oldValue: existingShift,
        newValue: nursingShift,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Nursing shift updated successfully',
      data: { nursingShift },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }

    console.error('Update nursing shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Delete nursing shift
export const deleteNursingShift = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const nursingShift = await prisma.nursingShift.findUnique({
      where: { id },
    });

    if (!nursingShift) {
      return res.status(404).json({
        success: false,
        message: 'Nursing shift not found',
      });
    }

    await prisma.nursingShift.delete({
      where: { id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE_NURSING_SHIFT',
        tableName: 'nursing_shifts',
        recordId: id,
        oldValue: nursingShift,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Nursing shift deleted successfully',
    });
  } catch (error) {
    console.error('Delete nursing shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get nursing shifts for a specific admission
export const getAdmissionNursingShifts = async (req: AuthRequest, res: Response) => {
  try {
    const { admissionId } = req.params;

    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
    });

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found',
      });
    }

    const nursingShifts = await prisma.nursingShift.findMany({
      where: { admissionId },
      orderBy: { shiftDate: 'desc' },
      include: {
        nurse: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: { nursingShifts },
    });
  } catch (error) {
    console.error('Get admission nursing shifts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

