import { Router } from 'express';
import * as ctrl from '../controllers/mail.js';

const router = Router();
router.post('/send', ctrl.send);

export default router;
