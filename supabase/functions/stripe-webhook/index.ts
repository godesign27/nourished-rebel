import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  console.log("=== STRIPE WEBHOOK RECEIVED ===");
  console.log("Timestamp:", new Date().toISOString());

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const payload = await req.text();
    const signature = req.headers.get("stripe-signature");

    console.log("Payload length:", payload.length);
    console.log("Has signature:", !!signature);
    console.log("Has webhook secret:", !!webhookSecret);

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);
        console.log("Signature verified successfully");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Signature verification failed:", errorMessage);
        return new Response(
          JSON.stringify({ error: `Webhook signature verification failed: ${errorMessage}` }),
          { status: 401, headers: corsHeaders }
        );
      }
    } else {
      console.log("WARNING: Skipping signature verification (development mode)");
      event = JSON.parse(payload) as Stripe.Event;
    }

    console.log("Event type:", event.type);
    console.log("Event ID:", event.id);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("=== Processing checkout.session.completed ===");
        console.log("Session ID:", session.id);
        console.log("Payment Status:", session.payment_status);
        console.log("Payment Intent:", session.payment_intent);
        console.log("Customer Email:", session.customer_details?.email);
        console.log("Customer Name:", session.customer_details?.name);
        console.log("Metadata:", JSON.stringify(session.metadata));
        console.log("Client Reference ID:", session.client_reference_id);

        if (session.payment_status !== "paid") {
          console.log("Payment not yet complete, skipping update");
          break;
        }

        const { data: existingPurchase, error: fetchError } = await supabase
          .from("program_purchases")
          .select("id, status, stripe_event_id")
          .eq("stripe_checkout_session_id", session.id)
          .maybeSingle();

        console.log("Existing purchase lookup result:", JSON.stringify(existingPurchase));
        console.log("Fetch error:", JSON.stringify(fetchError));

        if (fetchError) {
          console.error("Failed to fetch purchase:", fetchError);
          throw fetchError;
        }

        if (!existingPurchase) {
          console.error("No purchase record found for session:", session.id);
          console.log("This could mean:");
          console.log("1. The checkout was created outside of our system");
          console.log("2. The purchase record was deleted");
          console.log("3. There's a session ID mismatch");
          break;
        }

        if (existingPurchase.status === "completed") {
          console.log("Purchase already completed, checking for duplicate webhook");
          if (existingPurchase.stripe_event_id === event.id) {
            console.log("Duplicate webhook event, skipping");
          } else {
            console.log("Different event ID but already completed, skipping");
          }
          break;
        }

        const updateData = {
          status: "completed",
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_event_id: event.id,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          customer_name: session.customer_details?.name || null,
          customer_email: session.customer_details?.email || null,
        };

        console.log("Updating purchase with data:", JSON.stringify(updateData));

        const { data: updatedPurchase, error: updateError } = await supabase
          .from("program_purchases")
          .update(updateData)
          .eq("stripe_checkout_session_id", session.id)
          .eq("status", "pending")
          .select("*, programs(name)")
          .maybeSingle();

        console.log("Update result:", JSON.stringify(updatedPurchase));
        console.log("Update error:", JSON.stringify(updateError));

        if (updateError) {
          console.error("Failed to update purchase:", updateError);
          throw updateError;
        }

        if (!updatedPurchase) {
          console.log("No rows updated - purchase may have been processed by concurrent webhook");
          break;
        }

        console.log("Purchase updated successfully:", updatedPurchase.id);

        const customerEmail =
          session.customer_details?.email || updatedPurchase.customer_email;
        const customerName =
          session.customer_details?.name ||
          updatedPurchase.customer_name ||
          "Valued Customer";
        const snapshot = updatedPurchase.program_snapshot as {
          program_name?: string;
          variant_name?: string;
        } | null;
        const programTitle =
          updatedPurchase.programs?.name || snapshot?.program_name || "Program";
        const variantName = snapshot?.variant_name;
        const fullProgramName = variantName
          ? `${programTitle} - ${variantName}`
          : programTitle;
        const amount = Number(updatedPurchase.amount).toFixed(2);

        console.log("Preparing to send emails");
        console.log("Customer email:", customerEmail);
        console.log("Program name:", fullProgramName);

        const customerEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4a5d4a 0%, #6b7b6b 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Your Purchase!</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px;">Hi ${customerName},</p>
              <p style="font-size: 16px;">Your payment has been confirmed for <strong>${fullProgramName}</strong>.</p>
              <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #4a5d4a;">Order Details</h3>
                <p style="margin: 8px 0;"><strong>Program:</strong> ${fullProgramName}</p>
                <p style="margin: 8px 0;"><strong>Amount Paid:</strong> $${amount} ${updatedPurchase.currency.toUpperCase()}</p>
                <p style="margin: 8px 0;"><strong>Order ID:</strong> ${updatedPurchase.id}</p>
              </div>
              <p style="font-size: 16px;">We're excited to have you on this journey!</p>
              <p style="font-size: 16px; margin-top: 30px;">Best regards,<br><strong>The Nourished Rebel Team</strong></p>
            </div>
          </body>
          </html>
        `;

        const adminEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
            <h2 style="color: #4a5d4a;">New Program Purchase</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Customer Details</h3>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
            </div>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
              <h3 style="margin-top: 0;">Purchase Details</h3>
              <p><strong>Program:</strong> ${fullProgramName}</p>
              <p><strong>Amount:</strong> $${amount} ${updatedPurchase.currency.toUpperCase()}</p>
              <p><strong>Order ID:</strong> ${updatedPurchase.id}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}</p>
            </div>
          </body>
          </html>
        `;

        if (customerEmail) {
          try {
            console.log("=== SENDING CUSTOMER EMAIL ===");
            console.log("Email endpoint:", `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`);
            const customerEmailPayload = {
              to: customerEmail,
              subject: `Purchase Confirmation - ${fullProgramName}`,
              html: customerEmailHtml,
            };
            console.log("Customer email payload:", JSON.stringify({
              to: customerEmailPayload.to,
              subject: customerEmailPayload.subject,
              htmlLength: customerEmailPayload.html.length,
            }));
            const customerEmailResponse = await fetch(
              `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(customerEmailPayload),
              }
            );

            const customerEmailResult = await customerEmailResponse.json();
            console.log("Customer email response status:", customerEmailResponse.status);
            console.log("Customer email result:", JSON.stringify(customerEmailResult));

            if (!customerEmailResponse.ok) {
              console.error("Customer email failed:", customerEmailResult);
            } else {
              console.log("Customer confirmation email sent successfully");
            }
          } catch (emailError) {
            console.error("Failed to send customer email:", emailError);
          }
        } else {
          console.log("No customer email available, skipping customer notification");
        }

        try {
          console.log("=== SENDING ADMIN EMAIL ===");
          const adminEmailPayload = {
            to: "nourishedrebel@gmail.com",
            subject: `New Purchase: ${fullProgramName} - ${customerName}`,
            html: adminEmailHtml,
          };
          console.log("Admin email payload:", JSON.stringify({
            to: adminEmailPayload.to,
            subject: adminEmailPayload.subject,
            htmlLength: adminEmailPayload.html.length,
          }));
          const adminEmailResponse = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(adminEmailPayload),
            }
          );

          const adminEmailResult = await adminEmailResponse.json();
          console.log("Admin email response status:", adminEmailResponse.status);
          console.log("Admin email result:", JSON.stringify(adminEmailResult));

          if (!adminEmailResponse.ok) {
            console.error("Admin email failed:", adminEmailResult);
          } else {
            console.log("Admin notification email sent successfully");
          }
        } catch (emailError) {
          console.error("Failed to send admin email:", emailError);
        }

        const { error: emailFlagError } = await supabase
          .from("program_purchases")
          .update({ emails_sent: true, updated_at: new Date().toISOString() })
          .eq("id", updatedPurchase.id);

        if (emailFlagError) {
          console.error("Failed to update email flag:", emailFlagError);
        }

        console.log("=== checkout.session.completed processing complete ===");
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Processing checkout.session.expired for:", session.id);

        const { error } = await supabase
          .from("program_purchases")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_checkout_session_id", session.id)
          .eq("status", "pending");

        if (error) {
          console.error("Failed to update expired purchase:", error);
        } else {
          console.log("Marked purchase as failed for expired session");
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log("Processing charge.refunded for payment intent:", charge.payment_intent);

        const { error } = await supabase
          .from("program_purchases")
          .update({
            status: "refunded",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", charge.payment_intent);

        if (error) {
          console.error("Failed to update refunded purchase:", error);
        } else {
          console.log("Marked purchase as refunded");
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Processing payment_intent.payment_failed:", paymentIntent.id);
        console.log("Failure reason:", paymentIntent.last_payment_error?.message);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("=== WEBHOOK ERROR ===");
    console.error("Error:", error);
    console.error("Stack:", error instanceof Error ? error.stack : "No stack");

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Webhook processing failed",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
