"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Loading from "@/components/loading";
import { slugify } from "@/lib/utils";
import type { Category } from "@/lib/types";

const EMPTY = { name: "", slug: "", icon: "âœ¨", description: "", color: "#16a34a" };

export default function AdminCategorias() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  function load() {
    createClient()
      .from("categories")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setCategories((data as Category[]) ?? []);
        setLoading(false);
      });
  }

  useEffect(load, []);

  if (loading) return <Loading />;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const slug = form.slug || slugify(form.name);
    if (!slug) {
      setError("Informe um nome ou slug.");
      return;
    }
    const { error: err } = await supabase.from("categories").insert({
      name: form.name,
      slug,
      icon: form.icon,
      description: form.description,
      color: form.color,
      sort_order: categories.length + 1,
    });
    if (err) {
      setError(err.message);
      return;
    }
    setForm(EMPTY);
    load();
  }

  async function handleDelete(id: string) {
    const ok = confirm("Excluir esta categoria? Os negócios dela ficarão sem categoria.");
    if (!ok) return;
    await createClient().from("categories").delete().eq("id", id);
    load();
  }

  async function handleSaveEdit(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({
        name: editForm.name,
        slug: editForm.slug,
        icon: editForm.icon,
        description: editForm.description,
        color: editForm.color,
      })
      .eq("id", id);
    if (!error) {
      setEditingId(null);
      load();
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description,
      color: cat.color,
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Categorias</h1>
      <p className="mt-1 text-sm text-slate-500">Tipos de negócio disponíveis no catálogo</p>

      <form onSubmit={handleCreate} className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <input className="input" placeholder="Nome (ex: Loja de Roupas)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Slug (ex: loja-roupas)" value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
        <input className="input" placeholder="Ícone (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
        <input type="color" className="input h-[42px] cursor-pointer" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
        <div className="sm:col-span-2">
          <textarea className="input resize-none" rows={2} placeholder="Descrição curta" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
        <button className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 sm:col-span-2">
          Adicionar categoria
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
            {editingId === cat.id ? (
              <>
                <input className="input w-28" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                <input className="input w-32" value={editForm.slug} onChange={(e) => setEditForm({ ...editForm, slug: slugify(e.target.value) })} />
                <input className="input w-20" value={editForm.icon} onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })} />
                <input className="input w-full sm:flex-1" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                <button onClick={() => handleSaveEdit(cat.id)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">Salvar</button>
                <button onClick={() => setEditingId(null)} className="rounded-lg px-3 py-1.5 text-xs text-slate-500">Cancelar</button>
              </>
            ) : (
              <>
                <span className="grid size-10 place-items-center rounded-xl text-xl" style={{ backgroundColor: `${cat.color}18` }}>
                  {cat.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800">{cat.name}</p>
                  <p className="truncate text-xs text-slate-400">/{cat.slug} · {cat.description}</p>
                </div>
                <button onClick={() => startEdit(cat)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Editar</button>
                <button onClick={() => handleDelete(cat.id)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50">Excluir</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
export const runtime = "edge";
