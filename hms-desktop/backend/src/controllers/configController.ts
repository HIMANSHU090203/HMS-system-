import { Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import logger, { loggerWithContext } from '../utils/logger';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const configLogger = loggerWithContext('ConfigController');

export const checkSetupStatus = async (_req: Request, res: Response) => {
  try {
    configLogger.debug('Checking setup status');
    const config = await prisma.hospitalConfig.findFirst();
    const userCount = await prisma.user.count();
    const status = { hasHospitalConfig: !!config, hasUsers: userCount > 0, userCount };
    configLogger.info('Setup status checked', status);
    res.json({ success: true, data: status });
  } catch (error: any) {
    configLogger.error('Check setup status error', error);
    res.status(500).json({ success: false, message: 'Failed to check setup status', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getHospitalConfig = async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.hospitalConfig.findFirst();
    if (!config) {
      return res.json({ success: true, data: { config: { hospitalName: 'HMS Hospital', currency: 'USD', taxRate: 0, appointmentSlotDuration: 30 } } });
    }
    res.json({ success: true, data: { config } });
  } catch (error: any) {
    configLogger.error('Get hospital config error', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hospital configuration' });
  }
};

export const updateHospitalConfig = async (req: Request, res: Response) => {
  try {
    const existingConfig = await prisma.hospitalConfig.findFirst();
    const config = existingConfig ? await prisma.hospitalConfig.update({ where: { id: existingConfig.id }, data: req.body }) : await prisma.hospitalConfig.create({ data: { hospitalName: req.body.hospitalName || 'HMS Hospital', hospitalCode: req.body.hospitalCode, address: req.body.address, city: req.body.city, state: req.body.state, postalCode: req.body.postalCode, country: req.body.country, phone: req.body.phone, email: req.body.email, emergencyContact: req.body.emergencyContact, hospitalLicenseNumber: req.body.hospitalLicenseNumber, taxId: req.body.taxId, logoUrl: req.body.logoUrl, timezone: req.body.timezone || 'UTC', defaultLanguage: req.body.defaultLanguage || 'en', currency: req.body.currency || 'USD', taxRate: req.body.taxRate, appointmentSlotDuration: req.body.appointmentSlotDuration || 30, defaultDoctorConsultationDuration: req.body.defaultDoctorConsultationDuration || 30, workingHours: req.body.workingHours, defaultPaymentTerms: req.body.defaultPaymentTerms, defaultPaymentMode: req.body.defaultPaymentMode, enableInsurance: req.body.enableInsurance ?? false, medicineMarkupPercentage: req.body.medicineMarkupPercentage ?? 0, modulesEnabled: req.body.modulesEnabled, labTestsEnabled: req.body.labTestsEnabled ?? true, ipdEnabled: req.body.ipdEnabled ?? true, billingEnabled: req.body.billingEnabled ?? true } });
    res.json({ success: true, data: { config } });
  } catch (error: any) {
    configLogger.error('Update hospital config error', error);
    res.status(500).json({ success: false, message: 'Failed to update hospital configuration' });
  }
};

export const getLabTestConfig = async (req: AuthRequest, res: Response) => {
  try {
    const configs = await prisma.labTestConfig.findMany({ orderBy: { testCategory: 'asc' } });
    res.json({ success: true, data: { configs } });
  } catch (error: any) {
    configLogger.error('Get lab test config error', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lab test configuration' });
  }
};

export const addLabTestConfig = async (req: AuthRequest, res: Response) => {
  try {
    const hospitalConfig = await prisma.hospitalConfig.findFirst();
    if (!hospitalConfig) return res.status(400).json({ success: false, message: 'Hospital configuration not found' });
    const config = await prisma.labTestConfig.create({ data: { hospitalId: hospitalConfig.id, testCategory: req.body.testCategory, categoryEnabled: req.body.categoryEnabled ?? true, defaultPrice: req.body.defaultPrice, notes: req.body.notes } });
    res.json({ success: true, data: { config } });
  } catch (error: any) {
    configLogger.error('Add lab test config error', error);
    res.status(500).json({ success: false, message: 'Failed to add lab test configuration' });
  }
};

export const updateLabTestConfig = async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.labTestConfig.update({ where: { id: req.params.id }, data: { testCategory: req.body.testCategory, categoryEnabled: req.body.categoryEnabled, defaultPrice: req.body.defaultPrice, notes: req.body.notes } });
    res.json({ success: true, data: { config } });
  } catch (error: any) {
    configLogger.error('Update lab test config error', error);
    res.status(500).json({ success: false, message: 'Failed to update lab test configuration' });
  }
};

export const getMedicineConfig = async (req: AuthRequest, res: Response) => {
  try {
    const configs = await prisma.medicineConfig.findMany({ orderBy: { category: 'asc' } });
    res.json({ success: true, data: { configs } });
  } catch (error: any) {
    configLogger.error('Get medicine config error', error);
    res.status(500).json({ success: false, message: 'Failed to fetch medicine configuration' });
  }
};

export const addMedicineConfig = async (req: AuthRequest, res: Response) => {
  try {
    const hospitalConfig = await prisma.hospitalConfig.findFirst();
    if (!hospitalConfig) return res.status(400).json({ success: false, message: 'Hospital configuration not found' });
    const config = await prisma.medicineConfig.create({ data: { hospitalId: hospitalConfig.id, category: req.body.category, categoryEnabled: req.body.categoryEnabled ?? true, defaultLowStockThreshold: req.body.defaultLowStockThreshold ?? 10, enableAutoOrder: req.body.enableAutoOrder ?? false, autoOrderThreshold: req.body.autoOrderThreshold, notes: req.body.notes } });
    res.json({ success: true, data: { config } });
  } catch (error: any) {
    configLogger.error('Add medicine config error', error);
    res.status(500).json({ success: false, message: 'Failed to add medicine configuration' });
  }
};

export const updateMedicineConfig = async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.medicineConfig.update({ where: { id: req.params.id }, data: { category: req.body.category, categoryEnabled: req.body.categoryEnabled, defaultLowStockThreshold: req.body.defaultLowStockThreshold, enableAutoOrder: req.body.enableAutoOrder, autoOrderThreshold: req.body.autoOrderThreshold, notes: req.body.notes } });
    res.json({ success: true, data: { config } });
  } catch (error: any) {
    configLogger.error('Update medicine config error', error);
    res.status(500).json({ success: false, message: 'Failed to update medicine configuration' });
  }
};

// Upload hospital logo
export const uploadHospitalLogo = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    // Convert to URL path (relative to uploads directory)
    const logoUrl = `/api/uploads/logos/${path.basename(filePath)}`;

    // Get existing config
    const existingConfig = await prisma.hospitalConfig.findFirst();
    
    // Delete old logo file if it exists
    if (existingConfig?.logoUrl) {
      try {
        const oldLogoPath = existingConfig.logoUrl.replace('/api/uploads/', 'uploads/');
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      } catch (err) {
        configLogger.warn('Failed to delete old logo file', { error: err });
      }
    }

    // Update or create config with new logo URL
    const config = existingConfig
      ? await prisma.hospitalConfig.update({
          where: { id: existingConfig.id },
          data: { logoUrl }
        })
      : await prisma.hospitalConfig.create({
          data: {
            hospitalName: 'HMS Hospital',
            logoUrl
          }
        });

    configLogger.info('Hospital logo uploaded successfully', { logoUrl });
    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { config, logoUrl }
    });
  } catch (error: any) {
    configLogger.error('Upload hospital logo error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
