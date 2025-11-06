import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  createDailyRound,
  getDailyRounds,
  getDailyRoundById,
  updateDailyRound,
  deleteDailyRound,
  getAdmissionDailyRounds,
} from '../controllers/dailyRoundController';

const router = Router();

// All daily round routes require authentication
router.use(authenticateToken);

// Daily round management routes
router.get('/', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE'), getDailyRounds);
router.get('/admission/:admissionId', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE'), getAdmissionDailyRounds);
router.get('/:id', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'NURSE'), getDailyRoundById);

// Daily round creation and modification (Admin, IPD Doctor, Doctor only)
router.post('/', requireRole('ADMIN', 'DOCTOR'), createDailyRound);
router.put('/:id', requireRole('ADMIN', 'DOCTOR'), updateDailyRound);
router.delete('/:id', requireRole('ADMIN', 'DOCTOR'), deleteDailyRound);

export { router as dailyRoundRoutes };

