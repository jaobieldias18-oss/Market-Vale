import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasStripe, stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Permissão negada." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { subscription_id?: string };
  if (!body.subscription_id) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", body.subscription_id)
    .maybeSingle();
  if (!sub) {
    return NextResponse.json({ error: "Assinatura não encontrada." }, { status: 404 });
  }

  if (sub.status === "canceled") {
    return NextResponse.json({ ok: true });
  }

  if (sub.stripe_subscription_id && hasStripe()) {
    try {
      await stripe().subscriptions.cancel(sub.stripe_subscription_id);
    } catch {
      // segue com o cancelamento local mesmo se o Stripe falhar
    }
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("id", sub.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("stores").update({ plan_id: "basico" }).eq("id", sub.store_id);

  return NextResponse.json({ ok: true });
}