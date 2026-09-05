import Stripe from "stripe";
import type { PlanId } from "@/lib/types";

export function hasStripe(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY não configurada.");
  }
  return new Stripe(key);
}

const priceCache = new Map<string, string>();

export async function getOrCreatePrice(
  planId: PlanId,
  priceMonthly: number,
  name?: string,
): Promise<string | null> {
  const cacheKey = `${planId}:${priceMonthly}`;
  const cached = priceCache.get(cacheKey);
  if (cached) return cached;

  const client = stripe();
  const productMetaId = `marketvale-plan-${planId}`;

  let product: Stripe.Product | undefined;
  const existing = await client.products.list({ active: true, limit: 100 });
  product = existing.data.find((p) => p.metadata?.marketvale_id === productMetaId);

  if (!product) {
    product = await client.products.create({
      name: `Market Vale · ${name ?? planId}`,
      metadata: { marketvale_id: productMetaId },
    });
  }

  const amount = Math.round(Number(priceMonthly) * 100);
  const prices = await client.prices.list({ product: product.id, active: true, limit: 100 });
  const match = prices.data.find(
    (p) =>
      p.recurring?.interval === "month" &&
      p.unit_amount === amount &&
      p.currency === "brl",
  );
  if (match) {
    priceCache.set(cacheKey, match.id);
    return match.id;
  }

  const created = await client.prices.create({
    product: product.id,
    unit_amount: amount,
    currency: "brl",
    recurring: { interval: "month" },
  });
  priceCache.set(cacheKey, created.id);
  return created.id;
}

export async function resolvePlanFromSubscription(
  subscription: Stripe.Subscription,
): Promise<PlanId | null> {
  const client = stripe();
  const priceItem = subscription.items?.data?.[0]?.price;
  if (!priceItem) return null;
  try {
    const price = await client.prices.retrieve(priceItem.id);
    const product = await client.products.retrieve(String(price.product));
    const metaId = product.metadata?.marketvale_id ?? "";
    const planId = metaId.replace("marketvale-plan-", "") as PlanId;
    return ["basico", "profissional", "premium"].includes(planId) ? planId : null;
  } catch {
    return null;
  }
}

export function renewsAtFromSubscription(subscription: Stripe.Subscription): string | null {
  const end = subscription.items?.data?.[0]?.current_period_end;
  return end ? new Date(end * 1000).toISOString() : null;
}