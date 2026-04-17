import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  createDischargeSummary,
  getDischargeSummaryByAdmission,
  getDischargeSummaryById,
  updateDischargeSummary,
  getDischargeSummaries,
} from '../controllers/dischargeSummaryController';

const router = Router();

// All discharge routes require authentication
router.use(authenticateToken);

// Discharge summary management routes
router.get('/', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER), getDischargeSummaries);
router.get('/admission/:admissionId', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.NURSE), getDischargeSummaryByAdmission);
router.get('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.NURSE), getDischargeSummaryById);

// Discharge summary creation and modification (Admin, Doctor, Nurse - based on IPD sub-module permissions)
router.post('/', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE), createDischargeSummary);
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE), updateDischargeSummary);

export { router as dischargeRoutes };

