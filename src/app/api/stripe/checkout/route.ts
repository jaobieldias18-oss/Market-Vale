import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreatePrice, hasStripe } from "@/lib/stripe";
import type { PlanId } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const VALID_PLANS: PlanId[] = ["basico", "profissional", "premium"];

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "FaÃ§a login para assinar." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { plan_id?: string };
  const planId = body.plan_id;
  if (!planId || !VALID_PLANS.includes(planId as PlanId)) {
    return NextResponse.json({ error: "Plano invÃ¡lido." }, { status: 400 });
  }

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!store) {
    return NextResponse.json({ error: "Crie sua loja antes de assinar." }, { status: 400 });
  }

  if (!hasStripe()) {
    return NextResponse.json({ fallback: true });
  }

  const { stripe } = await import("@/lib/stripe");
  const client = stripe();
  const origin = new URL(request.url).origin;
  const priceId = await getOrCreatePrice(planId as PlanId);
  if (!priceId) {
    return NextResponse.json({ error: "NÃ£o foi possÃ­vel criar o preÃ§o do plano." }, { status: 500 });
  }

  let customer: string | undefined;
  if (user.email) {
    const existing = await client.customers.list({ email: user.email, limit: 10 });
    customer = existing.data.find((c) => !c.deleted)?.id ?? undefined;
  }

  const session = await client.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    ...(customer
      ? { customer }
      : { customer_creation: "always", customer_email: user.email ?? undefined }),
    metadata: { app: "marketvale", store_id: store.id, plan_id: planId },
    subscription_data: { metadata: { app: "marketvale", store_id: store.id, plan_id: planId } },
    success_url: `${origin}/dashboard/assinatura?sucesso=1`,
    cancel_url: `${origin}/dashboard/assinatura?cancelado=1`,
  });

  return NextResponse.json({ url: session.url });
}