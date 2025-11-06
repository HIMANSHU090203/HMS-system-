import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import logger, { loggerWithContext } from './utils/logger';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Create logger with context
const appLogger = loggerWithContext('Server');

// Security middleware
app.use(helmet({
  // Allow Electron apps to make requests
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Allow all origins for Electron app
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (must be after body parsing)
app.use(requestLogger);

// Health check endpoint (MUST be defined before routes so it's always available)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    message: 'HMS Backend Server is running!'
  });
});

// Load all routes
let loadedRoutes = 0;
let failedRoutes = 0;

// Define routes array
const routes = [
    { path: '/api/auth', module: './routes/auth', exportName: 'authRoutes' },
    { path: '/api/users', module: './routes/users', exportName: 'userRoutes' },
    { path: '/api/patients', module: './routes/patients', exportName: 'patientRoutes' },
    { path: '/api/appointments', module: './routes/appointments', exportName: 'appointmentRoutes' },
    { path: '/api/consultations', module: './routes/consultations', exportName: 'consultationRoutes' },
    { path: '/api/admissions', module: './routes/admissions', exportName: 'admissionRoutes' },
    { path: '/api/daily-rounds', module: './routes/dailyRounds', exportName: 'dailyRoundRoutes' },
    { path: '/api/vital-signs', module: './routes/vitalSigns', exportName: 'vitalSignRoutes' },
    { path: '/api/prescriptions', module: './routes/prescriptions', exportName: 'prescriptionRoutes' },
    { path: '/api/lab-tests', module: './routes/labTests', exportName: 'labTestRoutes' },
    { path: '/api/medicines', module: './routes/medicines', exportName: 'medicineRoutes' },
    { path: '/api/wards', module: './routes/wards', exportName: 'wardRoutes' },
    { path: '/api/beds', module: './routes/beds', exportName: 'bedRoutes' },
    { path: '/api/bills', module: './routes/bills', exportName: 'billRoutes' },
    { path: '/api/billing', module: './routes/billing', exportName: 'billingRoutes' },
    { path: '/api/inpatient-bills', module: './routes/inpatientBills', exportName: 'inpatientBillRoutes' },
    { path: '/api/discharge', module: './routes/discharge', exportName: 'dischargeRoutes' },
    { path: '/api/nursing-shifts', module: './routes/nursingShifts', exportName: 'nursingShiftRoutes' },
    { path: '/api/audit', module: './routes/audit', exportName: 'auditRoutes' },
    { path: '/api/safety', module: './routes/safety', exportName: 'safetyRoutes' },
    { path: '/api/config', module: './routes/config', exportName: null },
    { path: '/api/catalog', module: './routes/catalog', exportName: null },
];

try {
  // Load routes dynamically (works with ts-node)
  routes.forEach(route => {
    try {
      const routeModule = require(route.module);
      
      // Handle both named exports and default exports
      let routeHandler;
      if (route.exportName) {
        routeHandler = routeModule[route.exportName] || routeModule.default || routeModule.router;
      } else {
        routeHandler = routeModule.default || routeModule.router;
      }
      
      if (routeHandler) {
        app.use(route.path, routeHandler);
        loadedRoutes++;
        appLogger.info(`✅ Routes mounted: ${route.path}`, { route: route.path });
      } else {
        failedRoutes++;
        appLogger.warn(`⚠️  Route handler not found: ${route.path}`, { 
          exportName: route.exportName || 'default',
          availableExports: Object.keys(routeModule)
        });
      }
    } catch (error: any) {
      failedRoutes++;
      appLogger.error(`❌ Failed to load route: ${route.path}`, error, {
        module: route.module,
        exportName: route.exportName || 'default',
      });
    }
  });
  
  appLogger.info(`📦 Route loading complete: ${loadedRoutes} loaded, ${failedRoutes} failed`);
} catch (error: any) {
  appLogger.error('❌ Critical error loading routes', error);
}

// Note: Auth routes are loaded above, so /api/auth/login is handled by authRoutes

// 404 handler (must be after all routes)
app.use((req, res) => {
  appLogger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
  
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  appLogger.info(`Received ${signal}, shutting down gracefully...`);
  
  try {
    await prisma.$disconnect();
    appLogger.info('Database disconnected');
    process.exit(0);
  } catch (error) {
    appLogger.error('Error during shutdown', error as Error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  appLogger.error('Unhandled Rejection', reason instanceof Error ? reason : new Error(String(reason)), {
    promise: String(promise),
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  appLogger.error('Uncaught Exception', error);
  gracefulShutdown('uncaughtException');
});

// Start server
const startServer = async () => {
  try {
    // Test database connection with timeout
    appLogger.info('🔌 Connecting to database...');
    const connectPromise = prisma.$connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout after 10 seconds')), 10000)
    );
    
    try {
      await Promise.race([connectPromise, timeoutPromise]);
      appLogger.info('✅ Database connected successfully');
    } catch (dbError: any) {
      appLogger.error('❌ Database connection failed', dbError instanceof Error ? dbError : new Error(dbError.message), {
        message: dbError.message,
      });
      appLogger.warn('⚠️  Server will start but database operations will fail until connection is established', {
        checks: [
          'DATABASE_URL is set in .env file',
          'PostgreSQL server is running',
          'Database credentials are correct',
        ],
      });
      // Continue anyway - server can start without DB for health checks
    }

    // Start the server
    const server = app.listen(PORT, () => {
      appLogger.info(`🚀 HMS Backend Server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        hospital: process.env.HOSPITAL_NAME || 'HMS System',
      });
      
      logger.info(`📡 API Base URL: http://localhost:${PORT}/api`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
      logger.info(`📊 Routes loaded: ${loadedRoutes}/${routes.length}`);
      
      if (failedRoutes > 0) {
        logger.warn(`⚠️  ${failedRoutes} route(s) failed to load - check logs above`);
      }
      
      logger.info('✅ Server is ready to accept requests!');
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        appLogger.error(`❌ Port ${PORT} is already in use`, error, {
          port: PORT,
          suggestion: 'Please stop the other process or use a different port',
        });
        process.exit(1);
      } else {
        appLogger.error('❌ Server error', error);
        process.exit(1);
      }
    });

  } catch (error) {
    appLogger.error('❌ Failed to start server', error instanceof Error ? error : new Error(String(error)));
    if (error instanceof Error && error.stack) {
      appLogger.error('Stack trace', error);
    }
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors
    }
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
