import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bills endpoint - to be implemented',
    data: [],
  });
});

export { router as billRoutes };
