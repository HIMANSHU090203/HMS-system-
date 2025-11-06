import { Router } from 'express';
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
router.get('/', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE', 'NURSING_SUPERVISOR'), getNursingShifts);
router.get('/admission/:admissionId', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE', 'NURSING_SUPERVISOR'), getAdmissionNursingShifts);
router.get('/:id', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE', 'NURSING_SUPERVISOR'), getNursingShiftById);

// Nursing shift creation and modification
router.post('/', requireRole('ADMIN', 'WARD_MANAGER', 'NURSE', 'NURSING_SUPERVISOR'), createNursingShift);
router.put('/:id', requireRole('ADMIN', 'WARD_MANAGER', 'NURSE', 'NURSING_SUPERVISOR'), updateNursingShift);
router.delete('/:id', requireRole('ADMIN', 'WARD_MANAGER', 'NURSING_SUPERVISOR'), deleteNursingShift);

export { router as nursingShiftRoutes };

