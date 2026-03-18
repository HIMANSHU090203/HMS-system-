import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
  upsertMonthlySalaries,
} from '../controllers/expenseController';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

// Salary helper
router.put('/salaries/monthly', upsertMonthlySalaries);

export { router as expenseRoutes };

