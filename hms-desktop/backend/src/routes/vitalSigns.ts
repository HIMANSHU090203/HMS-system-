import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  createVitalSign,
  getVitalSigns,
  getVitalSignById,
  updateVitalSign,
  deleteVitalSign,
  getAdmissionVitalSigns,
  getLatestVitalSigns,
} from '../controllers/vitalSignController';

const router = Router();

// All vital sign routes require authentication
router.use(authenticateToken);

// Vital sign management routes
router.get('/', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE'), getVitalSigns);
router.get('/admission/:admissionId', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE'), getAdmissionVitalSigns);
router.get('/admission/:admissionId/latest', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE'), getLatestVitalSigns);
router.get('/:id', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE'), getVitalSignById);

// Vital sign creation and modification (Admin, IPD Doctor, Doctor, Nurse, Ward Manager)
router.post('/', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE'), createVitalSign);
router.put('/:id', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE'), updateVitalSign);
router.delete('/:id', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER'), deleteVitalSign);

export { router as vitalSignRoutes };

