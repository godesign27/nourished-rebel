import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckoutRequest {
  programId: string;
  variantId?: string;
  successUrl: string;
  cancelUrl: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const body = await req.json();
    console.log("Request body:", JSON.stringify(body));

    const { programId, variantId, successUrl, cancelUrl }: CheckoutRequest = body;

    if (!programId || !successUrl || !cancelUrl) {
      throw new Error(`Missing required fields: programId=${programId}, successUrl=${!!successUrl}, cancelUrl=${!!cancelUrl}`);
    }

    console.log("Looking up program:", programId);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: program, error: programError } = await supabaseAdmin
      .from("programs")
      .select("*")
      .eq("id", programId)
      .maybeSingle();

    if (programError) {
      console.error("Program query error:", programError);
      throw new Error(`Program query failed: ${programError.message}`);
    }

    if (!program) {
      throw new Error(`Program not found with id: ${programId}`);
    }

    console.log("Program found:", program.name, "Price:", program.price);

    let variant = null;
    let price = program.price;
    let itemName = program.name;

    if (variantId) {
      console.log("Looking up variant:", variantId);
      const { data: variantData, error: variantError } = await supabaseAdmin
        .from("program_variants")
        .select("*")
        .eq("id", variantId)
        .maybeSingle();

      if (variantError) {
        console.error("Variant query error:", variantError);
        throw new Error(`Variant query failed: ${variantError.message}`);
      }

      if (!variantData) {
        throw new Error(`Variant not found with id: ${variantId}`);
      }

      variant = variantData;
      price = variant.price;
      itemName = `${program.name} - ${variant.name}`;
      console.log("Variant found:", variant.name, "Price:", price);
    }

    console.log("Final price to charge:", price, "Type:", typeof price);

    if (!price || Number(price) <= 0) {
      throw new Error(`Invalid price: ${price}`);
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Stripe is not configured");
    }

    const amountInCents = Math.round(Number(price) * 100);

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": "payment",
        "success_url": successUrl,
        "cancel_url": cancelUrl,
        "customer_email": user.email || "",
        "client_reference_id": user.id,
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][product_data][name]": itemName,
        "line_items[0][price_data][product_data][description]": program.summary || "",
        "line_items[0][price_data][unit_amount]": amountInCents.toString(),
        "line_items[0][quantity]": "1",
        "metadata[program_id]": programId,
        "metadata[variant_id]": variantId || "",
        "metadata[user_id]": user.id,
      }),
    });

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text();
      console.error("Stripe error:", errorText);
      let errorMessage = "Failed to create checkout session";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const session = await stripeResponse.json();

    const { error: purchaseError } = await supabaseAdmin
      .from("program_purchases")
      .insert({
        auth_user_id: user.id,
        program_id: programId,
        variant_id: variantId || null,
        stripe_checkout_session_id: session.id,
        status: "pending",
        amount: price,
        currency: "usd",
        customer_email: user.email || "",
        program_snapshot: {
          program_name: program.name,
          variant_name: variant?.name || null,
          program_summary: program.summary,
        },
      });

    if (purchaseError) {
      console.error("Failed to create purchase record:", purchaseError);
    }

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred",
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
