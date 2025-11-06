import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger, { loggerWithContext } from '../utils/logger';

const errorLogger = loggerWithContext('ErrorHandler');

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Don't log expected authentication errors as errors (they're warnings)
  // This reduces noise when users have expired/invalid tokens stored
  const isAuthError = statusCode === 401 && 
    (message.toLowerCase().includes('token') || 
     message.toLowerCase().includes('authentication') || 
     message.toLowerCase().includes('unauthorized') ||
     req.url === '/api/auth/me');

  if (isAuthError) {
    // Log as debug/warn instead of error for expected auth failures
    errorLogger.debug('🔐 Authentication check', {
      url: req.url,
      method: req.method,
      message: message,
      statusCode,
    });
  } else {
    // Enhanced error logging with context for real errors
    errorLogger.error('❌ Error occurred', error, {
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      userId: (req as any).user?.id,
      statusCode,
      errorType: error.constructor.name,
    });
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 400;
        message = 'A record with this information already exists';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Invalid reference to related record';
        break;
      default:
        statusCode = 400;
        message = 'Database operation failed';
    }
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  }

  // Don't leak error details in production
  if (process.env['NODE_ENV'] === 'production' && statusCode === 500) {
    message = 'Something went wrong';
  }

  // Check if response has already been sent (prevents "Cannot set headers after they are sent" errors)
  if (res.headersSent) {
    errorLogger.warn('Warning: Response headers already sent, cannot send error response');
    return;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env['NODE_ENV'] === 'development' && {
      stack: error.stack,
      error: error,
      errorType: error.constructor.name,
      ...(error && typeof error === 'object' && 'code' in error && { errorCode: (error as any).code }),
      ...(error && typeof error === 'object' && 'meta' in error && { errorMeta: (error as any).meta }),
    }),
  });
};

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
