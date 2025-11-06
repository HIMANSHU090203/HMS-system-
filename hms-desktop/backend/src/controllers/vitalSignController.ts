import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const vitalSignCreateSchema = z.object({
  admissionId: z.string().min(1, 'Admission ID is required'),
  recordedBy: z.string().min(1, 'Recorded by is required'),
  temperature: z.number().min(30).max(45).optional().nullable(),
  bloodPressure: z.string().max(20).optional().nullable(),
  heartRate: z.number().int().min(0).max(300).optional().nullable(),
  respiratoryRate: z.number().int().min(0).max(100).optional().nullable(),
  oxygenSaturation: z.number().min(0).max(100).optional().nullable(),
  weight: z.number().min(0).max(500).optional().nullable(),
  height: z.number().min(0).max(300).optional().nullable(),
  notes: z.string().max(1000).optional(),
  recordedAt: z.string().transform(str => new Date(str)).optional(),
});

const vitalSignUpdateSchema = z.object({
  temperature: z.number().min(30).max(45).optional().nullable(),
  bloodPressure: z.string().max(20).optional().nullable(),
  heartRate: z.number().int().min(0).max(300).optional().nullable(),
  respiratoryRate: z.number().int().min(0).max(100).optional().nullable(),
  oxygenSaturation: z.number().min(0).max(100).optional().nullable(),
  weight: z.number().min(0).max(500).optional().nullable(),
  height: z.number().min(0).max(300).optional().nullable(),
  notes: z.string().max(1000).optional(),
  recordedAt: z.string().transform(str => new Date(str)).optional(),
});

const vitalSignSearchSchema = z.object({
  admissionId: z.string().optional(),
  recordedBy: z.string().optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional(),
});

// Create new vital sign record
export const createVitalSign = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = vitalSignCreateSchema.parse(req.body);

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
        message: 'Can only record vital signs for admitted patients',
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.recordedBy },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const vitalSign = await prisma.vitalSign.create({
      data: {
        admissionId: validatedData.admissionId,
        recordedBy: validatedData.recordedBy,
        temperature: validatedData.temperature,
        bloodPressure: validatedData.bloodPressure,
        heartRate: validatedData.heartRate,
        respiratoryRate: validatedData.respiratoryRate,
        oxygenSaturation: validatedData.oxygenSaturation,
        weight: validatedData.weight,
        height: validatedData.height,
        notes: validatedData.notes,
        recordedAt: validatedData.recordedAt || new Date(),
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
        recordedByUser: {
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
        action: 'CREATE_VITAL_SIGN',
        tableName: 'vital_signs',
        recordId: vitalSign.id,
        newValue: {
          admissionId: vitalSign.admissionId,
          recordedBy: vitalSign.recordedBy,
          recordedAt: vitalSign.recordedAt,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Vital sign recorded successfully',
      data: { vitalSign },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }

    console.error('Create vital sign error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all vital signs
export const getVitalSigns = async (req: AuthRequest, res: Response) => {
  try {
    const { admissionId, recordedBy, page = 1, limit = 20 } = vitalSignSearchSchema.parse(req.query);

    const skip = (page - 1) * limit;
    const where: any = {};

    if (admissionId) where.admissionId = admissionId;
    if (recordedBy) where.recordedBy = recordedBy;

    const [vitalSigns, total] = await Promise.all([
      prisma.vitalSign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { recordedAt: 'desc' },
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
          recordedByUser: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
        },
      }),
      prisma.vitalSign.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        vitalSigns,
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

    console.error('Get vital signs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get vital sign by ID
export const getVitalSignById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const vitalSign = await prisma.vitalSign.findUnique({
      where: { id },
      include: {
        admission: {
          include: {
            patient: true,
            ward: true,
            bed: true,
          },
        },
        recordedByUser: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    if (!vitalSign) {
      return res.status(404).json({
        success: false,
        message: 'Vital sign not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { vitalSign },
    });
  } catch (error) {
    console.error('Get vital sign by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update vital sign
export const updateVitalSign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = vitalSignUpdateSchema.parse(req.body);

    const existingVitalSign = await prisma.vitalSign.findUnique({
      where: { id },
    });

    if (!existingVitalSign) {
      return res.status(404).json({
        success: false,
        message: 'Vital sign not found',
      });
    }

    const vitalSign = await prisma.vitalSign.update({
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
        recordedByUser: {
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
        action: 'UPDATE_VITAL_SIGN',
        tableName: 'vital_signs',
        recordId: vitalSign.id,
        oldValue: existingVitalSign,
        newValue: vitalSign,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Vital sign updated successfully',
      data: { vitalSign },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }

    console.error('Update vital sign error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Delete vital sign
export const deleteVitalSign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const vitalSign = await prisma.vitalSign.findUnique({
      where: { id },
    });

    if (!vitalSign) {
      return res.status(404).json({
        success: false,
        message: 'Vital sign not found',
      });
    }

    await prisma.vitalSign.delete({
      where: { id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE_VITAL_SIGN',
        tableName: 'vital_signs',
        recordId: id,
        oldValue: vitalSign,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Vital sign deleted successfully',
    });
  } catch (error) {
    console.error('Delete vital sign error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get vital signs for a specific admission
export const getAdmissionVitalSigns = async (req: AuthRequest, res: Response) => {
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

    const vitalSigns = await prisma.vitalSign.findMany({
      where: { admissionId },
      orderBy: { recordedAt: 'desc' },
      include: {
        recordedByUser: {
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
      data: { vitalSigns },
    });
  } catch (error) {
    console.error('Get admission vital signs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get latest vital signs for a specific admission
export const getLatestVitalSigns = async (req: AuthRequest, res: Response) => {
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

    const vitalSign = await prisma.vitalSign.findFirst({
      where: { admissionId },
      orderBy: { recordedAt: 'desc' },
      include: {
        recordedByUser: {
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
      data: { vitalSign },
    });
  } catch (error) {
    console.error('Get latest vital signs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

