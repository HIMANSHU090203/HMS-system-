import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  createAdmission,
  getAdmissions,
  getAdmissionById,
  updateAdmission,
  dischargePatient,
  getCurrentAdmissions,
  getAdmissionStats,
  getChargesPreview,
} from '../controllers/admissionController';

const router = Router();

// All admission routes require authentication
router.use(authenticateToken);

// Admission management routes (Admin, IPD Doctor, Ward Manager)
router.get('/', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER'), getAdmissions);
router.get('/current', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE'), getCurrentAdmissions);
router.get('/stats', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER'), getAdmissionStats);
router.get('/:id', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE'), getAdmissionById);
router.get('/:id/charges-preview', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE'), getChargesPreview);

// Admission creation and modification (Admin, IPD Doctor only)
router.post('/', requireRole('ADMIN', 'DOCTOR'), createAdmission);
router.put('/:id', requireRole('ADMIN', 'DOCTOR'), updateAdmission);
router.put('/:id/discharge', requireRole('ADMIN', 'DOCTOR'), dischargePatient);

export { router as admissionRoutes };
