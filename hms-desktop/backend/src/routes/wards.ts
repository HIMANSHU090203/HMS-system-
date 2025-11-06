import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  createWard,
  getWards,
  getWardById,
  updateWard,
  deleteWard,
  getWardStats,
} from '../controllers/wardController';

const router = Router();

// All ward routes require authentication
router.use(authenticateToken);

// Ward management routes (Admin, Ward Manager, Doctor)
router.get('/', requireRole('ADMIN', 'WARD_MANAGER', 'DOCTOR'), getWards);
router.get('/stats', requireRole('ADMIN', 'WARD_MANAGER', 'DOCTOR'), getWardStats);
router.get('/:id', requireRole('ADMIN', 'WARD_MANAGER', 'DOCTOR'), getWardById);

// Ward creation and modification (Admin, Ward Manager only)
router.post('/', requireRole('ADMIN', 'WARD_MANAGER'), createWard);
router.put('/:id', requireRole('ADMIN', 'WARD_MANAGER'), updateWard);
router.delete('/:id', requireRole('ADMIN', 'WARD_MANAGER'), deleteWard);

export { router as wardRoutes };
