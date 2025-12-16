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
    
    // Convert binary logoData to data URL if it exists
    let logoUrl = config.logoUrl || null;
    if (config.logoData && config.logoMimeType) {
      // Convert binary buffer to base64 and create data URL
      const base64 = Buffer.from(config.logoData).toString('base64');
      logoUrl = `data:${config.logoMimeType};base64,${base64}`;
    }
    
    // Return config with logoUrl (data URL format) for frontend
    // Don't send binary data directly - convert to data URL
    // Ensure displayCurrency is explicitly included (Prisma might not return it if null)
    const configWithLogo = {
      ...config,
      logoData: undefined, // Don't send binary data in response
      logoUrl: logoUrl,
      displayCurrency: config.displayCurrency || null // Explicitly include displayCurrency
    };
    
    configLogger.debug('Returning hospital config', {
      currency: config.currency,
      displayCurrency: config.displayCurrency,
      hasDisplayCurrency: !!config.displayCurrency
    });
    
    res.json({ success: true, data: { config: configWithLogo } });
  } catch (error: any) {
    configLogger.error('Get hospital config error', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hospital configuration' });
  }
};

export const updateHospitalConfig = async (req: Request, res: Response) => {
  try {
    const existingConfig = await prisma.hospitalConfig.findFirst();
    
    // Prepare update data
    const updateData: any = {
      hospitalName: req.body.hospitalName || 'HMS Hospital',
      hospitalCode: req.body.hospitalCode,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      country: req.body.country,
      phone: req.body.phone,
      email: req.body.email,
      emergencyContact: req.body.emergencyContact,
      hospitalLicenseNumber: req.body.hospitalLicenseNumber,
      taxId: req.body.taxId,
      timezone: req.body.timezone || 'UTC',
      defaultLanguage: req.body.defaultLanguage || 'en',
      currency: req.body.currency || 'USD',
      displayCurrency: req.body.displayCurrency !== undefined && req.body.displayCurrency !== null 
        ? req.body.displayCurrency 
        : (req.body.currency || 'USD'),
      taxRate: req.body.taxRate,
      appointmentSlotDuration: req.body.appointmentSlotDuration || 30,
      defaultDoctorConsultationDuration: req.body.defaultDoctorConsultationDuration || 30,
      workingHours: req.body.workingHours,
      defaultPaymentTerms: req.body.defaultPaymentTerms,
      defaultPaymentMode: req.body.defaultPaymentMode,
      enableInsurance: req.body.enableInsurance ?? false,
      medicineMarkupPercentage: req.body.medicineMarkupPercentage ?? 0,
      defaultConsultationFee: req.body.defaultConsultationFee,
      modulesEnabled: req.body.modulesEnabled,
      labTestsEnabled: req.body.labTestsEnabled ?? true,
      ipdEnabled: req.body.ipdEnabled ?? true,
      billingEnabled: req.body.billingEnabled ?? true
    };
    
    // Handle logo: if logoUrl is a data URL, convert to binary and store in logoData
    if (req.body.logoUrl) {
      if (req.body.logoUrl.startsWith('data:')) {
        // It's a data URL - extract base64 and mime type, convert to binary
        const dataUrlMatch = req.body.logoUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (dataUrlMatch) {
          const mimeType = dataUrlMatch[1];
          const base64Data = dataUrlMatch[2];
          // Convert base64 to binary buffer
          const binaryBuffer = Buffer.from(base64Data, 'base64');
          updateData.logoData = binaryBuffer;
          updateData.logoMimeType = mimeType;
          updateData.logoUrl = req.body.logoUrl; // Keep for backward compatibility
        } else {
          updateData.logoUrl = req.body.logoUrl;
        }
      } else {
        // It's a file path URL - keep as logoUrl only
        updateData.logoUrl = req.body.logoUrl;
      }
    }
    
    // Log what we're about to save
    configLogger.debug('Updating hospital config', {
      currency: updateData.currency,
      displayCurrency: updateData.displayCurrency,
      hasDisplayCurrency: updateData.displayCurrency !== undefined && updateData.displayCurrency !== null,
      displayCurrencyValue: updateData.displayCurrency,
      requestBodyDisplayCurrency: req.body.displayCurrency
    });
    
    const config = existingConfig 
      ? await prisma.hospitalConfig.update({ 
          where: { id: existingConfig.id }, 
          data: updateData 
        })
      : await prisma.hospitalConfig.create({ data: updateData });
    
    // Log what was actually saved
    configLogger.debug('Hospital config saved', {
      currency: config.currency,
      displayCurrency: config.displayCurrency,
      hasDisplayCurrency: config.displayCurrency !== undefined && config.displayCurrency !== null,
      displayCurrencyValue: config.displayCurrency
    });
    
    // Convert binary logoData to data URL if it exists (for response)
    let responseLogoUrl = config.logoUrl || null;
    if (config.logoData && config.logoMimeType) {
      // Convert binary buffer to base64 and create data URL
      const base64 = Buffer.from(config.logoData).toString('base64');
      responseLogoUrl = `data:${config.logoMimeType};base64,${base64}`;
    }
    
    // Return config with logoUrl set from logoData if available (as data URL string)
    const configWithLogo = {
      ...config,
      logoData: undefined, // Don't send binary data in response
      logoUrl: responseLogoUrl, // Always return as string (data URL)
      displayCurrency: config.displayCurrency || null // Explicitly include displayCurrency
    };
    
    configLogger.debug('Returning updated config', {
      currency: configWithLogo.currency,
      displayCurrency: configWithLogo.displayCurrency,
      hasDisplayCurrency: configWithLogo.displayCurrency !== undefined && configWithLogo.displayCurrency !== null
    });
    
    res.json({ success: true, data: { config: configWithLogo } });
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

// Upload hospital logo - stores image directly in database as binary (PNG, JPEG, etc.)
export const uploadHospitalLogo = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Read the file as binary buffer
    const fileBuffer = fs.readFileSync(req.file.path);
    const mimeType = req.file.mimetype;

    // Get existing config
    const existingConfig = await prisma.hospitalConfig.findFirst();
    
    // Delete old logo file from filesystem if it exists (for cleanup)
    if (existingConfig?.logoUrl && !existingConfig.logoUrl.startsWith('data:')) {
      try {
        const oldLogoPath = existingConfig.logoUrl.replace('/api/uploads/', 'uploads/');
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      } catch (err) {
        configLogger.warn('Failed to delete old logo file', { error: err });
      }
    }

    // Delete the uploaded file from filesystem since we're storing in DB
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (err) {
      configLogger.warn('Failed to delete uploaded file', { error: err });
    }

    // Update or create config with logo data stored as binary in database
    const config = existingConfig
      ? await prisma.hospitalConfig.update({
          where: { id: existingConfig.id },
          data: { 
            logoData: fileBuffer, // Store as binary (BYTEA)
            logoMimeType: mimeType,
            // Keep logoUrl for backward compatibility - will be converted to data URL when retrieved
            logoUrl: `data:${mimeType};base64,${fileBuffer.toString('base64')}`
          }
        })
      : await prisma.hospitalConfig.create({
          data: {
            hospitalName: 'HMS Hospital',
            logoData: fileBuffer, // Store as binary (BYTEA)
            logoMimeType: mimeType,
            logoUrl: `data:${mimeType};base64,${fileBuffer.toString('base64')}` // For backward compatibility
          }
        });

    configLogger.info('Hospital logo uploaded and stored in database as binary successfully', { 
      hasLogoData: !!config.logoData,
      mimeType: config.logoMimeType,
      size: fileBuffer.length
    });
    
    // Convert binary to data URL for frontend response
    const dataUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    
    res.json({
      success: true,
      message: 'Logo uploaded and stored in database successfully',
      data: { 
        config: {
          ...config,
          logoUrl: dataUrl // Return data URL for frontend
        },
        logoUrl: dataUrl,
        logoData: dataUrl // Also return as logoData for compatibility
      }
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
