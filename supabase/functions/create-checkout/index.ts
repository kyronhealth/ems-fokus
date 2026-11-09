// Starts a Stripe Checkout payment for the season pass (CHF, TWINT and cards).
// Payment methods come from the Stripe dashboard: switch on TWINT and cards there.
import Stripe from 'npm:stripe@17.7.0';
import { cors, json } from '../_shared/cors.ts';
import { getUser, hasAccess } from '../_shared/auth.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const user = await getUser(req);
    if (!user) return json({ error: 'Bitte melde dich zuerst an.' }, 401);
    if (await hasAccess(user.id)) return json({ error: 'Du hast bereits einen gültigen Saisonpass.' }, 409);

    const appUrl = Deno.env.get('APP_URL')!;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: Deno.env.get('STRIPE_PRICE_ID')!, quantity: 1 }],
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: { user_id: user.id },
      locale: 'de',
      allow_promotion_codes: true,
      success_url: `${appUrl}/danke?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/kaufen`,
    });
    return json({ url: session.url });
  } catch (e) {
    console.error('create-checkout', e);
    return json({ error: 'Die Zahlung konnte nicht gestartet werden. Bitte versuch es nochmals.' }, 500);
  }
});
