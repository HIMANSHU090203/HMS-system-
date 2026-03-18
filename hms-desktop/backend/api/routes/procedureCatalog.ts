import { Router } from 'express';
import { UserRole } from '@prisma/client';
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
router.post('/', requireRole(UserRole.ADMIN, UserRole.DOCTOR), createProcedure);
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR), updateProcedure);
router.delete('/:id', requireRole(UserRole.ADMIN), deleteProcedure);

export { router as procedureCatalogRoutes };
