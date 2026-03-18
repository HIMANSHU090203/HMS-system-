import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Terminal-friendly format for console (simplified for immediate output)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, context, ...metadata }) => {
    // Build message with context if available
    let msg = `[${timestamp}] ${level}`;
    if (context) {
      msg += ` [${context}]`;
    }
    msg += `: ${message}`;
    
    // Add metadata if present (simplified - no newlines for faster output)
    if (Object.keys(metadata).length > 0 && metadata.constructor === Object) {
      const filteredMeta = { ...metadata };
      // Remove service field as it's redundant
      delete filteredMeta.service;
      
      if (Object.keys(filteredMeta).length > 0) {
        const metaStr = JSON.stringify(filteredMeta);
        if (metaStr !== '{}') {
          msg += ` ${metaStr}`;
        }
      }
    }
    
    return msg;
  })
);

// File format (structured JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: fileFormat,
  defaultMeta: { service: 'hms-backend' },
  transports: [
    // Always write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write errors to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write debug logs (development only)
    ...(process.env.NODE_ENV !== 'production'
      ? [
          new winston.transports.File({
            filename: path.join(logsDir, 'debug.log'),
            level: 'debug',
            maxsize: 5242880,
            maxFiles: 3,
          }),
        ]
      : []),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
    }),
    // Also log exceptions to console
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
    }),
    // Also log rejections to console
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

// ALWAYS add console transport for terminal output (with immediate flush)
logger.add(
  new winston.transports.Console({
    format: consoleFormat,
    handleExceptions: true,
    handleRejections: true,
    // Ensure logs appear immediately in terminal
    silent: false,
  })
);

// Helper to create contextual loggers
export const loggerWithContext = (context: string) => ({
  debug: (message: string, meta?: any) => logger.debug(message, { context, ...meta }),
  info: (message: string, meta?: any) => logger.info(message, { context, ...meta }),
  warn: (message: string, meta?: any) => logger.warn(message, { context, ...meta }),
  error: (message: string, error?: Error | any, meta?: any) => {
    if (error instanceof Error) {
      logger.error(message, {
        context,
        error: error.message,
        stack: error.stack,
        ...meta,
      });
    } else {
      logger.error(message, { context, ...error, ...meta });
    }
  },
});

export default logger;

