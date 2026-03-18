import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  createBed,
  getBeds,
  getBedById,
  updateBed,
  deleteBed,
  getAvailableBeds,
  getBedStats,
} from '../controllers/bedController';

const router = Router();

// All bed routes require authentication
router.use(authenticateToken);

// Bed management routes (Admin, Ward Manager only - based on IPD sub-module permissions)
router.get('/', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER), getBeds);
router.get('/available', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER), getAvailableBeds);
router.get('/stats', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER), getBedStats);
router.get('/:id', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER), getBedById);

// Bed creation and modification (Admin, Ward Manager only)
router.post('/', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER), createBed);
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER), updateBed);
router.delete('/:id', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER), deleteBed);

export { router as bedRoutes };
