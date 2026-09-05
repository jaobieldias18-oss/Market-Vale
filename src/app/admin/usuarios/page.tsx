"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Loading from "@/components/loading";
import { formatDate } from "@/lib/utils";
import type { Profile, Store } from "@/lib/types";
import { ShieldCheck, Shield } from "lucide-react";

interface ProfileRow extends Profile {
  stores: number;
}

export default function AdminUsuarios() {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    const supabase = createClient();
    Promise.all([supabase.from("profiles").select("*"), supabase.from("stores").select("owner_id")]).then(
      ([profilesRes, storesRes]) => {
        const stores = (storesRes.data as Store[]) ?? [];
        const rows: ProfileRow[] = ((profilesRes.data as Profile[]) ?? []).map((p) => ({
          ...p,
          stores: stores.filter((s) => s.owner_id === p.id).length,
        }));
        setUsers(rows.sort((a) => (a.role === "admin" ? -1 : 1)));
        setLoading(false);
      },
    );
  }

  useEffect(load, []);

  if (loading) return <Loading />;

  async function toggleRole(user: ProfileRow) {
    const supabase = createClient();
    const next = user.role === "admin" ? "owner" : "admin";
    await supabase.from("profiles").update({ role: next }).eq("id", user.id);
    load();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Usuários</h1>
      <p className="mt-1 text-sm text-slate-500">{users.length} usuários cadastrados</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Lojas</th>
              <th className="px-4 py-3">Cadastro</th>
              <th className="px-4 py-3">Função</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{user.name || "Sem nome"}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{user.stores}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{formatDate(user.created_at)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleRole(user)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                      user.role === "admin"
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {user.role === "admin" ? <ShieldCheck className="size-3.5" /> : <Shield className="size-3.5" />}
                    {user.role === "admin" ? "Administrador" : "Lojista"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}