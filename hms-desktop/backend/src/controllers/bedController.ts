import { Response } from 'express';
import { PrismaClient, BedType } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const bedCreateSchema = z.object({
  wardId: z.string().min(1, 'Ward ID is required'),
  bedNumber: z.string().min(1, 'Bed number is required').max(20, 'Bed number too long'),
  bedType: z.nativeEnum(BedType, { message: 'Invalid bed type' }),
  notes: z.string().max(500, 'Notes too long').optional(),
});

const bedUpdateSchema = z.object({
  bedNumber: z.string().min(1, 'Bed number is required').max(20, 'Bed number too long').optional(),
  bedType: z.nativeEnum(BedType, { message: 'Invalid bed type' }).optional(),
  isOccupied: z.boolean().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
});

const bedSearchSchema = z.object({
  wardId: z.string().optional(),
  bedType: z.nativeEnum(BedType).optional(),
  isOccupied: z.string().transform(val => val === 'true' ? true : val === 'false' ? false : undefined).optional(),
  isActive: z.string().transform(val => val === 'true' ? true : val === 'false' ? false : undefined).optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional(),
});

// Create new bed
export const createBed = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = bedCreateSchema.parse(req.body);

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

    // Check if bed number already exists in this ward
    const existingBed = await prisma.bed.findFirst({
      where: {
        wardId: validatedData.wardId,
        bedNumber: validatedData.bedNumber,
      },
    });

    if (existingBed) {
      return res.status(400).json({
        success: false,
        message: 'Bed with this number already exists in this ward',
      });
    }

    // Create bed
    const newBed = await prisma.bed.create({
      data: {
        wardId: validatedData.wardId,
        bedNumber: validatedData.bedNumber,
        bedType: validatedData.bedType,
        notes: validatedData.notes,
        isOccupied: false,
        isActive: true,
      },
      include: {
        ward: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE_BED',
        tableName: 'beds',
        recordId: newBed.id,
        newValue: {
          wardId: newBed.wardId,
          bedNumber: newBed.bedNumber,
          bedType: newBed.bedType,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Bed created successfully',
      data: { bed: newBed },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Create bed error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all beds with search and pagination
export const getBeds = async (req: AuthRequest, res: Response) => {
  try {
    const { wardId, bedType, isOccupied, isActive, page = 1, limit = 20 } = bedSearchSchema.parse(req.query);
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    if (wardId) {
      where.wardId = wardId;
    }
    
    if (bedType) {
      where.bedType = bedType;
    }
    
    if (isOccupied !== undefined) {
      where.isOccupied = isOccupied;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Get beds with pagination
    const [beds, total] = await Promise.all([
      prisma.bed.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          ward: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          admissions: {
            where: { status: 'ADMITTED' },
            include: {
              patient: {
                select: {
                  id: true,
                  name: true,
                  age: true,
                  gender: true,
                },
              },
            },
          },
        },
      }),
      prisma.bed.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        beds,
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
    
    console.error('Get beds error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get bed by ID
export const getBedById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const bed = await prisma.bed.findUnique({
      where: { id },
      include: {
        ward: {
          select: {
            id: true,
            name: true,
            type: true,
            capacity: true,
            currentOccupancy: true,
          },
        },
        admissions: {
          where: { status: 'ADMITTED' },
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
          },
        },
      },
    });

    if (!bed) {
      return res.status(404).json({
        success: false,
        message: 'Bed not found',
      });
    }

    res.json({
      success: true,
      data: { bed },
    });
  } catch (error) {
    console.error('Get bed by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update bed
export const updateBed = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = bedUpdateSchema.parse(req.body);

    // Check if bed exists
    const existingBed = await prisma.bed.findUnique({
      where: { id },
      include: {
        ward: true,
      },
    });

    if (!existingBed) {
      return res.status(404).json({
        success: false,
        message: 'Bed not found',
      });
    }

    // Check if bed number is being changed and if it already exists in the ward
    if (validatedData.bedNumber && validatedData.bedNumber !== existingBed.bedNumber) {
      const duplicateBed = await prisma.bed.findFirst({
        where: {
          wardId: existingBed.wardId,
          bedNumber: validatedData.bedNumber,
          id: { not: id },
        },
      });

      if (duplicateBed) {
        return res.status(400).json({
          success: false,
          message: 'Bed with this number already exists in this ward',
        });
      }
    }

    // Update bed
    const updatedBed = await prisma.bed.update({
      where: { id },
      data: validatedData,
      include: {
        ward: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        admissions: {
          where: { status: 'ADMITTED' },
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                age: true,
                gender: true,
              },
            },
          },
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE_BED',
        tableName: 'beds',
        recordId: id,
        oldValue: {
          wardId: existingBed.wardId,
          bedNumber: existingBed.bedNumber,
          bedType: existingBed.bedType,
          isOccupied: existingBed.isOccupied,
          isActive: existingBed.isActive,
        },
        newValue: {
          wardId: updatedBed.wardId,
          bedNumber: updatedBed.bedNumber,
          bedType: updatedBed.bedType,
          isOccupied: updatedBed.isOccupied,
          isActive: updatedBed.isActive,
        },
      },
    });

    res.json({
      success: true,
      message: 'Bed updated successfully',
      data: { bed: updatedBed },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Update bed error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Delete bed
export const deleteBed = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if bed exists
    const existingBed = await prisma.bed.findUnique({
      where: { id },
    });

    if (!existingBed) {
      return res.status(404).json({
        success: false,
        message: 'Bed not found',
      });
    }

    // Check if bed is currently occupied
    if (existingBed.isOccupied) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete occupied bed',
      });
    }

    // Check if bed has active admissions
    const activeAdmissions = await prisma.admission.count({
      where: { 
        bedId: id,
        status: 'ADMITTED',
      },
    });

    if (activeAdmissions > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete bed with active admissions',
        data: { activeAdmissions },
      });
    }

    // Delete bed
    await prisma.bed.delete({
      where: { id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE_BED',
        tableName: 'beds',
        recordId: id,
        oldValue: {
          wardId: existingBed.wardId,
          bedNumber: existingBed.bedNumber,
          bedType: existingBed.bedType,
        },
      },
    });

    res.json({
      success: true,
      message: 'Bed deleted successfully',
    });
  } catch (error) {
    console.error('Delete bed error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get available beds
export const getAvailableBeds = async (req: AuthRequest, res: Response) => {
  try {
    const { wardId, bedType } = req.query;

    const where: any = {
      isOccupied: false,
      isActive: true,
    };

    if (wardId) {
      where.wardId = wardId as string;
    }

    if (bedType) {
      where.bedType = bedType as BedType;
    }

    const availableBeds = await prisma.bed.findMany({
      where,
      include: {
        ward: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: [
        { ward: { name: 'asc' } },
        { bedNumber: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: { beds: availableBeds },
    });
  } catch (error) {
    console.error('Get available beds error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get bed statistics
export const getBedStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalBeds,
      bedsByType,
      occupiedBeds,
      availableBeds,
      bedsByWard,
    ] = await Promise.all([
      prisma.bed.count(),
      prisma.bed.groupBy({
        by: ['bedType'],
        _count: { bedType: true },
      }),
      prisma.bed.count({ where: { isOccupied: true } }),
      prisma.bed.count({ where: { isOccupied: false, isActive: true } }),
      prisma.bed.groupBy({
        by: ['wardId'],
        _count: { wardId: true },
      }),
    ]);

    const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalBeds,
        bedsByType,
        occupiedBeds,
        availableBeds,
        bedsByWard,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Get bed stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
