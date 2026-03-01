import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware';
import { getBalance, getHistory, postRedeem } from './loyalty.controller';

const router = Router();
router.use(authenticate);

// GET  /api/loyalty/balance
router.get('/loyalty/balance', getBalance);
// GET  /api/loyalty/history
router.get('/loyalty/history', getHistory);
// POST /api/loyalty/redeem  { points: number, reason?: string }
router.post('/loyalty/redeem', postRedeem);

export default router;
