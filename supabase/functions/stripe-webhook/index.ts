import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("[Email] RESEND_API_KEY not configured");
    return;
  }
  console.log(`[Email] Sending to ${to} | Subject: ${subject}`);
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Nourished Rebel <noreply@nourishedrebel.com>",
        to: [to],
        subject,
        html,
      }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      console.error(`[Email] Resend API error (${resp.status}):`, JSON.stringify(data));
    } else {
      console.log(`[Email] Sent successfully to ${to}, id:`, data.id);
    }
  } catch (e) {
    console.error(`[Email] Fetch error sending to ${to}:`, e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature",
      },
    });
  }

  try {
    console.log("=== Stripe Webhook Received ===");
    console.log("RESEND_API_KEY set:", !!Deno.env.get("RESEND_API_KEY"));

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event: Stripe.Event;
    if (webhookSecret && signature) {
      try {
        event = await stripe.webhooks.constructEventAsync(
          rawBody,
          signature,
          webhookSecret
        );
      } catch (err: any) {
        console.error("Signature verification failed:", err.message);
        return new Response(JSON.stringify({ error: err.message }), {
          status: 401,
        });
      }
    } else {
      console.log("WARNING: No signature/secret - skipping verification");
      event = JSON.parse(rawBody) as Stripe.Event;
    }

    console.log("Event type:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail =
        session.customer_details?.email ?? session.customer_email;
      const customerName = session.customer_details?.name ?? "there";

      console.log(
        "Session:",
        session.id,
        "| Email:",
        customerEmail,
        "| Payment:",
        session.payment_status
      );

      if (
        session.payment_status === "paid" ||
        session.payment_status === "no_payment_required"
      ) {
        const { data: updatedPurchase, error: updateError } = await supabase
          .from("program_purchases")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_checkout_session_id", session.id)
          .eq("status", "pending")
          .select()
          .maybeSingle();

        if (updateError) console.error("DB update error:", updateError);

        let purchase = updatedPurchase;
        if (!purchase) {
          console.log(
            "No pending purchase to update, checking for existing completed..."
          );
          const { data: existingPurchase, error: selectError } = await supabase
            .from("program_purchases")
            .select()
            .eq("stripe_checkout_session_id", session.id)
            .eq("status", "completed")
            .maybeSingle();

          if (selectError) console.error("DB select error:", selectError);
          purchase = existingPurchase;
        }

        if (!purchase) {
          console.log("No purchase found for session:", session.id);
        } else {
          console.log(
            "Purchase found (status:",
            purchase.status,
            "):",
            purchase.id
          );

          if (customerEmail) {
            await sendEmail(
              customerEmail,
              "Your Nourished Rebel purchase is confirmed!",
              `<h1>You're in, ${customerName}!</h1><p>Your purchase has been confirmed. We can't wait to support you on your wellness journey.</p><p>With love,<br>The Nourished Rebel Team</p>`
            );

            await sendEmail(
              "nourishedrebel@gmail.com",
              `New purchase: ${customerName}`,
              `<h1>New Purchase Alert</h1><p><strong>Customer:</strong> ${customerName} (${customerEmail})<br><strong>Amount:</strong> $${(session.amount_total ?? 0) / 100}<br><strong>Session:</strong> ${session.id}</p>`
            );
          } else {
            console.log(
              "[Email] No customer email found - skipping both emails"
            );
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
