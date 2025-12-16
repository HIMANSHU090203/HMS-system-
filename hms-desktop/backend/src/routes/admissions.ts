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

// Admission management routes (Admin, Receptionist - based on IPD sub-module permissions)
router.get('/', requireRole('ADMIN', 'RECEPTIONIST'), getAdmissions);
router.get('/current', requireRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'WARD_MANAGER'), getCurrentAdmissions);
router.get('/stats', requireRole('ADMIN', 'RECEPTIONIST'), getAdmissionStats);
router.get('/:id', requireRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'WARD_MANAGER'), getAdmissionById);
router.get('/:id/charges-preview', requireRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'WARD_MANAGER'), getChargesPreview);

// Admission creation and modification (Admin, Receptionist - based on IPD sub-module permissions)
router.post('/', requireRole('ADMIN', 'RECEPTIONIST'), createAdmission);
router.put('/:id', requireRole('ADMIN', 'RECEPTIONIST'), updateAdmission);
router.put('/:id/discharge', requireRole('ADMIN', 'DOCTOR', 'NURSE'), dischargePatient);

export { router as admissionRoutes };
