import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  createSurgery,
  getSurgeries,
  getSurgeryById,
  updateSurgery,
  deleteSurgery,
  getSurgeryStats,
  getSurgeryTeam,
  addSurgeryTeamMember,
  removeSurgeryTeamMember,
  getPreOpChecklist,
  upsertPreOpChecklist,
  getPostOpRecord,
  upsertPostOpRecord,
  getSurgeryInventoryUsage,
  addSurgeryInventoryUsage,
} from '../controllers/surgeryController';

const router = Router();
router.use(authenticateToken);

router.get('/stats', getSurgeryStats);
router.get('/', getSurgeries);
router.get('/:id', getSurgeryById);
router.post('/', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST), createSurgery);
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST), updateSurgery);
router.delete('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST), deleteSurgery);

// Nested: team, pre-op, post-op, inventory
router.get('/:id/team', getSurgeryTeam);
router.post('/:id/team', requireRole(UserRole.ADMIN, UserRole.DOCTOR), addSurgeryTeamMember);
router.delete('/:id/team/:userId', requireRole(UserRole.ADMIN, UserRole.DOCTOR), removeSurgeryTeamMember);

router.get('/:id/pre-op-checklist', getPreOpChecklist);
router.put('/:id/pre-op-checklist', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSING_SUPERVISOR), upsertPreOpChecklist);

router.get('/:id/post-op-record', getPostOpRecord);
router.put('/:id/post-op-record', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSING_SUPERVISOR), upsertPostOpRecord);

router.get('/:id/inventory-usage', getSurgeryInventoryUsage);
router.post('/:id/inventory-usage', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE), addSurgeryInventoryUsage);

export { router as surgeryRoutes };
