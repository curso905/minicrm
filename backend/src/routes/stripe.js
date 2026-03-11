import { Router } from 'express';
import * as ctrl from '../controllers/stripe.js';

const router = Router();
router.post('/checkout-session', ctrl.checkoutSession);

export default router;
