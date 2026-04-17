import { Router } from 'express';
import { UserRole } from '@prisma/client';
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

// Ward management routes (Admin, Ward Manager only - based on IPD sub-module permissions)
router.get('/', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER), getWards);
router.get('/stats', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER), getWardStats);
router.get('/:id', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER), getWardById);

// Ward creation and modification (Admin, Ward Manager only)
router.post('/', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER), createWard);
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER), updateWard);
router.delete('/:id', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER), deleteWard);

export { router as wardRoutes };
