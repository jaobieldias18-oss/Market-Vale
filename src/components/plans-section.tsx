"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { PLANS } from "@/lib/constants";
import type { Store } from "@/lib/types";
import { Check, CreditCard, ExternalLink } from "lucide-react";

const FEATURED: Record<string, string> = {
  basico: "ed",
  profissional: "bg-emerald-600 text-white shadow-xl",
  premium: "bg-slate-900 text-white shadow-xl",
};

export default function PlansSection({ store }: { store: Store }) {
  return (
    <Suspense>
      <PlansSectionInner store={store} />
    </Suspense>
  );
}

function PlansSectionInner({ store }: { store: Store }) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const flag =
    searchParams.get("sucesso") === "1"
      ? "success"
      : searchParams.get("cancelado") === "1"
        ? "canceled"
        : searchParams.get("portal") === "1"
          ? "portal"
          : null;

  async function manualSelect(planId: string) {
    setMsg(null);
    const supabase = createClient();
    await supabase
      .from("subscriptions")
      .insert({
        store_id: store.id,
        plan_id: planId,
        status: "active",
        provider: "manual",
      });
    const { error } = await supabase.from("stores").update({ plan_id: planId }).eq("id", store.id);
    if (error) setMsg("Não foi possível alterar o plano.");
    else setMsg(`Plano atualizado! Agora você está no plano ${PLANS.find((p) => p.id === planId)?.name}.`);
  }

  async function subscribe(planId: string) {
    setLoading(planId);
    setMsg(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      });
      const data = (await res.json()) as { url?: string; fallback?: boolean; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.fallback) {
        await manualSelect(planId);
        setLoading(null);
        return;
      }
      setMsg(data.error ?? "Não foi possível iniciar o pagamento.");
    } catch {
      setMsg("Erro de conexão. Tente novamente.");
    }
    setLoading(null);
  }

  async function openPortal() {
    setPortalLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setMsg(data.error ?? "Não foi possível abrir o gerenciamento da assinatura.");
    } catch {
      setMsg("Erro de conexão. Tente novamente.");
    }
    setPortalLoading(false);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Escolha o plano ideal</h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-500">
          Preço por mês, cobrado no cartão via Stripe. Você pode cancelar ou
          trocar de plano quando quiser.
        </p>
      </div>

      {flag === "success" && (
        <p className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
          <Check className="size-4" /> Pagamento confirmado! Seu plano já está ativo.
        </p>
      )}
      {flag === "canceled" && (
        <p className="mx-auto mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
          Pagamento cancelado. Nenhuma cobrança foi feita.
        </p>
      )}
      {flag === "portal" && (
        <p className="mx-auto mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
          Assinatura atualizada com sucesso.
        </p>
      )}

      {msg && (
        <p className="mx-auto mt-6 max-w-md rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
          {msg}
        </p>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = store.plan_id === plan.id;
          const price = Number(plan.price_monthly);
          return (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl border p-6 ${
                isCurrent
                  ? "border-emerald-500 ring-2 ring-emerald-200"
                  : "border-slate-200 bg-white"
              } ${FEATURED[plan.id] ?? ""}`}
            >
              {plan.id === "profissional" && (
                <span className="mb-3 inline-flex w-fit rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950">
                  MAIS POPULAR
                </span>
              )}
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="mt-2 text-3xl font-extrabold">
                {formatPrice(price)}
                <span className="text-sm font-medium">/mês</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {(plan.features as string[]).map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => subscribe(plan.id)}
                disabled={loading === plan.id}
                className={`mt-6 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                  isCurrent
                    ? "border border-emerald-500 text-emerald-600"
                    : FEATURED[plan.id] === "ed"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : plan.id === "premium"
                        ? "bg-white text-slate-900 hover:bg-slate-100"
                        : "border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                <CreditCard className="size-4" />
                {loading === plan.id
                  ? "Redirecionando..."
                  : isCurrent
                    ? "Plano atual"
                    : "Assinar com cartão"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={openPortal}
          disabled={portalLoading}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700 disabled:opacity-60"
        >
          <ExternalLink className="size-4" />
          {portalLoading ? "Abrindo..." : "Gerenciar assinatura no Stripe"}
        </button>
        <p className="mt-3 text-xs text-slate-400">
          No painel do Stripe você vê faturas, troca de cartão e faz upgrade/downgrade.
        </p>
      </div>

      <p className="mt-10 text-center text-xs text-slate-400">
        Faturas mensais são emitidas automaticamente (Stripe Billing/Invoicing). Cobrança recorrente no cartão.
      </p>
    </div>
  );
}