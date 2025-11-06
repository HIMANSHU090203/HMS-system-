import { Response } from 'express';
import { PrismaClient, PaymentStatus, PaymentMode } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const inpatientBillCreateSchema = z.object({
  admissionId: z.string().min(1, 'Admission ID is required'),
  roomCharges: z.number().min(0, 'Room charges must be positive'),
  procedureCharges: z.number().min(0, 'Procedure charges must be positive').default(0),
  medicineCharges: z.number().min(0, 'Medicine charges must be positive').default(0),
  labCharges: z.number().min(0, 'Lab charges must be positive').default(0),
  otherCharges: z.number().min(0, 'Other charges must be positive').default(0),
  notes: z.string().max(1000).optional(),
});

const inpatientBillUpdateSchema = z.object({
  roomCharges: z.number().min(0).optional(),
  procedureCharges: z.number().min(0).optional(),
  medicineCharges: z.number().min(0).optional(),
  labCharges: z.number().min(0).optional(),
  otherCharges: z.number().min(0).optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  paymentMode: z.nativeEnum(PaymentMode).optional(),
  paidAmount: z.number().min(0).optional().nullable(),
  notes: z.string().max(1000).optional(),
});

const inpatientBillSearchSchema = z.object({
  admissionId: z.string().optional(),
  patientId: z.string().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional(),
});

// Create new inpatient bill
export const createInpatientBill = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = inpatientBillCreateSchema.parse(req.body);

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

    // Calculate total amount
    const totalAmount = validatedData.roomCharges + 
                       validatedData.procedureCharges + 
                       validatedData.medicineCharges + 
                       validatedData.labCharges + 
                       validatedData.otherCharges;

    const inpatientBill = await prisma.inpatientBill.create({
      data: {
        admissionId: validatedData.admissionId,
        patientId: admission.patientId,
        roomCharges: validatedData.roomCharges,
        procedureCharges: validatedData.procedureCharges,
        medicineCharges: validatedData.medicineCharges,
        labCharges: validatedData.labCharges,
        otherCharges: validatedData.otherCharges,
        totalAmount: totalAmount,
        status: 'PENDING',
        notes: validatedData.notes,
        createdBy: req.user!.id,
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
              },
            },
          },
        },
        createdByUser: {
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
        action: 'CREATE_INPATIENT_BILL',
        tableName: 'inpatient_bills',
        recordId: inpatientBill.id,
        newValue: {
          admissionId: inpatientBill.admissionId,
          totalAmount: inpatientBill.totalAmount,
          status: inpatientBill.status,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Inpatient bill created successfully',
      data: { inpatientBill },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }

    console.error('Create inpatient bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all inpatient bills
export const getInpatientBills = async (req: AuthRequest, res: Response) => {
  try {
    const { admissionId, patientId, status, page = 1, limit = 20 } = inpatientBillSearchSchema.parse(req.query);

    const skip = (page - 1) * limit;
    const where: any = {};

    if (admissionId) where.admissionId = admissionId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;

    const [inpatientBills, total] = await Promise.all([
      prisma.inpatientBill.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admission: {
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
                },
              },
            },
          },
          createdByUser: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
        },
      }),
      prisma.inpatientBill.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        inpatientBills,
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

    console.error('Get inpatient bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get inpatient bill by ID
export const getInpatientBillById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const inpatientBill = await prisma.inpatientBill.findUnique({
      where: { id },
      include: {
        admission: {
          include: {
            patient: true,
            ward: true,
            bed: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    if (!inpatientBill) {
      return res.status(404).json({
        success: false,
        message: 'Inpatient bill not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { inpatientBill },
    });
  } catch (error) {
    console.error('Get inpatient bill by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update inpatient bill
export const updateInpatientBill = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = inpatientBillUpdateSchema.parse(req.body);

    const existingBill = await prisma.inpatientBill.findUnique({
      where: { id },
    });

    if (!existingBill) {
      return res.status(404).json({
        success: false,
        message: 'Inpatient bill not found',
      });
    }

    // Recalculate total if charges are updated
    let totalAmount: Decimal = existingBill.totalAmount;
    if (validatedData.roomCharges !== undefined || 
        validatedData.procedureCharges !== undefined ||
        validatedData.medicineCharges !== undefined ||
        validatedData.labCharges !== undefined ||
        validatedData.otherCharges !== undefined) {
      const roomCharges = validatedData.roomCharges ?? existingBill.roomCharges.toNumber();
      const procedureCharges = validatedData.procedureCharges ?? existingBill.procedureCharges.toNumber();
      const medicineCharges = validatedData.medicineCharges ?? existingBill.medicineCharges.toNumber();
      const labCharges = validatedData.labCharges ?? existingBill.labCharges.toNumber();
      const otherCharges = validatedData.otherCharges ?? existingBill.otherCharges.toNumber();
      
      totalAmount = new Decimal(roomCharges + procedureCharges + medicineCharges + labCharges + otherCharges);
    }

    const updateData: any = {
      ...validatedData,
      totalAmount,
    };

    const inpatientBill = await prisma.inpatientBill.update({
      where: { id },
      data: updateData,
      include: {
        admission: {
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
              },
            },
          },
        },
        createdByUser: {
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
        action: 'UPDATE_INPATIENT_BILL',
        tableName: 'inpatient_bills',
        recordId: inpatientBill.id,
        oldValue: existingBill,
        newValue: inpatientBill,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Inpatient bill updated successfully',
      data: { inpatientBill },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }

    console.error('Update inpatient bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get inpatient bills for a specific admission
export const getAdmissionInpatientBills = async (req: AuthRequest, res: Response) => {
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

    const inpatientBills = await prisma.inpatientBill.findMany({
      where: { admissionId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdByUser: {
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
      data: { inpatientBills },
    });
  } catch (error) {
    console.error('Get admission inpatient bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

