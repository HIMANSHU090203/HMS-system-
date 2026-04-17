import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Prisma client
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// Test middleware imports
try {
  const { errorHandler } = require('./middleware/errorHandler');
  const { requestLogger } = require('./middleware/requestLogger');
  
  // Add middleware
  app.use(requestLogger);
  app.use(errorHandler);
  
  console.log('✅ Middleware added successfully');
} catch (error) {
  console.error('❌ Middleware failed:', error.message);
}

// Test route imports one by one
const routes = [
  { name: 'auth', exportName: 'authRoutes', path: '/api/auth' },
  { name: 'users', exportName: 'userRoutes', path: '/api/users' },
  { name: 'patients', exportName: 'patientRoutes', path: '/api/patients' },
  { name: 'appointments', exportName: 'appointmentRoutes', path: '/api/appointments' },
  { name: 'consultations', exportName: 'consultationRoutes', path: '/api/consultations' },
  { name: 'prescriptions', exportName: 'prescriptionRoutes', path: '/api/prescriptions' },
  { name: 'labTests', exportName: 'labTestRoutes', path: '/api/lab-tests' },
  { name: 'medicines', exportName: 'medicineRoutes', path: '/api/medicines' },
  { name: 'bills', exportName: 'billRoutes', path: '/api/bills' },
  { name: 'audit', exportName: 'auditRoutes', path: '/api/audit' },
  { name: 'config', exportName: 'configRoutes', path: '/api/config' },
];

routes.forEach(route => {
  try {
    const routeModule = require(`./routes/${route.name}`);
    const routeHandler = routeModule[route.exportName];
    app.use(route.path, routeHandler);
    console.log(`✅ ${route.name} routes mounted successfully`);
  } catch (error) {
    console.error(`❌ ${route.name} routes failed:`, error.message);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});
