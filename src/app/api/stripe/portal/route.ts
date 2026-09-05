import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Faça login para gerenciar." }, { status: 401 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe ainda não configurado." }, { status: 501 });
  }

  const admin = createAdminClient();
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  let customerId: string | null = null;
  if (store) {
    const { data: sub } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("store_id", store.id)
      .eq("provider", "stripe")
      .not("stripe_customer_id", "is", null)
      .maybeSingle();
    customerId = sub?.stripe_customer_id ?? null;
  }

  if (!customerId && user.email) {
    const { stripe } = await import("@/lib/stripe");
    const client = stripe();
    const { data } = await client.customers.list({ email: user.email, limit: 10 });
    const match =
      data.find((c) => c.metadata?.app === "marketvale") ??
      data.find((c) => c.metadata?.app) ??
      data[0];
    customerId = match?.id ?? null;
  }

  if (!customerId) {
    return NextResponse.json(
      { error: "Nenhuma assinatura encontrada. Assine um plano com cartão primeiro." },
      { status: 404 },
    );
  }

  const { stripe } = await import("@/lib/stripe");
  const client = stripe();
  const origin = new URL(request.url).origin;
  const session = await client.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/dashboard/assinatura?portal=1`,
  });

  return NextResponse.json({ url: session.url });
}