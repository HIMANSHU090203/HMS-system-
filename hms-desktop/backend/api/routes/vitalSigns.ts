import { Router } from 'express';
import { UserRole } from '@prisma/client';
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
router.get('/', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.NURSE), getVitalSigns);
router.get('/admission/:admissionId', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.NURSE), getAdmissionVitalSigns);
router.get('/admission/:admissionId/latest', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.NURSE), getLatestVitalSigns);
router.get('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.NURSE), getVitalSignById);

// Vital sign creation and modification (Admin, Doctor, Nurse, Ward Manager)
router.post('/', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.NURSE), createVitalSign);
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.NURSE), updateVitalSign);
router.delete('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER), deleteVitalSign);

export { router as vitalSignRoutes };

