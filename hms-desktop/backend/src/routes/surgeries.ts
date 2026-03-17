import { Router } from 'express';
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
router.post('/', requireRole('ADMIN', 'DOCTOR', 'RECEPTIONIST'), createSurgery);
router.put('/:id', requireRole('ADMIN', 'DOCTOR', 'RECEPTIONIST'), updateSurgery);
router.delete('/:id', requireRole('ADMIN', 'DOCTOR', 'RECEPTIONIST'), deleteSurgery);

// Nested: team, pre-op, post-op, inventory
router.get('/:id/team', getSurgeryTeam);
router.post('/:id/team', requireRole('ADMIN', 'DOCTOR'), addSurgeryTeamMember);
router.delete('/:id/team/:userId', requireRole('ADMIN', 'DOCTOR'), removeSurgeryTeamMember);

router.get('/:id/pre-op-checklist', getPreOpChecklist);
router.put('/:id/pre-op-checklist', requireRole('ADMIN', 'DOCTOR', 'NURSE', 'NURSING_SUPERVISOR'), upsertPreOpChecklist);

router.get('/:id/post-op-record', getPostOpRecord);
router.put('/:id/post-op-record', requireRole('ADMIN', 'DOCTOR', 'NURSE', 'NURSING_SUPERVISOR'), upsertPostOpRecord);

router.get('/:id/inventory-usage', getSurgeryInventoryUsage);
router.post('/:id/inventory-usage', requireRole('ADMIN', 'DOCTOR', 'NURSE'), addSurgeryInventoryUsage);

export { router as surgeryRoutes };
