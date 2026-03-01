import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware';
import {
    getContent, getContentSlug,
    postContent, patchContent, removeContent,
} from './cms.controller';

const router = Router();

// Public read endpoints
router.get('/cms/content', getContent);
router.get('/cms/content/:slug', getContentSlug);

// Admin write endpoints
router.post('/cms/content', authenticate, postContent);
router.patch('/cms/content/:id', authenticate, patchContent);
router.delete('/cms/content/:id', authenticate, removeContent);

export default router;
