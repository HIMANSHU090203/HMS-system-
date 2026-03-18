import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import {
  createConsultation,
  getConsultations,
  getConsultationById,
  updateConsultation,
  deleteConsultation,
  getConsultationStats,
} from '../controllers/consultationController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   GET /api/consultations
// @desc    Get all consultations with search and pagination
// @access  Private (Admin, Doctor)
router.get('/', requireRole(UserRole.ADMIN, UserRole.DOCTOR), getConsultations);

// @route   GET /api/consultations/stats
// @desc    Get consultation statistics
// @access  Private (Admin, Doctor)
router.get('/stats', requireRole(UserRole.ADMIN, UserRole.DOCTOR), getConsultationStats);

// @route   GET /api/consultations/:id
// @desc    Get consultation by ID
// @access  Private (Admin, Doctor)
router.get('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR), getConsultationById);

// @route   POST /api/consultations
// @desc    Create new consultation
// @access  Private (Admin, Doctor)
router.post('/', requireRole(UserRole.ADMIN, UserRole.DOCTOR), createConsultation);

// @route   PUT /api/consultations/:id
// @desc    Update consultation
// @access  Private (Admin, Doctor)
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR), updateConsultation);

// @route   DELETE /api/consultations/:id
// @desc    Delete consultation
// @access  Private (Admin, Doctor)
router.delete('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR), deleteConsultation);

export { router as consultationRoutes };
