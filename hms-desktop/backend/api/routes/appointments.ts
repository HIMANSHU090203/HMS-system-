import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAvailableDoctors,
  getAppointmentStats,
} from '../controllers/appointmentController';

const router = Router();

// Validate all imported functions are available
if (!getAvailableDoctors || typeof getAvailableDoctors !== 'function') {
  throw new Error('getAvailableDoctors is not properly exported from appointmentController');
}

if (!getAppointmentStats || typeof getAppointmentStats !== 'function') {
  throw new Error('getAppointmentStats is not properly exported from appointmentController');
}

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   GET /api/appointments
// @desc    Get all appointments with search and pagination
// @access  Private
router.get('/', getAppointments);

// @route   GET /api/appointments/doctors
// @desc    Get available doctors
// @access  Private
router.get('/doctors', getAvailableDoctors);

// @route   GET /api/appointments/stats
// @desc    Get appointment statistics
// @access  Private
router.get('/stats', getAppointmentStats);

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', getAppointmentById);

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', createAppointment);

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', updateAppointment);

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', deleteAppointment);

export { router as appointmentRoutes };
