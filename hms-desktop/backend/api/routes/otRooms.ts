import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  createOTRoom,
  getOTRooms,
  getOTRoomById,
  updateOTRoom,
  deleteOTRoom,
  getOTRoomStats,
} from '../controllers/otRoomController';

const router = Router();
router.use(authenticateToken);

router.get('/', getOTRooms);
router.get('/stats', getOTRoomStats);
router.get('/:id', getOTRoomById);
router.post('/', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST), createOTRoom);
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.DOCTOR, UserRole.RECEPTIONIST), updateOTRoom);
router.delete('/:id', requireRole(UserRole.ADMIN), deleteOTRoom);

export { router as otRoomRoutes };
