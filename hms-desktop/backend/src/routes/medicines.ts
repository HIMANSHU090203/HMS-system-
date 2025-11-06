import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { upload } from '../middleware/upload';
import {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  updateMedicineStock,
  deleteMedicine,
  getMedicineStats,
  getLowStockMedicines,
  getMedicineTransactions,
  importMedicineCatalog,
  createMedicineOrder,
  getMedicineOrders,
  updateOrderStatus,
  uploadInvoiceFile,
  getSuppliers,
  createSupplier,
} from '../controllers/medicineController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Medicine CRUD operations (Admin and Pharmacy only)
router.post('/', requireRole(UserRole.ADMIN, UserRole.PHARMACY), createMedicine);
router.get('/stats', requireRole(UserRole.ADMIN, UserRole.PHARMACY), getMedicineStats);
router.get('/low-stock', requireRole(UserRole.ADMIN, UserRole.PHARMACY), getLowStockMedicines);
router.get('/transactions', requireRole(UserRole.ADMIN, UserRole.PHARMACY), getMedicineTransactions);
router.get('/', requireRole(UserRole.ADMIN, UserRole.PHARMACY, UserRole.DOCTOR), getMedicines);
router.get('/:id', requireRole(UserRole.ADMIN, UserRole.PHARMACY, UserRole.DOCTOR), getMedicineById);
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.PHARMACY), updateMedicine);
router.patch('/:id/stock', requireRole(UserRole.ADMIN, UserRole.PHARMACY), updateMedicineStock);
router.delete('/:id', requireRole(UserRole.ADMIN, UserRole.PHARMACY), deleteMedicine);

// Enhanced functionality routes
router.post('/import', requireRole(UserRole.ADMIN, UserRole.PHARMACY), upload.single('file'), importMedicineCatalog);
router.post('/orders', requireRole(UserRole.ADMIN, UserRole.PHARMACY), createMedicineOrder);
router.get('/orders', requireRole(UserRole.ADMIN, UserRole.PHARMACY), getMedicineOrders);
router.put('/orders/:id/status', requireRole(UserRole.ADMIN, UserRole.PHARMACY), updateOrderStatus);
router.post('/orders/:orderId/invoice', requireRole(UserRole.ADMIN, UserRole.PHARMACY), upload.single('invoice'), uploadInvoiceFile);

// Supplier management routes
router.get('/suppliers', requireRole(UserRole.ADMIN, UserRole.PHARMACY), getSuppliers);
router.post('/suppliers', requireRole(UserRole.ADMIN, UserRole.PHARMACY), createSupplier);

export { router as medicineRoutes };
