import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

interface ProgramDetails {
  name: string;
  duration: string;
  booking_link: string | null;
  intake_form_link: string | null;
}

interface VariantDetails {
  name: string;
  session_count: number | null;
  duration_weeks: number | null;
}

async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("[Email] RESEND_API_KEY not configured");
    return false;
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
      console.error(
        `[Email] Resend API error (${resp.status}):`,
        JSON.stringify(data)
      );
      return false;
    }
    console.log(`[Email] Sent successfully to ${to}, id:`, data.id);
    return true;
  } catch (e) {
    console.error(`[Email] Fetch error sending to ${to}:`, e);
    return false;
  }
}

function buildSessionSummary(
  variant: VariantDetails | null,
  programDuration: string
): string {
  const parts: string[] = [];
  if (variant?.session_count) {
    parts.push(`${variant.session_count} session${variant.session_count > 1 ? "s" : ""}`);
  }
  if (variant?.duration_weeks) {
    parts.push(`${variant.duration_weeks} week${variant.duration_weeks > 1 ? "s" : ""}`);
  }
  if (parts.length === 0) {
    parts.push(programDuration);
  }
  return parts.join(" &middot; ");
}

function buildCustomerEmail(
  firstName: string,
  programName: string,
  variantName: string | null,
  sessionSummary: string,
  price: string,
  bookingLink: string | null,
  intakeFormLink: string | null
): string {
  const nextSteps: string[] = [];

  if (bookingLink) {
    nextSteps.push(`
      <tr>
        <td style="padding: 0 0 20px 0;">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                <span style="display: inline-block; width: 28px; height: 28px; background-color: #675C53; color: #ffffff; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px;">1</span>
              </td>
              <td style="vertical-align: top;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #1a1a1a; font-size: 16px;">Schedule Your First Session</p>
                <p style="margin: 0 0 10px 0; color: #555555; font-size: 15px;">Use this link to book a time that works for you:</p>
                <a href="${bookingLink}" style="display: inline-block; padding: 10px 24px; background-color: #675C53; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Book Your Session</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`);
  }

  if (intakeFormLink) {
    const stepNum = bookingLink ? "2" : "1";
    nextSteps.push(`
      <tr>
        <td style="padding: 0 0 20px 0;">
          <table role="presentation" style="width: 100%;">
            <tr>
              <td style="width: 36px; vertical-align: top; padding-top: 2px;">
                <span style="display: inline-block; width: 28px; height: 28px; background-color: #675C53; color: #ffffff; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px;">${stepNum}</span>
              </td>
              <td style="vertical-align: top;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #1a1a1a; font-size: 16px;">Complete Your Intake Form</p>
                <p style="margin: 0 0 10px 0; color: #555555; font-size: 15px;">This helps us understand your body, your goals, and where to begin.</p>
                <a href="${intakeFormLink}" style="display: inline-block; padding: 10px 24px; background-color: #675C53; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Fill Out Intake Form</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`);
  }

  const nextStepNum = (bookingLink ? 1 : 0) + (intakeFormLink ? 1 : 0) + 1;
  nextSteps.push(`
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%;">
          <tr>
            <td style="width: 36px; vertical-align: top; padding-top: 2px;">
              <span style="display: inline-block; width: 28px; height: 28px; background-color: #675C53; color: #ffffff; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px;">${nextStepNum}</span>
            </td>
            <td style="vertical-align: top;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #1a1a1a; font-size: 16px;">Get Ready for Real Change</p>
              <p style="margin: 0; color: #555555; font-size: 15px;">We'll meet you where you are and build a plan that actually works for your life &mdash; not against it.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`);

  const displayName = variantName ? `${programName} &mdash; ${variantName}` : programName;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: Georgia, 'Times New Roman', serif;">
  <table role="presentation" style="width: 100%; background-color: #f7f5f0;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background-color: #675C53; padding: 40px 40px 32px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: rgba(255,255,255,0.8); letter-spacing: 1px; text-transform: uppercase;">You're In</p>
              <h1 style="margin: 0; font-size: 26px; color: #ffffff; font-weight: 700; line-height: 1.3;">Let's begin your<br>Nourished Rebel journey</h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 36px 40px 0 40px;">
              <p style="margin: 0 0 12px 0; font-size: 18px; color: #1a1a1a; font-weight: 600;">Hi ${firstName},</p>
              <p style="margin: 0; font-size: 16px; color: #555555; line-height: 1.6;">You're in. And more importantly &mdash; you just made a powerful investment in your health.</p>
              <p style="margin: 12px 0 0 0; font-size: 16px; color: #555555; line-height: 1.6;">We're so glad you're here.</p>
            </td>
          </tr>

          <!-- Program Summary -->
          <tr>
            <td style="padding: 28px 40px 0 40px;">
              <table role="presentation" style="width: 100%; background-color: #F0EEEC; border-radius: 8px; border-left: 4px solid #675C53;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #675C53; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Program</p>
                    <p style="margin: 0 0 6px 0; font-size: 18px; color: #1a1a1a; font-weight: 700;">${displayName}</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #555555;">${sessionSummary}</p>
                    <p style="margin: 0; font-size: 16px; color: #675C53; font-weight: 700;">Total: ${price}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What Happens Next -->
          <tr>
            <td style="padding: 32px 40px 0 40px;">
              <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #1a1a1a; font-weight: 700;">What Happens Next</h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; color: #555555;">Here's exactly what to expect:</p>
              <table role="presentation" style="width: 100%;">
                ${nextSteps.join("")}
              </table>
            </td>
          </tr>

          <!-- What You're Stepping Into -->
          <tr>
            <td style="padding: 32px 40px 0 40px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #1a1a1a; font-weight: 700;">What You're Stepping Into</h2>
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #555555; line-height: 1.6;">This isn't a one-size-fits-all plan.</p>
              <p style="margin: 0 0 12px 0; font-size: 16px; color: #555555; line-height: 1.6;">Inside this program, you'll:</p>
              <table role="presentation" style="width: 100%;">
                <tr><td style="padding: 4px 0; font-size: 15px; color: #555555;">&#10003;&nbsp; Understand what your body actually needs</td></tr>
                <tr><td style="padding: 4px 0; font-size: 15px; color: #555555;">&#10003;&nbsp; Identify root causes (not just symptoms)</td></tr>
                <tr><td style="padding: 4px 0; font-size: 15px; color: #555555;">&#10003;&nbsp; Build sustainable habits that stick</td></tr>
                <tr><td style="padding: 4px 0; font-size: 15px; color: #555555;">&#10003;&nbsp; Feel more energy, clarity, and control</td></tr>
              </table>
            </td>
          </tr>

          <!-- Need Anything -->
          <tr>
            <td style="padding: 32px 40px 0 40px;">
              <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #1a1a1a; font-weight: 700;">Need Anything Before We Start?</h2>
              <p style="margin: 0; font-size: 16px; color: #555555; line-height: 1.6;">If you have questions or need help getting set up, just reply to this email &mdash; we're here for you.</p>
            </td>
          </tr>

          <!-- Sign Off -->
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 4px 0; font-size: 16px; color: #555555;">With love,</p>
              <p style="margin: 0; font-size: 16px; color: #1a1a1a; font-weight: 600;">The Nourished Rebel Team</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7f5f0; padding: 20px 40px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.5;">You're receiving this because you purchased a program from Nourished Rebel.<br>If you need support, contact us at <a href="mailto:nourishedrebel@gmail.com" style="color: #675C53;">nourishedrebel@gmail.com</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildOwnerEmail(
  customerName: string,
  customerEmail: string,
  programName: string,
  variantName: string | null,
  price: string,
  sessionId: string
): string {
  const displayName = variantName ? `${programName} - ${variantName}` : programName;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: Georgia, 'Times New Roman', serif;">
  <table role="presentation" style="width: 100%; background-color: #f7f5f0;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background-color: #675C53; padding: 24px 32px;">
              <h1 style="margin: 0; font-size: 22px; color: #ffffff;">New Purchase Alert</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 32px;">
              <table role="presentation" style="width: 100%;">
                <tr><td style="padding: 6px 0; font-size: 15px; color: #555;"><strong style="color: #1a1a1a;">Customer:</strong> ${customerName}</td></tr>
                <tr><td style="padding: 6px 0; font-size: 15px; color: #555;"><strong style="color: #1a1a1a;">Email:</strong> <a href="mailto:${customerEmail}" style="color: #675C53;">${customerEmail}</a></td></tr>
                <tr><td style="padding: 6px 0; font-size: 15px; color: #555;"><strong style="color: #1a1a1a;">Program:</strong> ${displayName}</td></tr>
                <tr><td style="padding: 6px 0; font-size: 15px; color: #555;"><strong style="color: #1a1a1a;">Amount:</strong> ${price}</td></tr>
                <tr><td style="padding: 6px 0; font-size: 15px; color: #555;"><strong style="color: #1a1a1a;">Session:</strong> <span style="font-size: 12px; color: #999;">${sessionId}</span></td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
      const firstName = customerName.split(" ")[0];

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
          console.log("No pending purchase to update, checking existing...");
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
          console.log("Purchase:", purchase.id, "| Status:", purchase.status);

          let program: ProgramDetails | null = null;
          let variant: VariantDetails | null = null;

          if (purchase.program_id) {
            const { data: pgm } = await supabase
              .from("programs")
              .select("name, duration, booking_link, intake_form_link")
              .eq("id", purchase.program_id)
              .maybeSingle();
            program = pgm;
          }

          if (purchase.variant_id) {
            const { data: v } = await supabase
              .from("program_variants")
              .select("name, session_count, duration_weeks")
              .eq("id", purchase.variant_id)
              .maybeSingle();
            variant = v;
          }

          const programName =
            program?.name ||
            purchase.program_snapshot?.program_name ||
            "Your Program";
          const variantName =
            variant?.name ||
            purchase.program_snapshot?.variant_name ||
            null;
          const price = `$${(session.amount_total ?? purchase.amount * 100) / 100}`;
          const sessionSummary = buildSessionSummary(
            variant,
            program?.duration || ""
          );

          if (customerEmail) {
            const customerHtml = buildCustomerEmail(
              firstName,
              programName,
              variantName,
              sessionSummary,
              price,
              program?.booking_link || null,
              program?.intake_form_link || null
            );

            const ownerHtml = buildOwnerEmail(
              customerName,
              customerEmail,
              programName,
              variantName,
              price,
              session.id
            );

            await sendEmail(
              customerEmail,
              `You're in! Let's begin your Nourished Rebel journey`,
              customerHtml
            );

            await sendEmail(
              "nourishedrebel@gmail.com",
              `New purchase: ${customerName} - ${programName}`,
              ownerHtml
            );
          } else {
            console.log("[Email] No customer email - skipping");
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
