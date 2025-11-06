import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const dischargeSummaryCreateSchema = z.object({
  admissionId: z.string().min(1, 'Admission ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  diagnosis: z.string().min(1, 'Diagnosis is required').max(500),
  treatmentGiven: z.string().min(1, 'Treatment given is required').max(2000),
  proceduresPerformed: z.string().max(2000).optional(),
  medicationsPrescribed: z.string().max(2000).optional(),
  followUpInstructions: z.string().max(2000).optional(),
  nextAppointmentDate: z.string().transform(str => new Date(str)).optional().nullable(),
  notes: z.string().max(2000).optional(),
});

const dischargeSummaryUpdateSchema = z.object({
  diagnosis: z.string().min(1).max(500).optional(),
  treatmentGiven: z.string().min(1).max(2000).optional(),
  proceduresPerformed: z.string().max(2000).optional(),
  medicationsPrescribed: z.string().max(2000).optional(),
  followUpInstructions: z.string().max(2000).optional(),
  nextAppointmentDate: z.string().transform(str => new Date(str)).optional().nullable(),
  notes: z.string().max(2000).optional(),
});

// Create discharge summary
export const createDischargeSummary = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = dischargeSummaryCreateSchema.parse(req.body);

    // Check if admission exists and is discharged
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

    if (admission.status !== 'DISCHARGED') {
      return res.status(400).json({
        success: false,
        message: 'Can only create discharge summary for discharged patients',
      });
    }

    // Check if discharge summary already exists
    const existingSummary = await prisma.dischargeSummary.findUnique({
      where: { admissionId: validatedData.admissionId },
    });

    if (existingSummary) {
      return res.status(400).json({
        success: false,
        message: 'Discharge summary already exists for this admission',
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

    const dischargeSummary = await prisma.dischargeSummary.create({
      data: {
        admissionId: validatedData.admissionId,
        patientId: admission.patientId,
        doctorId: validatedData.doctorId,
        admissionDate: admission.admissionDate,
        dischargeDate: admission.dischargeDate || new Date(),
        diagnosis: validatedData.diagnosis,
        treatmentGiven: validatedData.treatmentGiven,
        proceduresPerformed: validatedData.proceduresPerformed,
        medicationsPrescribed: validatedData.medicationsPrescribed,
        followUpInstructions: validatedData.followUpInstructions,
        nextAppointmentDate: validatedData.nextAppointmentDate,
        notes: validatedData.notes,
      },
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

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE_DISCHARGE_SUMMARY',
        tableName: 'discharge_summaries',
        recordId: dischargeSummary.id,
        newValue: {
          admissionId: dischargeSummary.admissionId,
          doctorId: dischargeSummary.doctorId,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Discharge summary created successfully',
      data: { dischargeSummary },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }

    console.error('Create discharge summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get discharge summary by admission ID
export const getDischargeSummaryByAdmission = async (req: AuthRequest, res: Response) => {
  try {
    const { admissionId } = req.params;

    const dischargeSummary = await prisma.dischargeSummary.findUnique({
      where: { admissionId },
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

    if (!dischargeSummary) {
      return res.status(404).json({
        success: false,
        message: 'Discharge summary not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { dischargeSummary },
    });
  } catch (error) {
    console.error('Get discharge summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get discharge summary by ID
export const getDischargeSummaryById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const dischargeSummary = await prisma.dischargeSummary.findUnique({
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

    if (!dischargeSummary) {
      return res.status(404).json({
        success: false,
        message: 'Discharge summary not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { dischargeSummary },
    });
  } catch (error) {
    console.error('Get discharge summary by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update discharge summary
export const updateDischargeSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = dischargeSummaryUpdateSchema.parse(req.body);

    const existingSummary = await prisma.dischargeSummary.findUnique({
      where: { id },
    });

    if (!existingSummary) {
      return res.status(404).json({
        success: false,
        message: 'Discharge summary not found',
      });
    }

    const dischargeSummary = await prisma.dischargeSummary.update({
      where: { id },
      data: validatedData,
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

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE_DISCHARGE_SUMMARY',
        tableName: 'discharge_summaries',
        recordId: dischargeSummary.id,
        oldValue: existingSummary,
        newValue: dischargeSummary,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Discharge summary updated successfully',
      data: { dischargeSummary },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }

    console.error('Update discharge summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all discharge summaries
export const getDischargeSummaries = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, doctorId, page = 1, limit = 20 } = z.object({
      patientId: z.string().optional(),
      doctorId: z.string().optional(),
      page: z.string().transform(val => parseInt(val) || 1).optional(),
      limit: z.string().transform(val => parseInt(val) || 20).optional(),
    }).parse(req.query);

    const skip = (page - 1) * limit;
    const where: any = {};

    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;

    const [dischargeSummaries, total] = await Promise.all([
      prisma.dischargeSummary.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dischargeDate: 'desc' },
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
      prisma.dischargeSummary.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        dischargeSummaries,
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

    console.error('Get discharge summaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

