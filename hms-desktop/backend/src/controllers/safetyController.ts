import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const drugInteractionSchema = z.object({
  medicine1Id: z.string().min(1, 'Medicine 1 ID is required'),
  medicine2Id: z.string().min(1, 'Medicine 2 ID is required'),
  interactionType: z.string().min(1, 'Interaction type is required'),
  description: z.string().min(1, 'Description is required'),
  clinicalEffect: z.string().optional(),
  management: z.string().optional(),
  severity: z.enum(['High', 'Medium', 'Low']),
});

const checkInteractionsSchema = z.object({
  medicineIds: z.array(z.string()).min(2, 'At least 2 medicines required for interaction check'),
});

const checkAllergiesSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  medicineIds: z.array(z.string()).min(1, 'At least 1 medicine required'),
});

// Check drug interactions
export const checkDrugInteractions = async (req: AuthRequest, res: Response) => {
  try {
    const { medicineIds } = checkInteractionsSchema.parse(req.body);
    
    const interactions = [];
    
    // Check all possible pairs
    for (let i = 0; i < medicineIds.length; i++) {
      for (let j = i + 1; j < medicineIds.length; j++) {
        const interaction = await prisma.drugInteraction.findFirst({
          where: {
            OR: [
              {
                medicine1Id: medicineIds[i],
                medicine2Id: medicineIds[j],
              },
              {
                medicine1Id: medicineIds[j],
                medicine2Id: medicineIds[i],
              },
            ],
            isActive: true,
          },
          include: {
            medicine1: { 
              select: { 
                id: true,
                name: true,
                genericName: true,
                manufacturer: true,
              } 
            },
            medicine2: { 
              select: { 
                id: true,
                name: true,
                genericName: true,
                manufacturer: true,
              } 
            },
          },
        });
        
        if (interaction) {
          interactions.push({
            medicine1: interaction.medicine1.name,
            medicine2: interaction.medicine2.name,
            medicine1Id: interaction.medicine1Id,
            medicine2Id: interaction.medicine2Id,
            type: interaction.interactionType,
            description: interaction.description,
            severity: interaction.severity,
            clinicalEffect: interaction.clinicalEffect,
            management: interaction.management,
          });
        }
      }
    }
    
    res.json({
      success: true,
      data: { interactions },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Check drug interactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Check patient allergies
export const checkPatientAllergies = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, medicineIds } = checkAllergiesSchema.parse(req.body);
    
    const allergies = [];
    
    for (const medicineId of medicineIds) {
      const medicine = await prisma.medicineCatalog.findUnique({
        where: { id: medicineId },
        select: { 
          id: true,
          name: true,
          genericName: true,
          manufacturer: true,
        },
      });
      
      if (medicine) {
        // Check for allergies using both medicine name and generic name
        const patientAllergies = await prisma.patientAllergy.findMany({
          where: {
            patientId,
            allergy: {
              OR: [
                { name: { contains: medicine.name, mode: 'insensitive' } },
                { name: { contains: medicine.genericName || '', mode: 'insensitive' } },
                // Also check if medicine name contains allergy name (for broader matching)
                { name: { contains: medicine.name.split(' ')[0], mode: 'insensitive' } },
              ],
            },
          },
          include: {
            allergy: {
              select: {
                id: true,
                name: true,
                category: true,
                severity: true,
              },
            },
          },
        });
        
        if (patientAllergies.length > 0) {
          allergies.push({
            medicine: medicine.name,
            medicineId: medicine.id,
            allergies: patientAllergies.map(pa => ({
              name: pa.allergy.name,
              category: pa.allergy.category,
              severity: pa.allergy.severity,
              notes: pa.notes,
            })),
          });
        }
      }
    }
    
    res.json({
      success: true,
      data: { allergies },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Check patient allergies error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Add drug interaction
export const addDrugInteraction = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = drugInteractionSchema.parse(req.body);
    
    // Check if interaction already exists
    const existingInteraction = await prisma.drugInteraction.findFirst({
      where: {
        OR: [
          {
            medicine1Id: validatedData.medicine1Id,
            medicine2Id: validatedData.medicine2Id,
          },
          {
            medicine1Id: validatedData.medicine2Id,
            medicine2Id: validatedData.medicine1Id,
          },
        ],
      },
    });
    
    if (existingInteraction) {
      return res.status(400).json({
        success: false,
        message: 'Drug interaction already exists between these medicines',
      });
    }
    
    const interaction = await prisma.drugInteraction.create({
      data: validatedData,
      include: {
        medicine1: { 
          select: { 
            id: true,
            name: true,
            genericName: true,
            manufacturer: true,
          } 
        },
        medicine2: { 
          select: { 
            id: true,
            name: true,
            genericName: true,
            manufacturer: true,
          } 
        },
      },
    });
    
    res.status(201).json({
      success: true,
      data: { interaction },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Add drug interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all drug interactions
export const getAllDrugInteractions = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = { isActive: true };
    
    if (search) {
      where.OR = [
        { description: { contains: search as string, mode: 'insensitive' } },
        { medicine1: { name: { contains: search as string, mode: 'insensitive' } } },
        { medicine2: { name: { contains: search as string, mode: 'insensitive' } } },
      ];
    }
    
    const [interactions, total] = await Promise.all([
      prisma.drugInteraction.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          medicine1: { 
            select: { 
              id: true,
              name: true,
              genericName: true,
              manufacturer: true,
            } 
          },
          medicine2: { 
            select: { 
              id: true,
              name: true,
              genericName: true,
              manufacturer: true,
            } 
          },
        },
      }),
      prisma.drugInteraction.count({ where }),
    ]);
    
    const totalPages = Math.ceil(total / Number(limit));
    
    res.json({
      success: true,
      data: {
        interactions,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: total,
          itemsPerPage: Number(limit),
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get all drug interactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update drug interaction
export const updateDrugInteraction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = drugInteractionSchema.partial().parse(req.body);
    
    const interaction = await prisma.drugInteraction.update({
      where: { id },
      data: updateData,
      include: {
        medicine1: { 
          select: { 
            id: true,
            name: true,
            genericName: true,
            manufacturer: true,
          } 
        },
        medicine2: { 
          select: { 
            id: true,
            name: true,
            genericName: true,
            manufacturer: true,
          } 
        },
      },
    });
    
    res.json({
      success: true,
      data: { interaction },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Update drug interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Delete drug interaction
export const deleteDrugInteraction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.drugInteraction.update({
      where: { id },
      data: { isActive: false },
    });
    
    res.json({
      success: true,
      message: 'Drug interaction deleted successfully',
    });
  } catch (error) {
    console.error('Delete drug interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
