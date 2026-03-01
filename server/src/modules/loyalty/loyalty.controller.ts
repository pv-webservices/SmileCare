import { Request, Response } from 'express';
import {
    getLoyaltyBalance,
    getLoyaltyHistory,
    redeemPoints,
} from './loyalty.service';

export async function getBalance(req: Request, res: Response): Promise<void> {
    try {
        const patientId = (req as any).user.patientId || (req as any).user.id;
        const balance = await getLoyaltyBalance(patientId);
        res.json({ success: true, data: { balance } });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function getHistory(req: Request, res: Response): Promise<void> {
    try {
        const patientId = (req as any).user.patientId || (req as any).user.id;
        const history = await getLoyaltyHistory(patientId);
        res.json({ success: true, data: history });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function postRedeem(req: Request, res: Response): Promise<void> {
    try {
        const patientId = (req as any).user.patientId || (req as any).user.id;
        const { points, reason } = req.body;
        const result = await redeemPoints(patientId, points, reason || 'Redeemed');
        if (!result.success) {
            res.status(400).json({ success: false, error: result.message });
            return;
        }
        res.json({ success: true, message: result.message });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
}
