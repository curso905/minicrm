import { Router } from 'express';
import * as ctrl from '../controllers/chat.js';

const router = Router();
router.post('/', ctrl.reply);

export default router;
