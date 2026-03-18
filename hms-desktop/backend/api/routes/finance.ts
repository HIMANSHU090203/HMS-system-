import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { getProfitLoss } from '../controllers/financeController';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/pl', getProfitLoss);

export { router as financeRoutes };

