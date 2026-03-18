import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import {
  checkDrugInteractions,
  checkPatientAllergies,
  addDrugInteraction,
  getAllDrugInteractions,
  updateDrugInteraction,
  deleteDrugInteraction,
} from '../controllers/safetyController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   POST /api/safety/drug-interactions/check
// @desc    Check drug interactions between medicines
// @access  Private (Doctor, Admin, Pharmacy)
router.post('/drug-interactions/check', requireRole(UserRole.DOCTOR, UserRole.ADMIN, UserRole.PHARMACY), checkDrugInteractions);

// @route   POST /api/safety/patient-allergies/check
// @desc    Check patient allergies against medicines
// @access  Private (Doctor, Admin, Pharmacy)
router.post('/patient-allergies/check', requireRole(UserRole.DOCTOR, UserRole.ADMIN, UserRole.PHARMACY), checkPatientAllergies);

// @route   GET /api/safety/drug-interactions
// @desc    Get all drug interactions
// @access  Private (Admin, Doctor, Pharmacy)
router.get('/drug-interactions', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PHARMACY), getAllDrugInteractions);

// @route   POST /api/safety/drug-interactions
// @desc    Add new drug interaction
// @access  Private (Admin only)
router.post('/drug-interactions', requireRole(UserRole.ADMIN), addDrugInteraction);

// @route   PUT /api/safety/drug-interactions/:id
// @desc    Update drug interaction
// @access  Private (Admin only)
router.put('/drug-interactions/:id', requireRole(UserRole.ADMIN), updateDrugInteraction);

// @route   DELETE /api/safety/drug-interactions/:id
// @desc    Delete drug interaction
// @access  Private (Admin only)
router.delete('/drug-interactions/:id', requireRole(UserRole.ADMIN), deleteDrugInteraction);

export { router as safetyRoutes };
