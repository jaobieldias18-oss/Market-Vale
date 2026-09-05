"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Store } from "@/lib/types";
import { Building2, Eye, Users, CreditCard } from "lucide-react";

export default function AdminOverview() {
  const [stores, setStores] = useState<Store[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("stores").select("*"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]).then(([storesRes, usersRes]) => {
      setStores((storesRes.data as Store[]) ?? []);
      setUserCount(usersRes.count ?? 0);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  const active = stores.filter((s) => s.status === "active");
  const totalViews = stores.reduce((acc, s) => acc + s.views, 0);
  const featured = stores.filter((s) => s.is_featured).length;
  const planCount = {
    basico: stores.filter((s) => s.plan_id === "basico").length,
    profissional: stores.filter((s) => s.plan_id === "profissional").length,
    premium: stores.filter((s) => s.plan_id === "premium").length,
  };
  const totalMonthly = planCount.profissional * 49.9 + planCount.premium * 99.9;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Visão geral</h1>
      <p className="mt-1 text-sm text-slate-500">Painel do administrador do Market Vale</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Building2 className="size-5" />} value={stores.length} label={`Lojas cadastradas (${active.length} ativas)`} color="emerald" />
        <Stat icon={<Eye className="size-5" />} value={totalViews} label="Visitas totais" color="sky" />
        <Stat icon={<Users className="size-5" />} value={userCount} label="Usuários cadastrados" color="violet" />
        <Stat icon={<CreditCard className="size-5" />} value={`R$ ${totalMonthly.toFixed(2).replace(".", ",")}`} label="Receita mensal estimada" color="amber" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-800">Planos</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li className="flex justify-between"><span>Básico</span><span className="font-semibold">{planCount.basico}</span></li>
            <li className="flex justify-between"><span>Profissional</span><span className="font-semibold">{planCount.profissional}</span></li>
            <li className="flex justify-between"><span>Premium</span><span className="font-semibold">{planCount.premium}</span></li>
          </ul>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="bg-emerald-400" style={{ width: `${(planCount.premium / Math.max(stores.length, 1)) * 100}%` }} />
              <div className="bg-slate-300" style={{ width: `${(planCount.profissional / Math.max(stores.length, 1)) * 100}%` }} />
              <div className="bg-slate-200" style={{ width: `${(planCount.basico / Math.max(stores.length, 1)) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="font-semibold text-slate-800">Destaques</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MiniLink href="/admin/lojas" label="Lojas em destaque" value={featured} />
            <MiniLink href="/admin/categorias" label="Gerenciar categorias" value="Abrir" />
            <MiniLink href="/admin/planos" label="Ajustar preços dos planos" value="Abrir" />
            <MiniLink href="/admin/usuarios" label="Gerenciar usuários" value="Abrir" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600",
    sky: "bg-sky-50 text-sky-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className={`grid size-10 place-items-center rounded-xl ${colors[color]}`}>{icon}</div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function MiniLink({ href, label, value }: { href: string; label: string; value: string | number }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm hover:border-emerald-300"
    >
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-emerald-600">{value}</span>
    </Link>
  );
}

function Loading() {
  return (
    <div className="grid min-h-[50vh] place-items-center text-sm text-slate-400">
      Carregando...
    </div>
  );
}