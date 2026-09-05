"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { PLANS } from "@/lib/constants";
import type { Store } from "@/lib/types";
import { Check } from "lucide-react";

const FEATURED: Record<string, string> = {
  basico: "ed",
  profissional: "bg-emerald-600 text-white shadow-xl",
  premium: "bg-slate-900 text-white shadow-xl",
};

export default function PlansSection({ store }: { store: Store }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function selectPlan(planId: string) {
    setLoading(planId);
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
    if (error) {
      setMsg("Não foi possível alterar o plano.");
    } else {
      setMsg(`Plano atualizado! Agora você está no plano ${PLANS.find((p) => p.id === planId)?.name}.`);
    }
    setLoading(null);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Escolha o plano ideal</h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-500">
          Escolha o plano que combina com o seu negócio e faça upgrade quando quiser.
        </p>
      </div>

      {msg && (
        <p className="mx-auto mt-6 max-w-md rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
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
                onClick={() => selectPlan(plan.id)}
                disabled={loading === plan.id}
                className={`mt-6 rounded-xl py-2.5 text-sm font-semibold transition ${
                  isCurrent
                    ? "border border-emerald-500 text-emerald-600"
                    : FEATURED[plan.id] === "ed"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : plan.id === "premium"
                        ? "bg-white text-slate-900 hover:bg-slate-100"
                        : "border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                {loading === plan.id
                  ? "Processando..."
                  : isCurrent
                    ? "Plano atual"
                    : "Selecionar plano"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-xs text-slate-400">
        A cobrança é configurada diretamente com você (gestor). Pagamentos automáticos chegam em breve.
      </p>
    </div>
  );
}