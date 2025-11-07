import { Response } from 'express';
import { PrismaClient, AdmissionType, AdmissionStatus } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const admissionCreateSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  wardId: z.string().min(1, 'Ward ID is required'),
  bedId: z.string().min(1, 'Bed ID is required'),
  admissionDate: z.string().transform(str => new Date(str)),
  admissionType: z.nativeEnum(AdmissionType, { message: 'Invalid admission type' }),
  admissionReason: z.string().min(1, 'Admission reason is required').max(500, 'Reason too long'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  // Day care specific fields
  isDayCare: z.boolean().optional(),
  procedureStartTime: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  procedureEndTime: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  recoveryStartTime: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  recoveryEndTime: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  expectedDischargeTime: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  homeSupportAvailable: z.boolean().optional(),
});

const admissionUpdateSchema = z.object({
  wardId: z.string().min(1, 'Ward ID is required').optional(),
  bedId: z.string().min(1, 'Bed ID is required').optional(),
  admissionType: z.nativeEnum(AdmissionType, { message: 'Invalid admission type' }).optional(),
  admissionReason: z.string().min(1, 'Admission reason is required').max(500, 'Reason too long').optional(),
  status: z.nativeEnum(AdmissionStatus, { message: 'Invalid admission status' }).optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  dischargeNotes: z.string().max(1000, 'Discharge notes too long').optional(),
  // Day care specific fields
  isDayCare: z.boolean().optional(),
  procedureStartTime: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  procedureEndTime: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  recoveryStartTime: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  recoveryEndTime: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  expectedDischargeTime: z.string().transform(str => str ? new Date(str) : undefined).optional(),
  homeSupportAvailable: z.boolean().optional(),
});

const admissionSearchSchema = z.object({
  search: z.string().optional(),
  patientId: z.string().optional(),
  wardId: z.string().optional(),
  status: z.nativeEnum(AdmissionStatus).optional(),
  admissionType: z.nativeEnum(AdmissionType).optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional(),
});

// Create new admission
export const createAdmission = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = admissionCreateSchema.parse(req.body);

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: validatedData.patientId },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    // Check if patient is already admitted
    const existingAdmission = await prisma.admission.findFirst({
      where: {
        patientId: validatedData.patientId,
        status: 'ADMITTED',
      },
    });

    if (existingAdmission) {
      return res.status(400).json({
        success: false,
        message: 'Patient is already admitted',
        data: { existingAdmission },
      });
    }

    // Check if ward exists
    const ward = await prisma.ward.findUnique({
      where: { id: validatedData.wardId },
    });

    if (!ward) {
      return res.status(404).json({
        success: false,
        message: 'Ward not found',
      });
    }

    // Check if bed exists and is available
    const bed = await prisma.bed.findUnique({
      where: { id: validatedData.bedId },
    });

    if (!bed) {
      return res.status(404).json({
        success: false,
        message: 'Bed not found',
      });
    }

    if (bed.isOccupied) {
      return res.status(400).json({
        success: false,
        message: 'Bed is already occupied',
      });
    }

    if (bed.wardId !== validatedData.wardId) {
      return res.status(400).json({
        success: false,
        message: 'Bed does not belong to the specified ward',
      });
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create admission
      const isDayCare = validatedData.admissionType === 'DAY_CARE' || validatedData.isDayCare;
      const newAdmission = await tx.admission.create({
        data: {
          patientId: validatedData.patientId,
          wardId: validatedData.wardId,
          bedId: validatedData.bedId,
          admissionDate: validatedData.admissionDate,
          admissionType: validatedData.admissionType,
          admissionReason: validatedData.admissionReason,
          notes: validatedData.notes,
          status: 'ADMITTED',
          admittedBy: req.user!.id,
          // Day care specific fields
          isDayCare: isDayCare,
          procedureStartTime: validatedData.procedureStartTime,
          procedureEndTime: validatedData.procedureEndTime,
          recoveryStartTime: validatedData.recoveryStartTime,
          recoveryEndTime: validatedData.recoveryEndTime,
          expectedDischargeTime: validatedData.expectedDischargeTime,
          homeSupportAvailable: validatedData.homeSupportAvailable,
        },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              age: true,
              gender: true,
              phone: true,
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
              bedType: true,
            },
          },
          admittedByUser: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
        },
      });

      // Update bed as occupied
      await tx.bed.update({
        where: { id: validatedData.bedId },
        data: { isOccupied: true },
      });

      // Update ward occupancy
      await tx.ward.update({
        where: { id: validatedData.wardId },
        data: {
          currentOccupancy: {
            increment: 1,
          },
        },
      });

      // Update patient type to INPATIENT
      await tx.patient.update({
        where: { id: validatedData.patientId },
        data: { patientType: 'INPATIENT' },
      });

      return newAdmission;
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE_ADMISSION',
        tableName: 'admissions',
        recordId: result.id,
        newValue: {
          patientId: result.patientId,
          wardId: result.wardId,
          bedId: result.bedId,
          admissionType: result.admissionType,
          status: result.status,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Patient admitted successfully',
      data: { admission: result },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Create admission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all admissions with search and pagination
export const getAdmissions = async (req: AuthRequest, res: Response) => {
  try {
    const { search, patientId, wardId, status, admissionType, page = 1, limit = 20 } = admissionSearchSchema.parse(req.query);
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { patient: { name: { contains: search, mode: 'insensitive' } } },
        { admissionReason: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (patientId) {
      where.patientId = patientId;
    }
    
    if (wardId) {
      where.wardId = wardId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (admissionType) {
      where.admissionType = admissionType;
    }

    // Get admissions with pagination
    const [admissions, total] = await Promise.all([
      prisma.admission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              age: true,
              gender: true,
              phone: true,
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
              bedType: true,
            },
          },
          admittedByUser: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
          dischargedByUser: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
        },
      }),
      prisma.admission.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        admissions,
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Get admissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get admission by ID
export const getAdmissionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const admission = await prisma.admission.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            phone: true,
            address: true,
            bloodGroup: true,
            allergies: true,
            chronicConditions: true,
          },
        },
        ward: {
          select: {
            id: true,
            name: true,
            type: true,
            capacity: true,
            currentOccupancy: true,
          },
        },
        bed: {
          select: {
            id: true,
            bedNumber: true,
            bedType: true,
            isOccupied: true,
          },
        },
        admittedByUser: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
        dischargedByUser: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
        dailyRounds: {
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
        },
        vitalSigns: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
          include: {
            recordedByUser: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
        nursingShifts: {
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
        },
        inpatientBills: {
          orderBy: { createdAt: 'desc' },
        },
        dischargeSummary: true,
      },
    });

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found',
      });
    }

    res.json({
      success: true,
      data: { admission },
    });
  } catch (error) {
    console.error('Get admission by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update admission
export const updateAdmission = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = admissionUpdateSchema.parse(req.body);

    // Check if admission exists
    const existingAdmission = await prisma.admission.findUnique({
      where: { id },
    });

    if (!existingAdmission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found',
      });
    }

    // Update admission
    const updatedAdmission = await prisma.admission.update({
      where: { id },
      data: validatedData,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            phone: true,
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
            bedType: true,
          },
        },
        admittedByUser: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
        dischargedByUser: {
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
        action: 'UPDATE_ADMISSION',
        tableName: 'admissions',
        recordId: id,
        oldValue: {
          wardId: existingAdmission.wardId,
          bedId: existingAdmission.bedId,
          status: existingAdmission.status,
        },
        newValue: {
          wardId: updatedAdmission.wardId,
          bedId: updatedAdmission.bedId,
          status: updatedAdmission.status,
        },
      },
    });

    res.json({
      success: true,
      message: 'Admission updated successfully',
      data: { admission: updatedAdmission },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Update admission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Discharge patient
export const dischargePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { dischargeNotes } = req.body;

    // Check if admission exists and is active
    const admission = await prisma.admission.findUnique({
      where: { id },
      include: {
        patient: true,
        ward: true,
        bed: true,
      },
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
        message: 'Patient is not currently admitted',
      });
    }

    // Enforce No-Dues gate: compute pending charges and block discharge if dues exist
    const charges = await getChargesPreviewInternal(admission.id);
    if (charges.totalAmount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Discharge blocked: No-dues check failed. Pending charges exist.',
        data: { charges }
      });
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update admission
      const updatedAdmission = await tx.admission.update({
        where: { id },
        data: {
          status: 'DISCHARGED',
          dischargeDate: new Date(),
          dischargedBy: req.user!.id,
          dischargeNotes,
        },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              age: true,
              gender: true,
              phone: true,
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
              bedType: true,
            },
          },
          admittedByUser: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
          dischargedByUser: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
        },
      });

      // Update bed as available
      await tx.bed.update({
        where: { id: admission.bedId },
        data: { isOccupied: false },
      });

      // Update ward occupancy
      await tx.ward.update({
        where: { id: admission.wardId },
        data: {
          currentOccupancy: {
            decrement: 1,
          },
        },
      });

      // Update patient type to OUTPATIENT
      await tx.patient.update({
        where: { id: admission.patientId },
        data: { patientType: 'OUTPATIENT' },
      });

      return updatedAdmission;
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DISCHARGE_PATIENT',
        tableName: 'admissions',
        recordId: id,
        oldValue: {
          status: 'ADMITTED',
          dischargeDate: null,
        },
        newValue: {
          status: 'DISCHARGED',
          dischargeDate: result.dischargeDate,
          dischargedBy: req.user!.id,
        },
      },
    });

    res.json({
      success: true,
      message: 'Patient discharged successfully',
      data: { admission: result },
    });
  } catch (error) {
    console.error('Discharge patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// ===== Charges Preview (24-hour cycle room charges + placeholders) =====

type ChargesPreview = {
  roomCharges: number;
  procedureCharges: number;
  medicineCharges: number;
  labCharges: number;
  otherCharges: number;
  totalAmount: number;
  details: {
    wardType?: string;
    tariffPerDay?: number;
    daysCharged?: number;
  }
}

async function getWardTariffPerDay(wardId: string, wardType: string): Promise<number> {
  // First, check if the ward has a specific dailyRate set
  const ward = await prisma.ward.findUnique({
    where: { id: wardId },
    select: { dailyRate: true },
  });
  
  // If ward has a dailyRate, use it
  if (ward?.dailyRate) {
    return ward.dailyRate.toNumber();
  }
  
  // Otherwise, fall back to ward type defaults from hospital config
  const cfg = await prisma.hospitalConfig.findFirst();
  const modulesEnabled: any = cfg?.modulesEnabled || {};
  const ipdSettings = modulesEnabled.ipdSettings || {};
  const wardTariffs = ipdSettings.wardTariffs || {
    GENERAL: 1000,
    SEMI_PRIVATE: 2000,
    PRIVATE: 3000,
    ICU: 5000,
  };
  return wardTariffs[wardType] ?? 1000;
}

async function getChargesPreviewInternal(admissionId: string): Promise<ChargesPreview> {
  const admission = await prisma.admission.findUnique({
    where: { id: admissionId },
    include: { ward: true },
  });
  if (!admission) {
    return { roomCharges: 0, procedureCharges: 0, medicineCharges: 0, labCharges: 0, otherCharges: 0, totalAmount: 0, details: {} };
  }

  // 24-hour cycle from admissionDate to now (or dischargeDate if set)
  const start = admission.admissionDate;
  const end = new Date();
  const ms = end.getTime() - start.getTime();
  const days = Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000))); // charge full day blocks
  const tariff = await getWardTariffPerDay(admission.wardId, admission.ward.type);
  const roomCharges = days * tariff;

  // Placeholders for now; can be wired to real data later
  const procedureCharges = 0;
  const medicineCharges = 0;
  const labCharges = 0;
  const otherCharges = 0;
  const totalAmount = roomCharges + procedureCharges + medicineCharges + labCharges + otherCharges;

  return {
    roomCharges,
    procedureCharges,
    medicineCharges,
    labCharges,
    otherCharges,
    totalAmount,
    details: { wardType: admission.ward.type, tariffPerDay: tariff, daysCharged: days },
  };
}

// Public endpoint: charges preview
export const getChargesPreview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const preview = await getChargesPreviewInternal(id);
    return res.json({ success: true, data: { charges: preview } });
  } catch (error) {
    console.error('Charges preview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to compute charges' });
  }
};

// Get current admissions
export const getCurrentAdmissions = async (req: AuthRequest, res: Response) => {
  try {
    const { wardId } = req.query;

    const where: any = {
      status: 'ADMITTED',
    };

    if (wardId) {
      where.wardId = wardId as string;
    }

    const admissions = await prisma.admission.findMany({
      where,
      orderBy: { admissionDate: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            phone: true,
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
            bedType: true,
          },
        },
        admittedByUser: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
        dailyRounds: {
          orderBy: { roundDate: 'desc' },
          take: 1,
          include: {
            doctor: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
        vitalSigns: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    res.json({
      success: true,
      data: { admissions },
    });
  } catch (error) {
    console.error('Get current admissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get admission statistics
export const getAdmissionStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalAdmissions,
      currentAdmissions,
      dischargedToday,
      admissionsByType,
      admissionsByWard,
      dischargedAdmissions,
    ] = await Promise.all([
      prisma.admission.count(),
      prisma.admission.count({ where: { status: 'ADMITTED' } }),
      prisma.admission.count({
        where: {
          status: 'DISCHARGED',
          dischargeDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      prisma.admission.groupBy({
        by: ['admissionType'],
        _count: { admissionType: true },
      }),
      prisma.admission.groupBy({
        by: ['wardId'],
        _count: { wardId: true },
        where: { status: 'ADMITTED' },
      }),
      // Calculate average stay duration manually
      prisma.admission.findMany({
        where: {
          status: 'DISCHARGED',
          dischargeDate: { not: null },
        },
        select: {
          admissionDate: true,
          dischargeDate: true,
        },
      }),
    ]);

    // Calculate average stay duration
    const averageStayDuration = dischargedAdmissions.length > 0 
      ? dischargedAdmissions.reduce((sum, admission) => {
          const stayDuration = admission.dischargeDate!.getTime() - admission.admissionDate.getTime();
          return sum + stayDuration;
        }, 0) / dischargedAdmissions.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    res.json({
      success: true,
      data: {
        totalAdmissions,
        currentAdmissions,
        dischargedToday,
        admissionsByType,
        admissionsByWard,
        averageStayDuration: Math.round(averageStayDuration * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Get admission stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
