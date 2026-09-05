"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Loading from "@/components/loading";
import type { Category, Store } from "@/lib/types";
import { Star, Eye, ExternalLink } from "lucide-react";

export default function AdminLojas() {
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    const supabase = createClient();
    Promise.all([
      supabase.from("stores").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*"),
    ]).then(([s, c]) => {
      setStores((s.data as Store[]) ?? []);
      setCategories((c.data as Category[]) ?? []);
      setLoading(false);
    });
  }

  useEffect(load, []);

  if (loading) return <Loading />;

  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Lojas</h1>
      <p className="mt-1 text-sm text-slate-500">{stores.length} negócios cadastrados</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Loja</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Visitas</th>
              <th className="px-4 py-3">Plano</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Destaque</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stores.map((store) => (
              <tr key={store.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{store.name}</div>
                  <div className="text-xs text-slate-400">{store.city || "—"}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{catName(store.category_id)}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Eye className="size-3.5" /> {store.views}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <PlanSelect store={store} onChange={load} />
                </td>
                <td className="px-4 py-3">
                  <StatusToggle store={store} onChange={load} />
                </td>
                <td className="px-4 py-3">
                  <FeaturedToggle store={store} onChange={load} />
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/loja/${store.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                  >
                    <ExternalLink className="size-3.5" /> Ver
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlanSelect({ store, onChange }: { store: Store; onChange: () => void }) {
  async function handle(value: string) {
    const supabase = createClient();
    await supabase.from("stores").update({ plan_id: value }).eq("id", store.id);
    onChange();
  }
  return (
    <select
      value={store.plan_id}
      onChange={(e) => handle(e.target.value)}
      className="input !w-32 !py-1.5 text-xs"
    >
      <option value="basico">Básico</option>
      <option value="profissional">Profissional</option>
      <option value="premium">Premium</option>
    </select>
  );
}

function StatusToggle({ store, onChange }: { store: Store; onChange: () => void }) {
  async function handle() {
    const supabase = createClient();
    await supabase
      .from("stores")
      .update({ status: store.status === "active" ? "inactive" : "active" })
      .eq("id", store.id);
    onChange();
  }
  return (
    <button
      onClick={handle}
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        store.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
      }`}
    >
      {store.status === "active" ? "Ativa" : "Inativa"}
    </button>
  );
}

function FeaturedToggle({ store, onChange }: { store: Store; onChange: () => void }) {
  async function handle() {
    const supabase = createClient();
    await supabase.from("stores").update({ is_featured: !store.is_featured }).eq("id", store.id);
    onChange();
  }
  return (
    <button
      onClick={handle}
      aria-label="Alternar destaque"
      className={`grid size-8 place-items-center rounded-lg border transition ${
        store.is_featured
          ? "border-amber-300 bg-amber-100 text-amber-600"
          : "border-slate-200 text-slate-300 hover:border-amber-300"
      }`}
    >
      <Star className="size-4" />
    </button>
  );
}