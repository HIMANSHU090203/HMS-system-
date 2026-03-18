import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import {
  getPrescriptionAuditLogs,
  getAllAuditLogs,
  getAuditStats,
} from '../controllers/auditController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   GET /api/audit/prescriptions/:prescriptionId
// @desc    Get audit logs for a specific prescription
// @access  Private (Doctor, Admin, Pharmacy)
router.get(
  '/prescriptions/:prescriptionId',
  requireRole(UserRole.DOCTOR, UserRole.ADMIN, UserRole.PHARMACY),
  getPrescriptionAuditLogs
);

// @route   GET /api/audit/stats
// @desc    Get audit statistics
// @access  Private (Admin)
router.get('/stats', requireRole(UserRole.ADMIN), getAuditStats);

// @route   GET /api/audit
// @desc    Get all audit logs with filtering
// @access  Private (Admin)
router.get('/', requireRole(UserRole.ADMIN), getAllAuditLogs);

export { router as auditRoutes };
