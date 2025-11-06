import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// ========== ALLERGY CATALOG ==========

export const getAllAllergies = async (req: AuthRequest, res: Response) => {
  try {
    const allergies = await prisma.allergyCatalog.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: { allergies } });
  } catch (error: any) {
    console.error('Get allergies error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch allergies' });
  }
};

export const addAllergy = async (req: AuthRequest, res: Response) => {
  try {
    const { code, name, category, severity } = req.body;

    const allergy = await prisma.allergyCatalog.create({
      data: { code, name, category, severity, isActive: true },
    });

    res.json({ success: true, data: { allergy } });
  } catch (error: any) {
    console.error('Add allergy error:', error);
    res.status(500).json({ success: false, message: 'Failed to add allergy' });
  }
};

// ========== CHRONIC CONDITION CATALOG ==========

export const getAllChronicConditions = async (req: AuthRequest, res: Response) => {
  try {
    const conditions = await prisma.chronicConditionCatalog.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: { conditions } });
  } catch (error: any) {
    console.error('Get chronic conditions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chronic conditions' });
  }
};

export const addChronicCondition = async (req: AuthRequest, res: Response) => {
  try {
    const { code, name, category } = req.body;

    const condition = await prisma.chronicConditionCatalog.create({
      data: { code, name, category, isActive: true },
    });

    res.json({ success: true, data: { condition } });
  } catch (error: any) {
    console.error('Add chronic condition error:', error);
    res.status(500).json({ success: false, message: 'Failed to add chronic condition' });
  }
};

// ========== DIAGNOSIS CATALOG ==========

export const getAllDiagnoses = async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.query;
    
    const where = category ? { category: category as string, isActive: true } : { isActive: true };
    
    const diagnoses = await prisma.diagnosisCatalog.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: { diagnoses } });
  } catch (error: any) {
    console.error('Get diagnoses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch diagnoses' });
  }
};

export const addDiagnosis = async (req: AuthRequest, res: Response) => {
  try {
    const { icdCode, name, category } = req.body;

    const diagnosis = await prisma.diagnosisCatalog.create({
      data: { icdCode, name, category, isActive: true },
    });

    res.json({ success: true, data: { diagnosis } });
  } catch (error: any) {
    console.error('Add diagnosis error:', error);
    res.status(500).json({ success: false, message: 'Failed to add diagnosis' });
  }
};

// ========== MEDICINE CATALOG ==========

export const getAllMedicines = async (req: AuthRequest, res: Response) => {
  try {
    const { category, lowStock } = req.query;
    
    const where: any = {};
    if (category) where.category = category;
    if (lowStock === 'true') {
      where.stockQuantity = { lte: prisma.medicineCatalog.fields.lowStockThreshold };
    }
    
    const medicines = await prisma.medicineCatalog.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: { medicines } });
  } catch (error: any) {
    console.error('Get medicines error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch medicines' });
  }
};

export const addMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { code, name, genericName, manufacturer, category, therapeuticClass, atcCode, price, stockQuantity, lowStockThreshold } = req.body;

    const medicine = await prisma.medicineCatalog.create({
      data: { 
        code, 
        name, 
        genericName, 
        manufacturer, 
        category, 
        therapeuticClass, 
        atcCode, 
        price, 
        stockQuantity: stockQuantity || 0, 
        lowStockThreshold: lowStockThreshold || 10,
        isActive: true 
      },
    });

    res.json({ success: true, data: { medicine } });
  } catch (error: any) {
    console.error('Add medicine error:', error);
    res.status(500).json({ success: false, message: 'Failed to add medicine' });
  }
};

export const updateMedicineStock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { stockQuantity } = req.body;

    const medicine = await prisma.medicineCatalog.update({
      where: { id },
      data: { stockQuantity },
    });

    res.json({ success: true, data: { medicine } });
  } catch (error: any) {
    console.error('Update medicine stock error:', error);
    res.status(500).json({ success: false, message: 'Failed to update medicine stock' });
  }
};

// ========== PATIENT ALLERGIES ==========

export const getPatientAllergies = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;

    const allergies = await prisma.patientAllergy.findMany({
      where: { patientId },
      include: { allergy: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: { allergies } });
  } catch (error: any) {
    console.error('Get patient allergies error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch patient allergies' });
  }
};

export const addPatientAllergy = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const { allergyId, severity, onsetDate, notes } = req.body;

    const allergy = await prisma.patientAllergy.create({
      data: { 
        patientId, 
        allergyId, 
        severity: severity || 'Unknown',
        onsetDate: onsetDate ? new Date(onsetDate) : null,
        notes 
      },
      include: { allergy: true },
    });

    res.json({ success: true, data: { allergy } });
  } catch (error: any) {
    console.error('Add patient allergy error:', error);
    res.status(500).json({ success: false, message: 'Failed to add patient allergy' });
  }
};

export const deletePatientAllergy = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.patientAllergy.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Allergy removed successfully' });
  } catch (error: any) {
    console.error('Delete patient allergy error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove allergy' });
  }
};

// ========== PATIENT CHRONIC CONDITIONS ==========

export const getPatientChronicConditions = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;

    const conditions = await prisma.patientChronicCondition.findMany({
      where: { patientId },
      include: { condition: true },
      orderBy: { diagnosisDate: 'desc' },
    });

    res.json({ success: true, data: { conditions } });
  } catch (error: any) {
    console.error('Get patient chronic conditions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch patient chronic conditions' });
  }
};

export const addPatientChronicCondition = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const { conditionId, diagnosisDate, currentStatus, notes } = req.body;

    const condition = await prisma.patientChronicCondition.create({
      data: { 
        patientId, 
        conditionId,
        diagnosisDate: new Date(diagnosisDate),
        currentStatus: currentStatus || 'Active',
        notes 
      },
      include: { condition: true },
    });

    res.json({ success: true, data: { condition } });
  } catch (error: any) {
    console.error('Add patient chronic condition error:', error);
    res.status(500).json({ success: false, message: 'Failed to add chronic condition' });
  }
};

export const deletePatientChronicCondition = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.patientChronicCondition.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Chronic condition removed successfully' });
  } catch (error: any) {
    console.error('Delete patient chronic condition error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove chronic condition' });
  }
};

