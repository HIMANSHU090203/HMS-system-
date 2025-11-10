import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { FileParserService } from '../services/fileParserService';
import fs from 'fs';

const prisma = new PrismaClient();

// Validation schemas
const medicineCreateSchema = z.object({
  name: z.string().min(1, 'Medicine name is required').max(200, 'Medicine name too long'),
  genericName: z.string().max(200, 'Generic name too long').optional(),
  manufacturer: z.string().max(200, 'Manufacturer name too long').optional(),
  category: z.string().max(100, 'Category too long').optional(),
  therapeuticClass: z.string().max(200, 'Therapeutic class too long').optional(),
  atcCode: z.string().max(50, 'ATC code too long').optional(),
  code: z.string().max(100, 'Code too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  dosageForm: z.string().max(100, 'Dosage form too long').optional(),
  strength: z.string().max(100, 'Strength too long').optional(),
  unit: z.string().max(50, 'Unit too long').optional(),
  expiryDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  supplier: z.string().max(200, 'Supplier name too long').optional(),
  batchNumber: z.string().max(100, 'Batch number too long').optional(),
  storageConditions: z.string().max(500, 'Storage conditions too long').optional(),
  prescriptionRequired: z.boolean().optional(),
  quantity: z.union([z.number().int().min(0), z.string()]).transform(val => typeof val === 'string' ? parseInt(val) || 0 : val).pipe(z.number().int().min(0, 'Quantity must be non-negative')),
  price: z.union([z.number().positive(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val).pipe(z.number().positive('Price must be positive')),
  lowStockThreshold: z.union([z.number().int().min(0), z.string()]).transform(val => typeof val === 'string' ? parseInt(val) || 10 : val).pipe(z.number().int().min(0, 'Low stock threshold must be non-negative')).optional(),
});

const medicineUpdateSchema = z.object({
  name: z.string().min(1, 'Medicine name is required').max(200, 'Medicine name too long').optional(),
  genericName: z.string().max(200, 'Generic name too long').optional(),
  manufacturer: z.string().max(200, 'Manufacturer name too long').optional(),
  category: z.string().max(100, 'Category too long').optional(),
  therapeuticClass: z.string().max(200, 'Therapeutic class too long').optional(),
  atcCode: z.string().max(50, 'ATC code too long').optional(),
  code: z.string().max(100, 'Code too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  dosageForm: z.string().max(100, 'Dosage form too long').optional(),
  strength: z.string().max(100, 'Strength too long').optional(),
  unit: z.string().max(50, 'Unit too long').optional(),
  expiryDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  supplier: z.string().max(200, 'Supplier name too long').optional(),
  batchNumber: z.string().max(100, 'Batch number too long').optional(),
  storageConditions: z.string().max(500, 'Storage conditions too long').optional(),
  prescriptionRequired: z.boolean().optional(),
  quantity: z.union([z.number().int().min(0), z.string()]).transform(val => typeof val === 'string' ? parseInt(val) || 0 : val).pipe(z.number().int().min(0, 'Quantity must be non-negative')).optional(),
  price: z.union([z.number().positive(), z.string()]).transform(val => typeof val === 'string' ? parseFloat(val) || 0 : val).pipe(z.number().positive('Price must be positive')).optional(),
  lowStockThreshold: z.union([z.number().int().min(0), z.string()]).transform(val => typeof val === 'string' ? parseInt(val) || 10 : val).pipe(z.number().int().min(0, 'Low stock threshold must be non-negative')).optional(),
});

const medicineSearchSchema = z.object({
  search: z.string().optional(),
  lowStock: z.string().transform(val => val === 'true').optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional(),
});

const stockUpdateSchema = z.object({
  quantity: z.number().int(),
  operation: z.enum(['add', 'subtract', 'set']),
  reason: z.string().optional(),
});

// Create new medicine
export const createMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = medicineCreateSchema.parse(req.body);

    // Generate unique code for medicine
    const code = `MED${Date.now().toString().slice(-8)}`;
    
    // Check if medicine already exists
    const existingMedicine = await prisma.medicineCatalog.findFirst({
      where: { 
        OR: [
          { name: validatedData.name },
          { code: code }
        ]
      },
    });

    if (existingMedicine) {
      return res.status(400).json({
        success: false,
        message: 'Medicine with this name already exists',
      });
    }

    // Create medicine in MedicineCatalog
    const medicine = await prisma.medicineCatalog.create({
      data: {
        code: validatedData.code || code,
        name: validatedData.name,
        genericName: validatedData.genericName || validatedData.name, // Use provided generic name or fallback to name
        manufacturer: validatedData.manufacturer || null,
        category: validatedData.category || 'General',
        therapeuticClass: validatedData.therapeuticClass || null,
        atcCode: validatedData.atcCode || null,
        price: validatedData.price,
        stockQuantity: validatedData.quantity || 0,
        lowStockThreshold: validatedData.lowStockThreshold || 10,
        expiryDate: validatedData.expiryDate || null,
        isActive: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE_MEDICINE',
        tableName: 'medicines',
        recordId: medicine.id,
        newValue: medicine,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      data: { medicine },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Create medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get all medicines with search and pagination
export const getMedicines = async (req: AuthRequest, res: Response) => {
  try {
    const { search, lowStock, page = 1, limit = 20 } = medicineSearchSchema.parse(req.query);
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {
      isActive: true, // Only get active medicines
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Get all medicines first (needed for lowStock filtering)
    let medicines = await prisma.medicineCatalog.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Apply lowStock filter in memory if requested
    // Prisma doesn't support comparing two fields directly in where clause
    if (lowStock) {
      medicines = medicines.filter(
        medicine => medicine.stockQuantity <= medicine.lowStockThreshold
      );
    }

    // Get total count after filtering
    const total = medicines.length;
    
    // Apply pagination
    const paginatedMedicines = medicines.slice(skip, skip + limit);

    // Get hospital config for markup percentage
    const hospitalConfig = await prisma.hospitalConfig.findFirst();
    const markupPercentage = hospitalConfig?.medicineMarkupPercentage ? Number(hospitalConfig.medicineMarkupPercentage) : 0;
    
    // Add stock status and apply markup to prices
    const medicinesWithStatus = paginatedMedicines.map(medicine => {
      const basePrice = Number(medicine.price);
      const sellingPrice = markupPercentage > 0 
        ? basePrice * (1 + markupPercentage / 100)
        : basePrice;
      
      return {
        ...medicine,
        price: basePrice, // Keep base price
        sellingPrice: sellingPrice, // Add selling price with markup
        stockStatus: medicine.stockQuantity <= medicine.lowStockThreshold ? 'LOW' : 'OK',
      };
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        medicines: medicinesWithStatus,
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
      console.error('Validation error:', error.issues);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Get medicines error:', error);
    console.error('Error details:', error?.message, error?.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error?.message || 'Unknown error',
    });
  }
};

// Get medicine by ID
export const getMedicineById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const medicine = await prisma.medicineCatalog.findUnique({
      where: { id },
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    // Get hospital config for markup percentage
    const hospitalConfig = await prisma.hospitalConfig.findFirst();
    const markupPercentage = hospitalConfig?.medicineMarkupPercentage ? Number(hospitalConfig.medicineMarkupPercentage) : 0;
    
    const basePrice = Number(medicine.price);
    const sellingPrice = markupPercentage > 0 
      ? basePrice * (1 + markupPercentage / 100)
      : basePrice;
    
    // Add stock status and apply markup to price
    const medicineWithStatus = {
      ...medicine,
      price: basePrice, // Keep base price
      sellingPrice: sellingPrice, // Add selling price with markup
      stockStatus: medicine.stockQuantity <= medicine.lowStockThreshold ? 'LOW' : 'OK',
    };

    res.json({
      success: true,
      data: { medicine: medicineWithStatus },
    });
  } catch (error) {
    console.error('Get medicine by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update medicine
export const updateMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = medicineUpdateSchema.parse(req.body);

    // Check if medicine exists
    const existingMedicine = await prisma.medicineCatalog.findUnique({
      where: { id },
    });

    if (!existingMedicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    // Check for duplicate name if name is being updated
    if (validatedData.name && validatedData.name !== existingMedicine.name) {
      const duplicateMedicine = await prisma.medicineCatalog.findFirst({
        where: { 
          name: validatedData.name,
          id: { not: id }
        },
      });

      if (duplicateMedicine) {
        return res.status(400).json({
          success: false,
          message: 'Medicine with this name already exists',
        });
      }
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.genericName !== undefined) updateData.genericName = validatedData.genericName;
    if (validatedData.manufacturer !== undefined) updateData.manufacturer = validatedData.manufacturer;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.therapeuticClass !== undefined) updateData.therapeuticClass = validatedData.therapeuticClass;
    if (validatedData.atcCode !== undefined) updateData.atcCode = validatedData.atcCode;
    if (validatedData.code !== undefined) updateData.code = validatedData.code;
    if (validatedData.price !== undefined) updateData.price = validatedData.price;
    if (validatedData.quantity !== undefined) updateData.stockQuantity = validatedData.quantity;
    if (validatedData.lowStockThreshold !== undefined) updateData.lowStockThreshold = validatedData.lowStockThreshold;
    if (validatedData.expiryDate !== undefined) updateData.expiryDate = validatedData.expiryDate;

    // Update medicine
    const updatedMedicine = await prisma.medicineCatalog.update({
      where: { id },
      data: updateData,
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE_MEDICINE',
        tableName: 'medicines',
        recordId: id,
        oldValue: existingMedicine,
        newValue: updatedMedicine,
      },
    });

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: { medicine: updatedMedicine },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Update medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update medicine stock
export const updateMedicineStock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = stockUpdateSchema.parse(req.body);

    // Check if medicine exists
    const existingMedicine = await prisma.medicineCatalog.findUnique({
      where: { id },
    });

    if (!existingMedicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    let newQuantity: number;
    const { quantity, operation, reason } = validatedData;

    switch (operation) {
      case 'add':
        newQuantity = existingMedicine.stockQuantity + quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, existingMedicine.stockQuantity - quantity);
        break;
      case 'set':
        newQuantity = Math.max(0, quantity);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation',
        });
    }

    // Update medicine quantity
    const updatedMedicine = await prisma.medicineCatalog.update({
      where: { id },
      data: { stockQuantity: newQuantity },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE_MEDICINE_STOCK',
        tableName: 'medicine_catalog',
        recordId: id,
        oldValue: { stockQuantity: existingMedicine.stockQuantity },
        newValue: { stockQuantity: newQuantity, operation, reason },
      },
    });

    res.json({
      success: true,
      message: 'Medicine stock updated successfully',
      data: { 
        medicine: updatedMedicine,
        operation: {
          type: operation,
          quantity: quantity,
          reason: reason,
          oldQuantity: existingMedicine.stockQuantity,
          newQuantity: newQuantity,
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
    
    console.error('Update medicine stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Delete medicine
export const deleteMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if medicine exists
    const existingMedicine = await prisma.medicineCatalog.findUnique({
      where: { id },
    });

    if (!existingMedicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    // Check if medicine has transactions
    const transactions = await prisma.medicineTransaction.count({
      where: { medicineId: id },
    });

    if (transactions > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete medicine with existing transactions',
        data: { transactions },
      });
    }

    // Delete medicine (soft delete by setting isActive to false)
    await prisma.medicineCatalog.update({
      where: { id },
      data: { isActive: false },
    });

    // Log the action (with error handling to prevent deletion failure)
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'DELETE_MEDICINE',
          tableName: 'medicines',
          recordId: id,
          oldValue: existingMedicine,
        },
      });
    } catch (auditError) {
      console.warn('Failed to create audit log for medicine deletion:', auditError);
      // Don't fail the deletion if audit log creation fails
    }

    res.json({
      success: true,
      message: 'Medicine deleted successfully',
    });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get medicine statistics
export const getMedicineStats = async (req: AuthRequest, res: Response) => {
  try {
    // Get all medicines to calculate low stock and total value
    const allMedicines = await prisma.medicineCatalog.findMany({
      where: { isActive: true },
      select: { stockQuantity: true, price: true, lowStockThreshold: true },
    });

    const [
      totalMedicines,
      recentTransactions,
      totalQuantity,
    ] = await Promise.all([
      prisma.medicineCatalog.count({ where: { isActive: true } }),
      prisma.medicineTransaction.count({
        where: {
          dispensedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.medicineCatalog.aggregate({
        where: { isActive: true },
        _sum: { stockQuantity: true },
      }),
    ]);

    // Calculate low stock medicines
    const lowStockMedicines = allMedicines.filter(
      medicine => medicine.stockQuantity <= medicine.lowStockThreshold
    ).length;

    // Calculate total inventory value
    const totalInventoryValue = allMedicines.reduce((total, medicine) => {
      return total + (medicine.stockQuantity * Number(medicine.price));
    }, 0);

    res.json({
      success: true,
      data: {
        totalMedicines,
        lowStockMedicines,
        totalInventoryValue,
        recentTransactions,
        totalQuantity: totalQuantity._sum.stockQuantity || 0,
      },
    });
  } catch (error) {
    console.error('Get medicine stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get low stock medicines
export const getLowStockMedicines = async (req: AuthRequest, res: Response) => {
  try {
    // Get all medicines and filter for low stock
    const allMedicines = await prisma.medicineCatalog.findMany({
      where: { isActive: true },
      orderBy: { stockQuantity: 'asc' },
    });

    const lowStockMedicines = allMedicines.filter(
      medicine => medicine.stockQuantity <= medicine.lowStockThreshold
    );

    // Add stock status
    const medicinesWithStatus = lowStockMedicines.map(medicine => ({
      ...medicine,
      stockStatus: 'LOW' as const,
    }));

    res.json({
      success: true,
      data: { medicines: medicinesWithStatus },
    });
  } catch (error) {
    console.error('Get low stock medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get medicine transactions
export const getMedicineTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { medicineId, page = 1, limit = 20 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    if (medicineId) {
      where.medicineId = medicineId as string;
    }

    const [transactions, total] = await Promise.all([
      prisma.medicineTransaction.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { dispensedAt: 'desc' },
        include: {
          medicine: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          prescription: {
            select: {
              id: true,
              patient: {
                select: { name: true },
              },
              doctor: {
                select: { fullName: true },
              },
            },
          },
          dispensedByUser: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
        },
      }),
      prisma.medicineTransaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        transactions,
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
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// New validation schemas for enhanced functionality
const orderCreateSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  orderItems: z.array(z.object({
    medicineId: z.string().min(1, 'Medicine ID is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
  })).min(1, 'At least one order item is required'),
  expectedDelivery: z.string().optional(),
  notes: z.string().optional(),
});

const orderStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  actualDelivery: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoiceFile: z.string().optional(),
});

// Import medicine catalog from file
export const importMedicineCatalog = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    // Parse the file
    const parsedMedicines = await FileParserService.parseFile(filePath, fileType);
    
    // Validate and save medicines
    const savedMedicines = [];
    const errors = [];

    for (const medicineData of parsedMedicines) {
      try {
        // Validate required fields
        if (!medicineData.name || medicineData.name.trim().length === 0) {
          errors.push(`Skipped row: Missing medicine name`);
          continue;
        }

        // Check if medicine already exists (by name)
        const existingMedicine = await prisma.medicineCatalog.findFirst({
          where: { 
            name: { 
              equals: medicineData.name.trim(), 
              mode: 'insensitive' 
            } 
          }
        });

        let savedMedicine;
        
        if (existingMedicine) {
          // Update existing medicine - update inventory and other fields
          savedMedicine = await prisma.medicineCatalog.update({
            where: { id: existingMedicine.id },
            data: {
              genericName: medicineData.genericName || existingMedicine.genericName,
              manufacturer: medicineData.manufacturer || existingMedicine.manufacturer,
              category: medicineData.category || existingMedicine.category,
              atcCode: medicineData.atcCode || existingMedicine.atcCode,
              price: medicineData.price > 0 ? medicineData.price : existingMedicine.price,
              stockQuantity: existingMedicine.stockQuantity + (medicineData.stockQuantity || 0), // Add to existing stock
              lowStockThreshold: medicineData.lowStockThreshold || existingMedicine.lowStockThreshold,
              expiryDate: medicineData.expiryDate || existingMedicine.expiryDate
            }
          });

          savedMedicines.push(savedMedicine);
          
          // Note: Stock quantity is updated directly above
          // Transaction logs are typically for prescription dispensing, not bulk imports
        } else {
          // Create new medicine
          const code = `MED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          savedMedicine = await prisma.medicineCatalog.create({
            data: {
              code: code,
              name: medicineData.name.trim(),
              genericName: medicineData.genericName,
              manufacturer: medicineData.manufacturer,
              category: medicineData.category || 'General',
              therapeuticClass: medicineData.therapeuticClass,
              atcCode: medicineData.atcCode,
              price: medicineData.price || 0,
              stockQuantity: medicineData.stockQuantity || 0,
              lowStockThreshold: medicineData.lowStockThreshold || 10,
              expiryDate: medicineData.expiryDate,
              isActive: true
            }
          });

          savedMedicines.push(savedMedicine);
          
          // Note: Initial stock quantity is set directly above
          // Transaction logs are typically for prescription dispensing, not bulk imports
        }

        // Create low stock alert if needed
        if (medicineData.stockQuantity <= medicineData.lowStockThreshold) {
          await prisma.lowStockAlert.create({
            data: {
              medicineId: savedMedicine.id,
              threshold: medicineData.lowStockThreshold,
              currentStock: medicineData.stockQuantity
            }
          });
        }
      } catch (error) {
        errors.push(`Error saving "${medicineData.name}": ${error.message}`);
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'IMPORT_MEDICINE_CATALOG',
        tableName: 'medicine_catalog',
        recordId: 'bulk_import',
        newValue: { importedCount: savedMedicines.length, errors }
      }
    });

    res.json({
      success: true,
      message: `Successfully imported ${savedMedicines.length} medicines`,
      data: {
        imported: savedMedicines,
        errors: errors
      }
    });
  } catch (error) {
    console.error('Import medicine catalog error:', error);
    res.status(500).json({
      success: false,
      message: 'Error importing medicine catalog'
    });
  }
};

// Create medicine order
export const createMedicineOrder = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = orderCreateSchema.parse(req.body);
    const { supplierId, orderItems, expectedDelivery, notes } = validatedData;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Calculate totals
    let totalAmount = 0;
    const processedItems = [];

    for (const item of orderItems) {
      const medicine = await prisma.medicineCatalog.findUnique({
        where: { id: item.medicineId }
      });

      if (!medicine) {
        return res.status(400).json({
          success: false,
          message: `Medicine with ID ${item.medicineId} not found`
        });
      }

      const itemTotal = item.quantity * item.unitPrice;
      totalAmount += itemTotal;

      processedItems.push({
        medicineId: item.medicineId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: itemTotal
      });
    }

    // Create order
    const order = await prisma.medicineOrder.create({
      data: {
        orderNumber,
        supplierId,
        orderDate: new Date(),
        expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
        totalAmount,
        notes,
        createdBy: req.user!.id,
        orderItems: {
          create: processedItems
        }
      },
      include: {
        supplier: true,
        orderItems: {
          include: {
            medicine: true
          }
        }
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE_MEDICINE_ORDER',
        tableName: 'medicine_orders',
        recordId: order.id,
        newValue: order
      }
    });

    res.status(201).json({
      success: true,
      message: 'Medicine order created successfully',
      data: { order }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Create medicine order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating medicine order'
    });
  }
};

// Get medicine orders
export const getMedicineOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status, supplierId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;

    const orders = await prisma.medicineOrder.findMany({
      where,
      include: {
        supplier: true,
        orderItems: {
          include: {
            medicine: true
          }
        },
        createdByUser: {
          select: { id: true, fullName: true }
        }
      },
      orderBy: { orderDate: 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await prisma.medicineOrder.count({ where });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get medicine orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medicine orders'
    });
  }
};

// Update order status
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = orderStatusUpdateSchema.parse(req.body);
    const { status, actualDelivery, invoiceNumber, invoiceFile } = validatedData;

    const order = await prisma.medicineOrder.update({
      where: { id },
      data: {
        status,
        actualDelivery: actualDelivery ? new Date(actualDelivery) : null,
        invoiceNumber,
        invoiceFile
      },
      include: {
        supplier: true,
        orderItems: {
          include: {
            medicine: true
          }
        }
      }
    });

    // If order is delivered, update stock
    if (status === 'DELIVERED') {
      for (const item of order.orderItems) {
        await prisma.medicineCatalog.update({
          where: { id: item.medicineId },
          data: {
            stockQuantity: {
              increment: item.receivedQty || item.quantity
            }
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
};

// Upload invoice file
export const uploadInvoiceFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { orderId } = req.params;
    const filePath = req.file.path;

    const order = await prisma.medicineOrder.update({
      where: { id: orderId },
      data: {
        invoiceFile: filePath
      }
    });

    res.json({
      success: true,
      message: 'Invoice file uploaded successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Upload invoice file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading invoice file'
    });
  }
};

// Get suppliers
export const getSuppliers = async (req: AuthRequest, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: { suppliers }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suppliers'
    });
  }
};

// Create supplier
export const createSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const { name, address, contact, email, gstNumber } = req.body;

    const supplier = await prisma.supplier.create({
      data: {
        name,
        address,
        contact,
        email,
        gstNumber
      }
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: { supplier }
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating supplier'
    });
  }
};

// Get medicine order by ID (for invoice generation)
export const getMedicineOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.medicineOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        orderItems: {
          include: {
            medicine: {
              select: {
                name: true,
                manufacturer: true
              }
            }
          }
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Medicine order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get medicine order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medicine order'
    });
  }
};
