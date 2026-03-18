import { Router, Response } from 'express';
import { authenticateToken, requireAdmin, AuthRequest, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetUserPassword,
  toggleUserStatus,
  getUserStats,
  changePassword,
} from '../controllers/userController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   GET /api/users
// @desc    Get all users with search and pagination (Admin, Doctor, Receptionist, Pharmacy, Lab Tech)
// @access  Private (Admin, Doctor, Receptionist, Pharmacy, Lab Tech)
router.get('/', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.PHARMACY, UserRole.LAB_TECH), getUsers);

// @route   GET /api/users/stats
// @desc    Get user statistics (Admin only)
// @access  Private (Admin)
router.get('/stats', requireAdmin, getUserStats);

// @route   GET /api/users/:id
// @desc    Get user by ID (Admin, Doctor, Receptionist, Pharmacy, Lab Tech)
// @access  Private (Admin, Doctor, Receptionist, Pharmacy, Lab Tech)
router.get('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.PHARMACY, UserRole.LAB_TECH), getUserById);

// @route   POST /api/users
// @desc    Create new user (Admin only)
// @access  Private (Admin)
router.post('/', requireAdmin, createUser);

// @route   PUT /api/users/:id
// @desc    Update user (Admin only)
// @access  Private (Admin)
router.put('/:id', requireAdmin, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/:id', requireAdmin, deleteUser);

// @route   POST /api/users/:id/reset-password
// @desc    Reset user password (Admin only)
// @access  Private (Admin)
router.post('/:id/reset-password', requireAdmin, resetUserPassword);

// @route   POST /api/users/:id/toggle-status
// @desc    Toggle user active status (Admin only)
// @access  Private (Admin)
router.post('/:id/toggle-status', requireAdmin, toggleUserStatus);

// @route   POST /api/users/change-password
// @desc    Change current user's password
// @access  Private (Any authenticated user)
router.post('/change-password', changePassword);

export { router as userRoutes };