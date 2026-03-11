import { createCheckoutSession } from '../services/stripe.js';
import { stripe } from '../config/stripe.js';

export async function checkoutSession(req, res) {
  try {
    const { priceId: bodyPriceId, successUrl, cancelUrl, mode } = req.body ?? {};
    const priceId = bodyPriceId || process.env.STRIPE_PRICE_BASICO?.trim();
    if (!successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'successUrl y cancelUrl son requeridos' });
    }
    if (!priceId) {
      return res.status(400).json({
        error:
          'Falta priceId o STRIPE_PRICE_BASICO en backend/.env (Price ID price_... del producto Basico en Stripe).',
      });
    }
    if (priceId.startsWith('prod_')) {
      return res.status(400).json({
        error:
          'Usa el Price ID (price_...), no el Product ID (prod_...). En Stripe: Product catalog → Basico → clic en el precio → copiar price_...',
      });
    }
    const data = await createCheckoutSession({ priceId, successUrl, cancelUrl, mode });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

/**
 * Webhook: configurar STRIPE_WEBHOOK_SECRET y endpoint en Dashboard.
 * Express debe recibir body raw en esta ruta.
 */
export async function webhook(req, res) {
  if (!stripe) return res.status(500).send('Stripe no configurado');
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(500).send('STRIPE_WEBHOOK_SECRET no configurado');

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // Aquí: marcar orden pagada, activar suscripción, etc.
      break;
    default:
      break;
  }
  res.json({ received: true });
}
