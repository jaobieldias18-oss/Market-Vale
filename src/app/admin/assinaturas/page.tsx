"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Loading from "@/components/loading";
import { CreditCard, ExternalLink, Ban, CheckCircle2 } from "lucide-react";

interface SubRow {
  id: string;
  plan_id: string;
  status: string;
  provider: string;
  started_at: string | null;
  renews_at: string | null;
  stores: { name: string; slug: string; profiles: { email: string } | { email: string }[] | null } | null;
}

const PLAN_LABEL: Record<string, string> = {
  basico: "Básico",
  profissional: "Profissional",
  premium: "Premium",
};

function statusMeta(status: string) {
  switch (status) {
    case "active":
      return { label: "Em dia", cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" };
    case "pending":
      return { label: "Pendente", cls: "bg-red-100 text-red-600", dot: "bg-red-500" };
    default:
      return { label: "Cancelada", cls: "bg-slate-200 text-slate-600", dot: "bg-slate-400" };
  }
}

function fmtDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}

export default function AdminAssinaturas() {
  const [rows, setRows] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(() => {
    createClient()
      .from("subscriptions")
      .select("*, stores(name, slug, profiles(email))")
      .order("started_at", { ascending: false })
      .then(({ data }) => {
        setRows(data as SubRow[]);
        setLoading(false);
      });
  }, []);

  useEffect(load, [load]);

  async function cancel(sub: SubRow) {
    const ok = confirm(`Cancelar a assinatura da loja "${sub.stores?.name}"?`);
    if (!ok) return;
    setBusy(sub.id);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_id: sub.id }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.error) setNotice(data.error);
      else setNotice(`Assinatura de "${sub.stores?.name}" cancelada.`);
      load();
    } catch {
      setNotice("Erro de conexão. Tente novamente.");
    }
    setBusy(null);
  }

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assinaturas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cobrança mensal automática (cartão via Stripe). Verde = em dia · Vermelho = pendente.
          </p>
        </div>
      </div>

      {notice && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Nenhuma assinatura registrada ainda.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Loja</th>
                <th className="px-4 py-3">Assinante</th>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Início</th>
                <th className="px-4 py-3">Próxima cobrança</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((sub) => {
                const meta = statusMeta(sub.status);
                const email = Array.isArray(sub.stores?.profiles)
                  ? sub.stores?.profiles[0]?.email
                  : sub.stores?.profiles?.email;
                return (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{sub.stores?.name ?? "Sem loja"}</div>
                      <a
                        href={`/loja/${sub.stores?.slug ?? ""}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                      >
                        <ExternalLink className="size-3" /> Ver site
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{email ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{PLAN_LABEL[sub.plan_id] ?? sub.plan_id}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.cls}`}>
                        <span className={`size-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(sub.started_at)}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(sub.renews_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {sub.status !== "canceled" ? (
                        <button
                          onClick={() => cancel(sub)}
                          disabled={busy === sub.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                        >
                          <Ban className="size-3.5" />
                          {busy === sub.id ? "Cancelando..." : "Cancelar"}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <CheckCircle2 className="size-3.5" /> Cancelada
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <CreditCard className="size-4" />
        As assinaturas são mensais. Cancelamento interrompe a cobrança e a loja volta para o plano Básico.
      </p>
    </div>
  );
}
export const runtime = "edge";