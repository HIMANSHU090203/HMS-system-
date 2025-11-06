import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.nativeEnum(UserRole),
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { username, password } = validatedData;

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    const signOptions: SignOptions = {
      expiresIn: '1h'
    };
    
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      jwtSecret,
      signOptions
    );

    // Log the login action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        tableName: 'users',
        recordId: user.id,
        newValue: { loginTime: new Date().toISOString() },
      },
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
        },
        accessToken,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// @route   POST /api/auth/register
// @desc    Register new user (Admin only)
// @access  Private (Admin)
router.post('/register', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can register new users',
      });
    }

    const validatedData = registerSchema.parse(req.body);
    const { username, password, fullName, role } = validatedData;

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists',
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        passwordHash,
        fullName,
        role,
        isActive: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_USER',
        tableName: 'users',
        recordId: newUser.id,
        newValue: {
          username: newUser.username,
          fullName: newUser.fullName,
          role: newUser.role,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          fullName: newUser.fullName,
          role: newUser.role,
          isActive: newUser.isActive,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Log the logout action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'LOGOUT',
        tableName: 'users',
        recordId: req.user!.id,
        newValue: { logoutTime: new Date().toISOString() },
      },
    });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token (placeholder for future implementation)
// @access  Public
router.post('/refresh', (req, res) => {
  res.json({
    success: true,
    message: 'Token refresh endpoint - to be implemented',
    data: null,
  });
});

// Validation schema for forgot password
const forgotPasswordSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

const registerFirstAdminSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
});

// @route   POST /api/auth/forgot-password
// @desc    Reset password for a user (forgot password)
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const validatedData = forgotPasswordSchema.parse(req.body);
    const { username, newPassword } = validatedData;

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Username not found',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
      });
    }

    // Hash the new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET',
        tableName: 'users',
        recordId: user.id,
        oldValue: { passwordChanged: true },
        newValue: { passwordReset: true },
      },
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// @route   POST /api/auth/register-admin
// @desc    Register first admin (only if no users exist)
// @access  Public (but restricted to first-user scenario)
router.post('/register-admin', async (req, res) => {
  try {
    // Check if any users exist
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'Admin already exists. Please login.',
      });
    }

    const validatedData = registerFirstAdminSchema.parse(req.body);
    const { username, password, fullName } = validatedData;

    // Hash password
    const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        username,
        passwordHash,
        fullName,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    // Log this special event
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'CREATE_FIRST_ADMIN',
        tableName: 'users',
        recordId: admin.id,
        newValue: { username: admin.username, role: admin.role },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: { user: admin },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues,
      });
    }
    
    console.error('Register admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin account',
    });
  }
});

export { router as authRoutes };