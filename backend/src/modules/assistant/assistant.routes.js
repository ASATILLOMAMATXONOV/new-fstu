import { Router } from 'express';
import requestsRoutes from './requests.routes.js';
import speechRoutes from './speech.routes.js';
import { createChatRouter } from './chat.routes.js';

const router = Router();
router.use('/requests', requestsRoutes);
router.use('/speech', speechRoutes);
router.use('/chat', createChatRouter());
export default router;
