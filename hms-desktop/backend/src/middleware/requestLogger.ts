import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log incoming request (debug level for less noise)
  logger.debug(`📥 ${req.method} ${req.path}`, {
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 500 ? '🔴' : res.statusCode >= 400 ? '🟡' : '🟢';
    
    // Use appropriate log level
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`📤 ${statusColor} ${req.method} ${req.path} - ${res.statusCode}`, {
      duration: `${duration}ms`,
      userId: (req as any).user?.id,
    });
    
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};
