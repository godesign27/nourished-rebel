import Stripe from 'https://esm.sh/stripe@17?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno';
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature' },
    });
  }
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  let event: Stripe.Event;
  if (webhookSecret && signature) {
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.error('Signature verification failed:', err.message);
      return new Response(JSON.stringify({ error: err.message }), { status: 401 });
    }
  } else {
    console.log('WARNING: No signature/secret — skipping verification');
    event = JSON.parse(rawBody) as Stripe.Event;
  }
  console.log('Event type:', event.type);
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail = session.customer_details?.email ?? session.customer_email;
    const customerName = session.customer_details?.name ?? 'there';
    console.log('Session:', session.id, '| Email:', customerEmail, '| Payment:', session.payment_status);
    if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
      const { data: purchase, error: dbError } = await supabase
        .from('program_purchases')
        .update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('stripe_checkout_session_id', session.id)
        .eq('status', 'pending')
        .select()
        .maybeSingle();
      if (dbError) console.error('DB error:', dbError);
      else if (!purchase) console.log('No pending purchase found for session:', session.id);
      else {
        console.log('Purchase completed:', purchase.id);
        console.log('[Email] customerEmail value:', customerEmail);
        if (customerEmail) {
          try {
            const custResp = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: customerEmail,
                subject: 'Your Nourished Rebel purchase is confirmed!',
                html: `<h1>You're in, ${customerName}!</h1><p>Your purchase has been confirmed. We can't wait to support you on your wellness journey.</p><p>With love,<br>The Nourished Rebel Team</p>`,
              }),
            });
            const custResult = await custResp.json();
            console.log('[Email-Customer] Status:', custResp.status, JSON.stringify(custResult));
          } catch (e) { console.error('[Email-Customer] Error:', e); }
          try {
            const ownerResp = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: 'nourishedrebel@gmail.com',
                subject: `New purchase: ${customerName}`,
                html: `<h1>New Purchase Alert</h1><p><strong>Customer:</strong> ${customerName} (${customerEmail})<br><strong>Amount:</strong> $${(session.amount_total ?? 0) / 100}<br><strong>Session:</strong> ${session.id}</p>`,
              }),
            });
            const ownerResult = await ownerResp.json();
            console.log('[Email-Owner] Status:', ownerResp.status, JSON.stringify(ownerResult));
          } catch (e) { console.error('[Email-Owner] Error:', e); }
        } else {
          console.log('[Email] No customer email found — skipping both emails');
        }
      }
    }
  }
  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } });
});
