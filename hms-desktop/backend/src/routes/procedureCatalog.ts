import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  createProcedure,
  getProcedures,
  getProcedureById,
  updateProcedure,
  deleteProcedure,
} from '../controllers/procedureCatalogController';

const router = Router();
router.use(authenticateToken);

router.get('/', getProcedures);
router.get('/:id', getProcedureById);
router.post('/', requireRole('ADMIN', 'DOCTOR'), createProcedure);
router.put('/:id', requireRole('ADMIN', 'DOCTOR'), updateProcedure);
router.delete('/:id', requireRole('ADMIN'), deleteProcedure);

export { router as procedureCatalogRoutes };
