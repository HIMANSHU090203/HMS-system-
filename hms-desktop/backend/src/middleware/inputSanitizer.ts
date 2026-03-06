import { Request, Response, NextFunction } from 'express';

/**
 * Input sanitization middleware
 * Removes potentially dangerous characters and normalizes input
 */

// List of potentially dangerous SQL/script injection patterns
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick=, onerror=, etc.
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
];

/**
 * Sanitize a string value
 */
function sanitizeString(value: string): string {
  if (typeof value !== 'string') {
    return value;
  }

  // Remove null bytes
  let sanitized = value.replace(/\0/g, '');

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      // Remove dangerous content
      sanitized = sanitized.replace(pattern, '');
    }
  }

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Sanitize key
        const sanitizedKey = sanitizeString(key);
        // Sanitize value
        sanitized[sanitizedKey] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  // For numbers, booleans, etc., return as-is
  return obj;
}

/**
 * Sanitize object properties in-place
 * Modifies the object directly instead of replacing it
 */
function sanitizeObjectInPlace(obj: any): void {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        // Sanitize string values in-place
        obj[key] = sanitizeString(value);
      } else if (Array.isArray(value)) {
        // Sanitize array elements
        obj[key] = value.map(item => 
          typeof item === 'string' ? sanitizeString(item) : sanitizeObject(item)
        );
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize nested objects
        sanitizeObjectInPlace(value);
      }
    }
  }
}

/**
 * Input sanitization middleware
 * Sanitizes req.body, req.query, and req.params
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters (in-place to avoid read-only property error)
  if (req.query && typeof req.query === 'object') {
    sanitizeObjectInPlace(req.query);
  }

  // Sanitize route parameters (in-place to avoid read-only property error)
  if (req.params && typeof req.params === 'object') {
    sanitizeObjectInPlace(req.params);
  }

  next();
};

/**
 * Strict sanitization for specific routes (e.g., file uploads, admin operations)
 * More aggressive sanitization
 */
export const strictSanitize = (req: Request, res: Response, next: NextFunction) => {
  // Apply regular sanitization
  sanitizeInput(req, res, () => {
    // Additional strict checks
    const bodyStr = JSON.stringify(req.body);
    
    // Block SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /('|(\\')|(;)|(\\)|(\/\*)|(\*\/)|(--))/gi,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(bodyStr)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input detected',
        });
      }
    }

    next();
  });
};



