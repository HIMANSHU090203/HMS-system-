import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const dailyRoundCreateSchema = z.object({
  admissionId: z.string().min(1, 'Admission ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  roundDate: z.string().transform(str => new Date(str)),
  diagnosis: z.string().min(1, 'Diagnosis is required').max(500),
  treatment: z.string().min(1, 'Treatment is required').max(1000),
  notes: z.string().max(2000).optional(),
  nextRoundDate: z.string().transform(str => new Date(str)).optional(),
  isCompleted: z.boolean().optional(),
});

const dailyRoundUpdateSchema = z.object({
  diagnosis: z.string().min(1).max(500).optional(),
  treatment: z.string().min(1).max(1000).optional(),
  notes: z.string().max(2000).optional(),
  nextRoundDate: z.string().transform(str => new Date(str)).optional(),
  isCompleted: z.boolean().optional(),
});

const dailyRoundSearchSchema = z.object({
  admissionId: z.string().optional(),
  doctorId: z.string().optional(),
  isCompleted: z.string().transform(val => val === 'true').optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional(),
});

// Create new daily round
export const createDailyRound = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = dailyRoundCreateSchema.parse(req.body);

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
        message: 'Can only add rounds for admitted patients',
      });
    }

    // Check if doctor exists
    const doctor = await prisma.user.findUnique({
      where: { id: validatedData.doctorId },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const dailyRound = await prisma.dailyRound.create({
      data: {
        admissionId: validatedData.admissionId,
        doctorId: validatedData.doctorId,
        roundDate: validatedData.roundDate,
        diagnosis: validatedData.diagnosis,
        treatment: validatedData.treatment,
        notes: validatedData.notes,
        nextRoundDate: validatedData.nextRoundDate,
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
        doctor: {
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
        action: 'CREATE_DAILY_ROUND',
        tableName: 'daily_rounds',
        recordId: dailyRound.id,
        newValue: {
          admissionId: dailyRound.admissionId,
          doctorId: dailyRound.doctorId,
          roundDate: dailyRound.roundDate,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Daily round created successfully',
      data: { dailyRound },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }

    console.error('Create daily round error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all daily rounds
export const getDailyRounds = async (req: AuthRequest, res: Response) => {
  try {
    const { admissionId, doctorId, isCompleted, page = 1, limit = 20 } = dailyRoundSearchSchema.parse(req.query);

    const skip = (page - 1) * limit;
    const where: any = {};

    if (admissionId) where.admissionId = admissionId;
    if (doctorId) where.doctorId = doctorId;
    if (isCompleted !== undefined) where.isCompleted = isCompleted;

    const [dailyRounds, total] = await Promise.all([
      prisma.dailyRound.findMany({
        where,
        skip,
        take: limit,
        orderBy: { roundDate: 'desc' },
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
          doctor: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
        },
      }),
      prisma.dailyRound.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailyRounds,
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

    console.error('Get daily rounds error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get daily round by ID
export const getDailyRoundById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const dailyRound = await prisma.dailyRound.findUnique({
      where: { id },
      include: {
        admission: {
          include: {
            patient: true,
            ward: true,
            bed: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    if (!dailyRound) {
      return res.status(404).json({
        success: false,
        message: 'Daily round not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { dailyRound },
    });
  } catch (error) {
    console.error('Get daily round by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update daily round
export const updateDailyRound = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = dailyRoundUpdateSchema.parse(req.body);

    const existingRound = await prisma.dailyRound.findUnique({
      where: { id },
    });

    if (!existingRound) {
      return res.status(404).json({
        success: false,
        message: 'Daily round not found',
      });
    }

    const dailyRound = await prisma.dailyRound.update({
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
        doctor: {
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
        action: 'UPDATE_DAILY_ROUND',
        tableName: 'daily_rounds',
        recordId: dailyRound.id,
        oldValue: existingRound,
        newValue: dailyRound,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Daily round updated successfully',
      data: { dailyRound },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }

    console.error('Update daily round error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Delete daily round
export const deleteDailyRound = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const dailyRound = await prisma.dailyRound.findUnique({
      where: { id },
    });

    if (!dailyRound) {
      return res.status(404).json({
        success: false,
        message: 'Daily round not found',
      });
    }

    await prisma.dailyRound.delete({
      where: { id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE_DAILY_ROUND',
        tableName: 'daily_rounds',
        recordId: id,
        oldValue: dailyRound,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Daily round deleted successfully',
    });
  } catch (error) {
    console.error('Delete daily round error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get daily rounds for a specific admission
export const getAdmissionDailyRounds = async (req: AuthRequest, res: Response) => {
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

    const dailyRounds = await prisma.dailyRound.findMany({
      where: { admissionId },
      orderBy: { roundDate: 'desc' },
      include: {
        doctor: {
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
      data: { dailyRounds },
    });
  } catch (error) {
    console.error('Get admission daily rounds error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

