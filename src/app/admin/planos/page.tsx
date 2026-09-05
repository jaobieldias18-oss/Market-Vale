"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Loading from "@/components/loading";
import type { Plan } from "@/lib/types";

interface PlanRow {
  id: string;
  name: string;
  price: string;
  features: string;
}

export default function AdminPlanos() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .from("plans")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        const list = (data as Plan[]) ?? [];
        setPlans(list);
        setRows(
          list.map((p) => ({
            id: p.id,
            name: p.name,
            price: String(p.price_monthly),
            features: (p.features as string[]).join("\n"),
          })),
        );
        setLoading(false);
      });
  }, []);

  if (loading) return <Loading />;

  function patch(id: string, field: keyof PlanRow, value: string) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  async function save(id: string) {
    setMsg(null);
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const price = parseFloat(row.price.replace(",", "."));
    if (isNaN(price)) {
      setMsg("Preço inválido.");
      return;
    }
    const features = row.features
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
    const { error } = await createClient()
      .from("plans")
      .update({ price_monthly: price, features })
      .eq("id", id);
    if (error) {
      setMsg(error.message);
    } else {
      setMsg(`Plano ${row.name} salvo.`);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Planos</h1>
      <p className="mt-1 text-sm text-slate-500">
        Preços em reais por mês. Cada recurso em uma linha.
      </p>

      {msg && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{msg}</p>
      )}

      <div className="mt-6 space-y-4">
        {plans.map((plan) => {
          const row = rows.find((r) => r.id === plan.id)!;
          return (
            <div key={plan.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-semibold text-slate-800">{row.name}</h2>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  R$
                  <input
                    className="input !w-28 !py-1.5"
                    value={row.price}
                    onChange={(e) => patch(plan.id, "price", e.target.value)}
                    inputMode="decimal"
                  />
                  /mês
                </label>
                <button
                  onClick={() => save(plan.id)}
                  className="ml-auto rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Salvar
                </button>
              </div>
              <textarea
                className="input mt-3 resize-y font-mono text-xs"
                rows={Math.max(row.features.split("\n").length, 4)}
                value={row.features}
                onChange={(e) => patch(plan.id, "features", e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}