import { Request, Response } from 'express';
import {
    listContent, getContentBySlug,
    createContent, updateContent, deleteContent,
} from './cms.service';
import { ContentType } from '@prisma/client';

export async function getContent(req: Request, res: Response): Promise<void> {
    try {
        const type = req.query.type as ContentType | undefined;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const data = await listContent(type, 'published', page, limit);
        res.json({ success: true, data });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function getContentSlug(req: Request, res: Response): Promise<void> {
    try {
        const item = await getContentBySlug(req.params.slug);
        if (!item) { res.status(404).json({ success: false, error: 'Not found' }); return; }
        res.json({ success: true, data: item });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function postContent(req: Request, res: Response): Promise<void> {
    try {
        const item = await createContent(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
}

export async function patchContent(req: Request, res: Response): Promise<void> {
    try {
        const item = await updateContent(req.params.id, req.body);
        res.json({ success: true, data: item });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
}

export async function removeContent(req: Request, res: Response): Promise<void> {
    try {
        await deleteContent(req.params.id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
}
