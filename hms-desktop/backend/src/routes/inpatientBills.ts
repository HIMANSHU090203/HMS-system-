import { Router } from 'express';
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
router.get('/', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'RECEPTIONIST'), getInpatientBills);
router.get('/admission/:admissionId', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'RECEPTIONIST', 'NURSE'), getAdmissionInpatientBills);
router.get('/:id', requireRole('ADMIN', 'DOCTOR', 'WARD_MANAGER', 'RECEPTIONIST', 'NURSE'), getInpatientBillById);

// Inpatient bill creation and modification
router.post('/', requireRole('ADMIN', 'WARD_MANAGER', 'RECEPTIONIST'), createInpatientBill);
router.put('/:id', requireRole('ADMIN', 'WARD_MANAGER', 'RECEPTIONIST'), updateInpatientBill);

export { router as inpatientBillRoutes };

