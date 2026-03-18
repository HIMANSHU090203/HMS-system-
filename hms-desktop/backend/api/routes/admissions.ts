import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  createAdmission,
  getAdmissions,
  getAdmissionById,
  updateAdmission,
  dischargePatient,
  getCurrentAdmissions,
  getAdmissionStats,
  getChargesPreview,
} from '../controllers/admissionController';

const router = Router();

// All admission routes require authentication
router.use(authenticateToken);

// Admission management routes (Admin, Receptionist - based on IPD sub-module permissions)
router.get('/', requireRole(UserRole.ADMIN, UserRole.RECEPTIONIST), getAdmissions);
router.get('/current', requireRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE, UserRole.WARD_MANAGER), getCurrentAdmissions);
router.get('/stats', requireRole(UserRole.ADMIN, UserRole.RECEPTIONIST), getAdmissionStats);
router.get('/:id', requireRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE, UserRole.WARD_MANAGER), getAdmissionById);
router.get('/:id/charges-preview', requireRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE, UserRole.WARD_MANAGER), getChargesPreview);

// Admission creation and modification (Admin, Receptionist - based on IPD sub-module permissions)
router.post('/', requireRole(UserRole.ADMIN, UserRole.RECEPTIONIST), createAdmission);
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.RECEPTIONIST), updateAdmission);
router.put('/:id/discharge', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE), dischargePatient);

export { router as admissionRoutes };
