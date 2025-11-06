import { Response } from 'express';
import { PrismaClient, WardType, BedType } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const wardCreateSchema = z.object({
  name: z.string().min(1, 'Ward name is required').max(100, 'Ward name too long'),
  type: z.nativeEnum(WardType, { message: 'Invalid ward type' }),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(1000, 'Capacity too high'),
  description: z.string().max(500, 'Description too long').optional(),
  floor: z.string().max(50, 'Floor name too long').optional(),
});

const wardUpdateSchema = z.object({
  name: z.string().min(1, 'Ward name is required').max(100, 'Ward name too long').optional(),
  type: z.nativeEnum(WardType, { message: 'Invalid ward type' }).optional(),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(1000, 'Capacity too high').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  floor: z.string().max(50, 'Floor name too long').optional(),
  isActive: z.boolean().optional(),
});

const wardSearchSchema = z.object({
  search: z.string().optional(),
  type: z.nativeEnum(WardType).optional(),
  isActive: z.string().transform(val => val === 'true' ? true : val === 'false' ? false : undefined).optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional(),
});

// Create new ward
export const createWard = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = wardCreateSchema.parse(req.body);

    // Check if ward name already exists
    const existingWard = await prisma.ward.findUnique({
      where: { name: validatedData.name },
    });

    if (existingWard) {
      return res.status(400).json({
        success: false,
        message: 'Ward with this name already exists',
      });
    }

    // Determine bed type based on ward type
    const getBedTypeForWard = (wardType: WardType): BedType => {
      const wardTypeToBedType: Record<WardType, BedType> = {
        'GENERAL': 'GENERAL',
        'ICU': 'ICU',
        'PRIVATE': 'PRIVATE',
        'EMERGENCY': 'GENERAL',
        'PEDIATRIC': 'GENERAL',
        'MATERNITY': 'GENERAL',
        'SURGICAL': 'GENERAL',
        'CARDIAC': 'ICU',
        'NEUROLOGY': 'GENERAL',
        'ORTHOPEDIC': 'GENERAL',
      };
      return wardTypeToBedType[wardType] || 'GENERAL';
    };

    const bedType = getBedTypeForWard(validatedData.type);

    // Create ward and beds in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create ward
      const newWard = await tx.ward.create({
        data: {
          name: validatedData.name,
          type: validatedData.type,
          capacity: validatedData.capacity,
          description: validatedData.description,
          floor: validatedData.floor,
          currentOccupancy: 0,
          isActive: true,
        },
      });

      // Automatically create beds equal to capacity
      const bedsToCreate = [];
      for (let i = 1; i <= validatedData.capacity; i++) {
        bedsToCreate.push({
          wardId: newWard.id,
          bedNumber: i.toString(),
          bedType: bedType,
          isOccupied: false,
          isActive: true,
        });
      }

      // Create all beds in batch
      if (bedsToCreate.length > 0) {
        await tx.bed.createMany({
          data: bedsToCreate,
        });
      }

      // Fetch the created ward with beds
      const wardWithBeds = await tx.ward.findUnique({
        where: { id: newWard.id },
        include: {
          beds: {
            select: {
              id: true,
              bedNumber: true,
              bedType: true,
              isOccupied: true,
              isActive: true,
            },
            orderBy: { bedNumber: 'asc' },
          },
        },
      });

      return wardWithBeds!;
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE_WARD',
        tableName: 'wards',
        recordId: result.id,
        newValue: {
          name: result.name,
          type: result.type,
          capacity: result.capacity,
          bedsCreated: result.beds.length,
        },
      },
    });

    console.log(`✅ Created ward "${result.name}" with ${result.beds.length} beds (capacity: ${result.capacity})`);

    res.status(201).json({
      success: true,
      message: `Ward created successfully with ${result.beds.length} beds`,
      data: { ward: result },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Create ward error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all wards with search and pagination
export const getWards = async (req: AuthRequest, res: Response) => {
  try {
    const { search, type, isActive, page = 1, limit = 20 } = wardSearchSchema.parse(req.query);
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { floor: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (type) {
      where.type = type;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Get wards with pagination
    const [wards, total] = await Promise.all([
      prisma.ward.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          beds: {
            select: {
              id: true,
              bedNumber: true,
              bedType: true,
              isOccupied: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              beds: true,
              admissions: {
                where: { status: 'ADMITTED' },
              },
            },
          },
        },
      }),
      prisma.ward.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        wards,
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
    
    console.error('Get wards error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get ward by ID
export const getWardById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const ward = await prisma.ward.findUnique({
      where: { id },
      include: {
        beds: {
          select: {
            id: true,
            bedNumber: true,
            bedType: true,
            isOccupied: true,
            isActive: true,
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
        _count: {
          select: {
            beds: true,
            admissions: {
              where: { status: 'ADMITTED' },
            },
          },
        },
      },
    });

    if (!ward) {
      return res.status(404).json({
        success: false,
        message: 'Ward not found',
      });
    }

    res.json({
      success: true,
      data: { ward },
    });
  } catch (error) {
    console.error('Get ward by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update ward
export const updateWard = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = wardUpdateSchema.parse(req.body);

    // Check if ward exists
    const existingWard = await prisma.ward.findUnique({
      where: { id },
    });

    if (!existingWard) {
      return res.status(404).json({
        success: false,
        message: 'Ward not found',
      });
    }

    // Check if name is being changed and if it already exists
    if (validatedData.name && validatedData.name !== existingWard.name) {
      const duplicateWard = await prisma.ward.findUnique({
        where: { name: validatedData.name },
      });

      if (duplicateWard) {
        return res.status(400).json({
          success: false,
          message: 'Ward with this name already exists',
        });
      }
    }

    // Determine bed type based on ward type (for new beds)
    const getBedTypeForWard = (wardType: WardType): BedType => {
      const wardTypeToBedType: Record<WardType, BedType> = {
        'GENERAL': 'GENERAL',
        'ICU': 'ICU',
        'PRIVATE': 'PRIVATE',
        'EMERGENCY': 'GENERAL',
        'PEDIATRIC': 'GENERAL',
        'MATERNITY': 'GENERAL',
        'SURGICAL': 'GENERAL',
        'CARDIAC': 'ICU',
        'NEUROLOGY': 'GENERAL',
        'ORTHOPEDIC': 'GENERAL',
      };
      return wardTypeToBedType[wardType] || 'GENERAL';
    };

    // Handle capacity changes - create or delete beds
    const newCapacity = validatedData.capacity !== undefined ? validatedData.capacity : existingWard.capacity;
    const currentBedCount = await prisma.bed.count({
      where: { wardId: id },
    });

    // Update ward and manage beds in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update ward
      const updatedWard = await tx.ward.update({
        where: { id },
        data: validatedData,
        include: {
          beds: {
            select: {
              id: true,
              bedNumber: true,
              bedType: true,
              isOccupied: true,
              isActive: true,
            },
            orderBy: { bedNumber: 'asc' },
          },
          _count: {
            select: {
              beds: true,
              admissions: {
                where: { status: 'ADMITTED' },
              },
            },
          },
        },
      });

      // If capacity increased, create additional beds
      if (newCapacity > currentBedCount) {
        const bedsToCreate = [];
        const bedType = getBedTypeForWard(updatedWard.type);
        
        for (let i = currentBedCount + 1; i <= newCapacity; i++) {
          bedsToCreate.push({
            wardId: id,
            bedNumber: i.toString(),
            bedType: bedType,
            isOccupied: false,
            isActive: true,
          });
        }

        if (bedsToCreate.length > 0) {
          await tx.bed.createMany({
            data: bedsToCreate,
          });
          console.log(`✅ Created ${bedsToCreate.length} additional beds for ward "${updatedWard.name}"`);
        }
      } 
      // If capacity decreased, delete excess beds (only if they're not occupied)
      else if (newCapacity < currentBedCount) {
        const bedsToDelete = await tx.bed.findMany({
          where: {
            wardId: id,
            isOccupied: false,
          },
          orderBy: { bedNumber: 'desc' },
          take: currentBedCount - newCapacity,
        });

        if (bedsToDelete.length > 0) {
          const bedIds = bedsToDelete.map(b => b.id);
          await tx.bed.deleteMany({
            where: {
              id: { in: bedIds },
              isOccupied: false, // Safety check - only delete unoccupied beds
            },
          });
          console.log(`✅ Deleted ${bedsToDelete.length} beds from ward "${updatedWard.name}"`);
        } else {
          console.warn(`⚠️ Cannot reduce capacity: all beds are occupied or have active admissions`);
        }
      }

      // Fetch updated ward with all beds
      return await tx.ward.findUnique({
        where: { id },
        include: {
          beds: {
            select: {
              id: true,
              bedNumber: true,
              bedType: true,
              isOccupied: true,
              isActive: true,
            },
            orderBy: { bedNumber: 'asc' },
          },
          _count: {
            select: {
              beds: true,
              admissions: {
                where: { status: 'ADMITTED' },
              },
            },
          },
        },
      });
    });

    const updatedWard = result!;

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE_WARD',
        tableName: 'wards',
        recordId: id,
        oldValue: {
          name: existingWard.name,
          type: existingWard.type,
          capacity: existingWard.capacity,
          isActive: existingWard.isActive,
        },
        newValue: {
          name: updatedWard.name,
          type: updatedWard.type,
          capacity: updatedWard.capacity,
          isActive: updatedWard.isActive,
        },
      },
    });

    res.json({
      success: true,
      message: 'Ward updated successfully',
      data: { ward: updatedWard },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Update ward error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Delete ward
export const deleteWard = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    // Check if ward exists
    const existingWard = await prisma.ward.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            beds: true,
            admissions: {
              where: { status: 'ADMITTED' },
            },
          },
        },
      },
    });

    if (!existingWard) {
      return res.status(404).json({
        success: false,
        message: 'Ward not found',
      });
    }

    // Check for related records
    const activeAdmissions = existingWard._count.admissions;
    const bedCount = existingWard._count.beds;

    // Check for ALL admissions (active and discharged) - needed for foreign key constraint
    const allAdmissions = await prisma.admission.count({
      where: { wardId: id },
    });

    // Check for occupied beds
    const occupiedBeds = await prisma.bed.count({
      where: {
        wardId: id,
        isOccupied: true,
      },
    });

    // Only prevent deletion if there are active admissions (not just beds, since beds are auto-created)
    // Allow deletion if only beds exist (they will be deleted automatically)
    if (activeAdmissions > 0 && force !== 'true') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete ward with ${activeAdmissions} active admission(s). Use force=true to delete all related records.`,
        data: {
          activeAdmissions,
          allAdmissions,
          occupiedBeds,
          totalBeds: bedCount,
        },
        canForceDelete: true,
      });
    }

    // Log info about what will be deleted
    if (allAdmissions > 0 || bedCount > 0) {
      console.log(`🗑️ Deleting ward "${existingWard.name}":`, {
        activeAdmissions: activeAdmissions > 0 ? activeAdmissions : 0,
        allAdmissions,
        totalBeds: bedCount,
        forceDelete: force === 'true',
      });
    }

    // Delete ward and all related records in a transaction
    await prisma.$transaction(async (tx) => {
      // First, delete ALL admissions for this ward (active and discharged)
      // This is required because Admission has a foreign key to Ward without cascade delete
      if (allAdmissions > 0) {
        // Delete all admissions (discharged or not) - required for foreign key constraint
        const deletedAdmissions = await tx.admission.deleteMany({
          where: { wardId: id },
        });
        console.log(`✅ Deleted ${deletedAdmissions.count} admissions (all statuses) from ward "${existingWard.name}"`);
      }

      // Then delete all beds (now that admissions are gone)
      // Beds have cascade delete, but we delete manually to ensure order
      if (bedCount > 0) {
        const deletedBeds = await tx.bed.deleteMany({
          where: { wardId: id },
        });
        console.log(`✅ Deleted ${deletedBeds.count} beds from ward "${existingWard.name}"`);
      }

      // Finally, delete the ward
      const deletedWard = await tx.ward.delete({
        where: { id },
      });
      
      console.log(`✅ Successfully deleted ward "${deletedWard.name}" (ID: ${id})`);
    });

    // Log the action
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'DELETE_WARD',
          tableName: 'wards',
          recordId: id,
          oldValue: {
            name: existingWard.name,
            type: existingWard.type,
            capacity: existingWard.capacity,
            bedsDeleted: bedCount,
            activeAdmissions: activeAdmissions,
          },
        },
      });
    } catch (auditError) {
      console.warn('Failed to create audit log for ward deletion:', auditError);
      // Don't fail the deletion if audit log creation fails
    }

    console.log(`✅ Ward deleted successfully: ${id} "${existingWard.name}"`);

    res.json({
      success: true,
      message: 'Ward deleted successfully',
    });
  } catch (error) {
    console.error('Delete ward error:', error);
    
    // Handle Prisma foreign key constraint errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2003') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete ward: it has related records that cannot be automatically removed',
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get ward statistics
export const getWardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalWards,
      wardsByType,
      activeWards,
      totalCapacity,
      totalOccupancy,
      availableBeds,
    ] = await Promise.all([
      prisma.ward.count(),
      prisma.ward.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
      prisma.ward.count({ where: { isActive: true } }),
      prisma.ward.aggregate({
        _sum: { capacity: true },
      }),
      prisma.ward.aggregate({
        _sum: { currentOccupancy: true },
      }),
      prisma.bed.count({
        where: {
          isOccupied: false,
          isActive: true,
        },
      }),
    ]);

    const occupancyRate = totalCapacity._sum.capacity 
      ? (totalOccupancy._sum.currentOccupancy! / totalCapacity._sum.capacity) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        totalWards,
        wardsByType,
        activeWards,
        totalCapacity: totalCapacity._sum.capacity || 0,
        totalOccupancy: totalOccupancy._sum.currentOccupancy || 0,
        availableBeds,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Get ward stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
