import { Router } from 'express';
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
router.get('/', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER'), getDischargeSummaries);
router.get('/admission/:admissionId', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE'), getDischargeSummaryByAdmission);
router.get('/:id', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE'), getDischargeSummaryById);

// Discharge summary creation and modification (Admin, Doctor, Nurse - based on IPD sub-module permissions)
router.post('/', requireRole('ADMIN', 'DOCTOR', 'NURSE'), createDischargeSummary);
router.put('/:id', requireRole('ADMIN', 'DOCTOR', 'NURSE'), updateDischargeSummary);

export { router as dischargeRoutes };

