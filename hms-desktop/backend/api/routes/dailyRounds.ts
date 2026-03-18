import { Router } from 'express';
import { UserRole } from '@prisma/client';
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
router.get('/', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.NURSE), getDailyRounds);
router.get('/admission/:admissionId', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.NURSE), getAdmissionDailyRounds);
router.get('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.NURSE), getDailyRoundById);

// Daily round creation and modification (Admin, Doctor only)
router.post('/', requireRole(UserRole.ADMIN, UserRole.DOCTOR), createDailyRound);
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR), updateDailyRound);
router.delete('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR), deleteDailyRound);

export { router as dailyRoundRoutes };

