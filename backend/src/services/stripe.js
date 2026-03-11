import { stripe } from '../config/stripe.js';

/**
 * Crea una sesión de Checkout (pago único o suscripción).
 * priceId: id de precio desde Stripe Dashboard → Product catalog
 */
export async function createCheckoutSession({ priceId, successUrl, cancelUrl, mode = 'payment' }) {
  if (!stripe) throw new Error('Stripe no configurado');
  const session = await stripe.checkout.sessions.create({
    mode, // 'payment' | 'subscription'
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return { url: session.url, id: session.id };
}
