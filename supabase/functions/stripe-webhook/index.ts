// Receives Stripe events and grants the season pass after a successful payment.
// Register this URL in Stripe > Developers > Webhooks for the events:
//   checkout.session.completed, checkout.session.async_payment_succeeded
import Stripe from 'npm:stripe@17.7.0';
import { admin } from '../_shared/auth.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature') ?? '';
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')!, undefined, cryptoProvider,
    );
  } catch (e) {
    return new Response(`Signature check failed: ${(e as Error).message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const s = event.data.object as Stripe.Checkout.Session;
    const userId = s.client_reference_id ?? s.metadata?.user_id;
    if (s.payment_status === 'paid' && userId) {
      const { error } = await admin.from('entitlements').upsert({
        user_id: userId,
        product: Deno.env.get('PASS_PRODUCT') ?? 'saisonpass-2027',
        valid_until: Deno.env.get('PASS_VALID_UNTIL') ?? '2027-07-31T21:59:59Z',
        stripe_session_id: s.id,
        amount_total: s.amount_total,
        currency: s.currency,
      }, { onConflict: 'stripe_session_id' });
      if (error) {
        console.error('entitlement upsert', error);
        return new Response('Database error', { status: 500 }); // Stripe retries automatically
      }
    }
  }
  return new Response('ok');
});
