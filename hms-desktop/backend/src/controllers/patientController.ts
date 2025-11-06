import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const patientCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  age: z.number().int().min(0, 'Age must be positive').max(150, 'Invalid age'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { message: 'Invalid gender' }),
  phone: z.string().min(10, 'Phone number too short').max(15, 'Phone number too long'),
  address: z.string().min(1, 'Address is required').max(500, 'Address too long'),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

const patientUpdateSchema = patientCreateSchema.partial();

const patientSearchSchema = z.object({
  search: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bloodGroup: z.string().optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional(),
});

// Create new patient
export const createPatient = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = patientCreateSchema.parse(req.body);

    // Check for duplicate phone number
    const existingPatient = await prisma.patient.findUnique({
      where: { phone: validatedData.phone },
    });

    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Patient with this phone number already exists',
        data: { existingPatientId: existingPatient.id }
      });
    }

    // Create patient
    const patient = await prisma.patient.create({
      data: validatedData,
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE_PATIENT',
        tableName: 'patients',
        recordId: patient.id,
        newValue: patient,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: { patient },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Create patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all patients with search and pagination
export const getPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { search, gender, bloodGroup, page = 1, limit = 20 } = patientSearchSchema.parse(req.query);
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (gender) {
      where.gender = gender;
    }
    
    if (bloodGroup) {
      where.bloodGroup = bloodGroup;
    }

    // Get patients with pagination
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
          emergencyContactName: true,
          emergencyContactPhone: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.patient.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        patients,
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
    
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get patient by ID
export const getPatientById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            doctor: {
              select: { fullName: true, role: true },
            },
          },
        },
        consultations: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            doctor: {
              select: { fullName: true, role: true },
            },
          },
        },
        prescriptions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            doctor: {
              select: { fullName: true, role: true },
            },
          },
        },
        labTests: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            testCatalog: {
              select: { testName: true, price: true },
            },
          },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    res.json({
      success: true,
      data: { patient },
    });
  } catch (error) {
    console.error('Get patient by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update patient
export const updatePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = patientUpdateSchema.parse(req.body);

    // Check if patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    // Check for duplicate phone number if phone is being updated
    if (validatedData.phone && validatedData.phone !== existingPatient.phone) {
      const duplicatePatient = await prisma.patient.findUnique({
        where: { phone: validatedData.phone },
      });

      if (duplicatePatient) {
        return res.status(400).json({
          success: false,
          message: 'Patient with this phone number already exists',
          data: { existingPatientId: duplicatePatient.id }
        });
      }
    }

    // Update patient
    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: validatedData,
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE_PATIENT',
        tableName: 'patients',
        recordId: id,
        oldValue: existingPatient,
        newValue: updatedPatient,
      },
    });

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: { patient: updatedPatient },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Delete patient
export const deletePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { force } = req.query; // Allow force delete with ?force=true

    // Check if patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    // Check if patient has related records
    const [appointments, consultations, prescriptions, labTests, bills, admissions, inpatientBills, dischargeSummaries] = await Promise.all([
      prisma.appointment.count({ where: { patientId: id } }),
      prisma.consultation.count({ where: { patientId: id } }),
      prisma.prescription.count({ where: { patientId: id } }),
      prisma.labTest.count({ where: { patientId: id } }),
      prisma.bill.count({ where: { patientId: id } }),
      prisma.admission.count({ where: { patientId: id } }),
      prisma.inpatientBill.count({ where: { patientId: id } }),
      prisma.dischargeSummary.count({ where: { patientId: id } }),
    ]);

    const hasRelatedRecords = appointments > 0 || consultations > 0 || prescriptions > 0 || labTests > 0 || 
                              bills > 0 || admissions > 0 || inpatientBills > 0 || dischargeSummaries > 0;

    // If force delete is requested, allow deletion with cascade (schema has onDelete: Cascade)
    if (hasRelatedRecords && force !== 'true') {
      const recordCounts = {
        appointments,
        consultations,
        prescriptions,
        labTests,
        bills,
        admissions,
        inpatientBills,
        dischargeSummaries,
      };
      
      const recordTypes = Object.entries(recordCounts)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => `${type}: ${count}`)
        .join(', ');

      return res.status(400).json({
        success: false,
        message: `Cannot delete patient with existing medical records. Found: ${recordTypes}. Use force=true to delete all related records.`,
        data: recordCounts,
        canForceDelete: true, // Indicate that force delete is available
      });
    }

    // Log warning if force deleting with related records
    if (hasRelatedRecords && force === 'true') {
      console.warn(`⚠️ Force deleting patient ${id} with related records:`, {
        appointments,
        consultations,
        prescriptions,
        labTests,
        bills,
        admissions,
        inpatientBills,
        dischargeSummaries,
      });
    }

    // Delete patient (this will cascade delete related records due to onDelete: Cascade in schema)
    await prisma.patient.delete({
      where: { id },
    });

    console.log(`✅ Patient deleted successfully: ${id}`);

    // Log the action (with error handling to prevent deletion failure)
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'DELETE_PATIENT',
          tableName: 'patients',
          recordId: id,
          oldValue: existingPatient,
        },
      });
    } catch (auditError) {
      console.warn('Failed to create audit log for patient deletion:', auditError);
      // Don't fail the deletion if audit log creation fails
    }

    res.json({
      success: true,
      message: 'Patient deleted successfully',
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Search patients by phone number
export const searchPatientByPhone = async (req: AuthRequest, res: Response) => {
  try {
    const { phone } = req.params;

    if (!phone || phone.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be at least 3 characters',
      });
    }

    const patients = await prisma.patient.findMany({
      where: {
        phone: { contains: phone },
      },
      select: {
        id: true,
        name: true,
        age: true,
        gender: true,
        phone: true,
        address: true,
        bloodGroup: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      success: true,
      data: { patients },
    });
  } catch (error) {
    console.error('Search patient by phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get patient statistics
export const getPatientStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalPatients,
      patientsByGender,
      patientsByAgeGroup,
      recentPatients,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.patient.groupBy({
        by: ['gender'],
        _count: { gender: true },
      }),
      prisma.patient.groupBy({
        by: ['age'],
        _count: { age: true },
      }).then(results => 
        results.map(result => ({
          age_group: result.age < 18 ? 'Under 18' :
                    result.age <= 30 ? '18-30' :
                    result.age <= 50 ? '31-50' :
                    result.age <= 70 ? '51-70' : 'Over 70',
          count: result._count.age
        }))
      ),
      prisma.patient.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalPatients,
        patientsByGender,
        patientsByAgeGroup,
        recentPatients,
      },
    });
  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
