import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock Prisma before importing routes
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  UserRole: {
    ADMIN: 'ADMIN',
    DOCTOR: 'DOCTOR',
    LAB_TECH: 'LAB_TECH',
    PHARMACY: 'PHARMACY',
    RECEPTIONIST: 'RECEPTIONIST',
    NURSE: 'NURSE',
    WARD_MANAGER: 'WARD_MANAGER',
    NURSING_SUPERVISOR: 'NURSING_SUPERVISOR',
  },
}));

// Mock middleware
jest.mock('../../middleware/rateLimiter', () => ({
  authLimiter: (req: any, res: any, next: any) => next(),
}));

jest.mock('../../middleware/inputSanitizer', () => ({
  sanitizeInput: (req: any, res: any, next: any) => next(),
}));

// Import routes after mocking
import { authRoutes } from '../../routes/auth';

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-min-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-min-32-characters-long';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

describe('Auth Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: '1',
        username: 'testuser',
        passwordHash: hashedPassword,
        fullName: 'Test User',
        role: 'DOCTOR',
        isActive: true,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data?.accessToken).toBeDefined();
      expect(response.body.data?.user).toBeDefined();
      expect(response.body.data?.user.username).toBe('testuser');
    });

    it('should reject login with invalid username', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: '1',
        username: 'testuser',
        passwordHash: hashedPassword,
        fullName: 'Test User',
        role: 'DOCTOR',
        isActive: true,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login with inactive user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: '1',
        username: 'testuser',
        passwordHash: hashedPassword,
        fullName: 'Test User',
        role: 'DOCTOR',
        isActive: false,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: '',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should return refresh token when refresh secret is configured', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: '1',
        username: 'testuser',
        passwordHash: hashedPassword,
        fullName: 'Test User',
        role: 'DOCTOR',
        isActive: true,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.data?.refreshToken).toBeDefined();
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully with valid refresh token', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        role: 'DOCTOR',
        fullName: 'Test User',
        isActive: true,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const refreshToken = jwt.sign(
        { userId: '1', username: 'testuser', type: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d', issuer: 'hms-backend', audience: 'hms-desktop' }
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data?.accessToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject access token used as refresh token', async () => {
      const accessToken = jwt.sign(
        { userId: '1', username: 'testuser', role: 'DOCTOR', type: 'access' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h', issuer: 'hms-backend', audience: 'hms-desktop' }
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: accessToken });

      expect(response.status).toBe(401);
    });
  });
});

