import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  createInpatientBill,
  getInpatientBills,
  getInpatientBillById,
  updateInpatientBill,
  getAdmissionInpatientBills,
} from '../controllers/inpatientBillController';

const router = Router();

// All inpatient bill routes require authentication
router.use(authenticateToken);

// Inpatient bill management routes
router.get('/', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.RECEPTIONIST), getInpatientBills);
router.get('/admission/:admissionId', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.RECEPTIONIST, UserRole.NURSE), getAdmissionInpatientBills);
router.get('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.WARD_MANAGER, UserRole.RECEPTIONIST, UserRole.NURSE), getInpatientBillById);

// Inpatient bill creation and modification
router.post('/', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER, UserRole.RECEPTIONIST), createInpatientBill);
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.WARD_MANAGER, UserRole.RECEPTIONIST), updateInpatientBill);

export { router as inpatientBillRoutes };

