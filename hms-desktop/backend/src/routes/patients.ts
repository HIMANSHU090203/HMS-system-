import { Router, Response } from 'express';
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  searchPatientByPhone,
  getPatientStats,
} from '../controllers/patientController';

const router = Router();

// Custom middleware to allow ADMIN, DOCTOR, RECEPTIONIST, PHARMACY, and LAB_TECH roles
const requirePatientAccess = (req: AuthRequest, res: Response, next: any) => {
  const userRole = req.user?.role;
  if (userRole === UserRole.ADMIN || userRole === UserRole.DOCTOR || userRole === UserRole.RECEPTIONIST || userRole === UserRole.PHARMACY || userRole === UserRole.LAB_TECH) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
  }
};

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   GET /api/patients
// @desc    Get all patients with search and pagination
// @access  Private (Admin, Doctor, Receptionist)
router.get('/', requirePatientAccess, getPatients);

// @route   GET /api/patients/search/:phone
// @desc    Search patients by phone number
// @access  Private (Admin, Doctor, Receptionist)
router.get('/search/:phone', requirePatientAccess, searchPatientByPhone);

// @route   GET /api/patients/stats
// @desc    Get patient statistics
// @access  Private (Admin, Doctor, Receptionist)
router.get('/stats', requirePatientAccess, getPatientStats);

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Private (Admin, Doctor, Receptionist)
router.get('/:id', requirePatientAccess, getPatientById);

// @route   POST /api/patients
// @desc    Create new patient
// @access  Private (Admin, Receptionist)
router.post('/', requireAdmin, createPatient);

// @route   PUT /api/patients/:id
// @desc    Update patient
// @access  Private (Admin, Receptionist)
router.put('/:id', requireAdmin, updatePatient);

// @route   DELETE /api/patients/:id
// @desc    Delete patient
// @access  Private (Admin, Receptionist)
router.delete('/:id', requireAdmin, deletePatient);

export { router as patientRoutes };