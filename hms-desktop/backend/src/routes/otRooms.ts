import { Router } from 'express';
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
router.post('/', requireRole('ADMIN', 'DOCTOR', 'RECEPTIONIST'), createOTRoom);
router.put('/:id', requireRole('ADMIN', 'DOCTOR', 'RECEPTIONIST'), updateOTRoom);
router.delete('/:id', requireRole('ADMIN'), deleteOTRoom);

export { router as otRoomRoutes };
