import { Router } from 'express';
import * as ctrl from '../controllers/email.js';

const router = Router();
router.post('/send', ctrl.send);

export default router;
