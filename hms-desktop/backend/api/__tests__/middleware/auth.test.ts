import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
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

import { authenticateToken, AuthRequest } from '../../middleware/auth';

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-jwt-secret-key-min-32-characters-long';

    mockReq = {
      headers: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate valid token', async () => {
    const token = jwt.sign(
      { userId: 'user-1', username: 'testuser', role: 'DOCTOR', type: 'access' },
      process.env.JWT_SECRET!,
      { issuer: 'hms-backend', audience: 'hms-desktop' }
    );

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      username: 'testuser',
      role: 'DOCTOR',
      fullName: 'Test User',
      isActive: true,
    });

    await authenticateToken(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect((mockReq as AuthRequest).user).toBeDefined();
    expect((mockReq as AuthRequest).user?.id).toBe('user-1');
    expect((mockReq as AuthRequest).user?.role).toBe('DOCTOR');
  });

  it('should reject request without token', async () => {
    mockReq.headers = {};

    await authenticateToken(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Access token required',
        statusCode: 401,
      })
    );
  });

  it('should reject invalid token', async () => {
    mockReq.headers = {
      authorization: 'Bearer invalid-token',
    };

    await authenticateToken(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid token',
        statusCode: 401,
      })
    );
  });

  it('should reject refresh token used as access token', async () => {
    // Sign with access-token secret so verification passes, then fail token type check.
    const refreshTokenLikeAccess = jwt.sign(
      { userId: 'user-1', username: 'testuser', type: 'refresh' },
      process.env.JWT_SECRET!,
      { issuer: 'hms-backend', audience: 'hms-desktop' }
    );

    mockReq.headers = {
      authorization: `Bearer ${refreshTokenLikeAccess}`,
    };

    await authenticateToken(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid token type',
        statusCode: 401,
      })
    );
  });

  it('should reject token with wrong issuer', async () => {
    const token = jwt.sign(
      { userId: 'user-1', username: 'testuser', role: 'DOCTOR', type: 'access' },
      process.env.JWT_SECRET!,
      { issuer: 'wrong-issuer', audience: 'hms-desktop' }
    );

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    await authenticateToken(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
      })
    );
  });

  it('should reject expired token', () => {
    const token = jwt.sign(
      { userId: 'user-1', username: 'testuser', role: 'DOCTOR', type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: '-1h', issuer: 'hms-backend', audience: 'hms-desktop' }
    );

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    authenticateToken(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Token expired',
        statusCode: 401,
      })
    );
  });
});





