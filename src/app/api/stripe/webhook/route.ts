import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe, resolvePlanFromSubscription, renewsAtFromSubscription } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const encoder = new TextEncoder();

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
): Promise<Stripe.Event | null> {
  const parts = signature.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const signatureHex = parts.find((p) => p.startsWith("v1="))?.slice(3);
  if (!timestamp || !signatureHex) return null;

  const tolerance = 300;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(timestamp)) > tolerance) return null;

  const cryptoImpl = globalThis.crypto;
  if (!cryptoImpl?.subtle) return null;

  try {
    const key = await cryptoImpl.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const mac = await cryptoImpl.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${timestamp}.${body}`),
    );
    const expected = toHex(new Uint8Array(mac));

    if (expected.length === signatureHex.length) {
      let diff = 0;
      for (let i = 0; i < expected.length; i++) {
        diff |= expected.charCodeAt(i) ^ signatureHex.charCodeAt(i);
      }
      if (diff === 0) {
        return JSON.parse(body) as Stripe.Event;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "WEBHOOK_SECRET não configurado." }, { status: 501 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY não configurada." }, { status: 501 });
  }

  const client = stripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  const event = await verifyWebhookSignature(body, signature, secret);
  if (!event) {
    return NextResponse.json({ error: "Falha na verificação da assinatura do webhook." }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const storeId = session.metadata?.store_id ?? null;
      const planId = session.metadata?.plan_id ?? null;
      const subscriptionId = session.subscription ? String(session.subscription) : null;
      const customerId = session.customer ? String(session.customer) : null;

      if (storeId && planId && subscriptionId) {
        let renewsAt: string | null = null;
        try {
          const sub = await client.subscriptions.retrieve(subscriptionId);
          renewsAt = renewsAtFromSubscription(sub);
        } catch {
          renewsAt = null;
        }

        await admin.from("subscriptions").upsert(
          {
            store_id: storeId,
            plan_id: planId,
            status: "active",
            provider: "stripe",
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            started_at: new Date().toISOString(),
            renews_at: renewsAt,
          },
          { onConflict: "stripe_subscription_id" },
        );
        await admin.from("stores").update({ plan_id: planId }).eq("id", storeId);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const active = sub.status === "active";
      const renewsAt = renewsAtFromSubscription(sub);

      let planId: string | null = null;
      try {
        planId = await resolvePlanFromSubscription(sub);
      } catch {
        planId = null;
      }

      const patch: Record<string, unknown> = {
        status: active ? "active" : "canceled",
      };
      if (renewsAt) patch.renews_at = renewsAt;
      if (planId) patch.plan_id = planId;

      await admin
        .from("subscriptions")
        .update(patch)
        .eq("stripe_subscription_id", sub.id);

      const customerId = sub.customer ? String(sub.customer) : null;
      let storeId: string | null = null;

      const { data: bySub } = await admin
        .from("subscriptions")
        .select("store_id")
        .eq("stripe_subscription_id", sub.id)
        .maybeSingle();
      storeId = bySub?.store_id ?? null;

      if (!storeId && customerId) {
        const { data: byCustomer } = await admin
          .from("subscriptions")
          .select("store_id")
          .eq("stripe_customer_id", customerId)
          .eq("stripe_subscription_id", sub.id)
          .maybeSingle();
        storeId = byCustomer?.store_id ?? null;
      }

      if (storeId) {
        await admin
          .from("stores")
          .update({ plan_id: active ? planId ?? "basico" : "basico" })
          .eq("id", storeId);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}