import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  createNursingShift,
  getNursingShifts,
  getNursingShiftById,
  updateNursingShift,
  deleteNursingShift,
  getAdmissionNursingShifts,
} from '../controllers/nursingShiftController';

const router = Router();

// All nursing shift routes require authentication
router.use(authenticateToken);

// Nursing shift management routes
router.get('/', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.NURSE, UserRole.NURSING_SUPERVISOR), getNursingShifts);
router.get('/admission/:admissionId', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.NURSE, UserRole.NURSING_SUPERVISOR), getAdmissionNursingShifts);
router.get('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.NURSE, UserRole.NURSING_SUPERVISOR), getNursingShiftById);

// Nursing shift creation and modification
router.post('/', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER, UserRole.NURSE, UserRole.NURSING_SUPERVISOR), createNursingShift);
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER, UserRole.NURSE, UserRole.NURSING_SUPERVISOR), updateNursingShift);
router.delete('/:id', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER, UserRole.NURSING_SUPERVISOR), deleteNursingShift);

export { router as nursingShiftRoutes };

