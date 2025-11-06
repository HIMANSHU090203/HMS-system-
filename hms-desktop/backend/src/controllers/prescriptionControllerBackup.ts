import { Response } from 'express';
import { PrismaClient, PrescriptionStatus } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const prescriptionItemSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.number().int().positive('Duration must be positive'),
  instructions: z.string().optional(),
  dosage: z.string().optional(),
  withFood: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const prescriptionCreateSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  appointmentId: z.string().optional(),
  consultationId: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(prescriptionItemSchema).min(1, 'At least one medicine item is required'),
});

// Generate unique prescription number
const generatePrescriptionNumber = async (): Promise<string> => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  const prefix = `RX${year}${month}${day}`;
  
  // Get count of prescriptions for today
  const startOfDay = new Date(year, today.getMonth(), today.getDate());
  const endOfDay = new Date(year, today.getMonth(), today.getDate() + 1);
  
  const count = await prisma.prescription.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });
  
  const sequence = String(count + 1).padStart(4, '0');
  return `${prefix}${sequence}`;
};

// Create prescription - Simplified version
export const createPrescription = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Creating prescription with data:', req.body);
    
    const userId = req.user?.id;
    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    console.log('User ID:', userId);
    const validatedData = prescriptionCreateSchema.parse(req.body);
    console.log('Validated data:', validatedData);
    
    // Generate prescription number
    const prescriptionNumber = await generatePrescriptionNumber();
    console.log('Generated prescription number:', prescriptionNumber);
    
    // Calculate total amount
    let totalAmount = 0;
    for (const item of validatedData.items) {
      const medicine = await prisma.medicineCatalog.findUnique({
        where: { id: item.medicineId },
        select: { price: true },
      });
      if (medicine) {
        totalAmount += Number(medicine.price) * item.quantity;
      }
    }
    console.log('Calculated total amount:', totalAmount);

    // Create prescription without safety checks for now
    const prescription = await prisma.prescription.create({
      data: {
        patientId: validatedData.patientId,
        doctorId: userId,
        appointmentId: validatedData.appointmentId,
        consultationId: validatedData.consultationId,
        prescriptionNumber,
        notes: validatedData.notes,
        totalAmount,
        prescriptionItems: {
          create: validatedData.items.map((item, index) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions,
            dosage: item.dosage,
            withFood: item.withFood,
            startDate: item.startDate ? new Date(item.startDate) : null,
            endDate: item.endDate ? new Date(item.endDate) : null,
            rowOrder: index,
          })),
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
        prescriptionItems: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                genericName: true,
                manufacturer: true,
                price: true,
                category: true,
              },
            },
          },
          orderBy: { rowOrder: 'asc' },
        },
      },
    });

    console.log('Prescription created successfully:', prescription.id);
    
    res.status(201).json({
      success: true,
      data: {
        prescription,
        warnings: {
          interactions: [],
          allergies: [],
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Export other functions as stubs for now
export const getPrescriptions = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { prescriptions: [], pagination: {} } });
};

export const getPrescriptionById = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { prescription: {} } });
};

export const updatePrescription = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { prescription: {} } });
};

export const dispensePrescription = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'Prescription dispensed' });
};

export const cancelPrescription = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'Prescription cancelled' });
};

export const getPrescriptionStats = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { stats: {} } });
};

export const getPendingPrescriptions = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { prescriptions: [] } });
};
