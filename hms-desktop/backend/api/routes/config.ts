import { Router } from 'express';
import { checkSetupStatus, getHospitalConfig, updateHospitalConfig, getLabTestConfig, addLabTestConfig, updateLabTestConfig, getMedicineConfig, addMedicineConfig, updateMedicineConfig, uploadHospitalLogo } from '../controllers/configController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { uploadLogo } from '../middleware/upload';

const router = Router();

// Setup status check (no auth required)
router.get('/setup-status', checkSetupStatus);

// Hospital Configuration - Public during setup, protected after
router.get('/hospital', getHospitalConfig);
router.put('/hospital', updateHospitalConfig);
router.post('/hospital/logo', uploadLogo.single('logo'), uploadHospitalLogo);

// All other config routes require authentication and ADMIN role
router.use(authenticateToken);
router.use(requireRole(UserRole.ADMIN));

// Lab Test Configuration
router.get('/lab-tests', getLabTestConfig);
router.post('/lab-tests', addLabTestConfig);
router.put('/lab-tests/:id', updateLabTestConfig);

// Medicine Configuration
router.get('/medicines', getMedicineConfig);
router.post('/medicines', addMedicineConfig);
router.put('/medicines/:id', updateMedicineConfig);

export default router;
