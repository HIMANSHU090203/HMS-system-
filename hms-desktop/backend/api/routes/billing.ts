import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,
  getBillingStats,
  generateInvoice,
} from '../controllers/billingController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Billing CRUD operations
router.post('/', createBill);
router.get('/stats', getBillingStats); // Moved before /:id
router.get('/:id/invoice', generateInvoice); // Moved before /:id
router.get('/', getBills);
router.get('/:id', getBillById);
router.put('/:id', updateBill);
router.delete('/:id', deleteBill);

export { router as billingRoutes };
