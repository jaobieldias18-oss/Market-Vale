"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FEATURE_LIMITS } from "@/lib/constants";
import { storageUrl } from "@/lib/utils";
import type { Store, StoreProduct } from "@/lib/types";
import { Lock, Package, Pencil, Plus, Trash2, X } from "lucide-react";

export default function ProductManager({
  store,
  products,
}: {
  store: Store;
  products: StoreProduct[];
}) {
  const router = useRouter();
  const limit = FEATURE_LIMITS[store.plan_id].products;
  const locked = limit === 0;

  const [editing, setEditing] = useState<StoreProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = editing ?? { name: "", description: "", price: "", category: "" } as any;

  if (locked) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Lock className="mx-auto size-8 text-slate-300" />
        <h1 className="mt-4 text-xl font-semibold text-slate-800">Produtos</h1>
        <p className="mt-2 text-sm text-slate-500">
          O plano Básico não inclui catálogo de produtos. Suba para Profissional e monte seu catálogo com fotos,
          preços e descrições.
        </p>
        <a
          href="/dashboard/assinatura"
          className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Conhecer plano Profissional
        </a>
      </div>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const name = (document.getElementById("p-name") as HTMLInputElement).value.trim();
    const description = (document.getElementById("p-desc") as HTMLTextAreaElement).value.trim();
    const priceRaw = (document.getElementById("p-price") as HTMLInputElement).value.trim();
    const category = (document.getElementById("p-cat") as HTMLInputElement).value.trim();

    if (!name) {
      setError("Informe o nome do produto.");
      setSaving(false);
      return;
    }
    const price = priceRaw === "" ? null : Number(priceRaw.replace(",", "."));
    if (price !== null && Number.isNaN(price)) {
      setError("Preço inválido. Use apenas números (ex.: 19,90).");
      setSaving(false);
      return;
    }

    const fileInput = document.getElementById("p-image") as HTMLInputElement;
    const file = fileInput?.files?.[0] ?? null;

    let image_url: string | null = editing?.image_url ?? null;

    if (file) {
      const path = `${store.id}/produto-${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/\s+/g, "-")}`;
      const { error: up } = await supabase.storage.from("marketvale").upload(path, file, { upsert: true });
      if (up) {
        setError(up.message);
        setSaving(false);
        return;
      }
      image_url = supabase.storage.from("marketvale").getPublicUrl(path).data.publicUrl;
    }

    const payload = { name, description: description || null, price, category: category || null, image_url };

    if (editing) {
      await supabase.from("store_products").update(payload).eq("id", editing.id);
    } else {
      if (products.length >= limit) {
        setError(`Seu plano permite no máximo ${limit} produtos.`);
        setSaving(false);
        return;
      }
      await supabase.from("store_products").insert({ store_id: store.id, ...payload, sort_order: products.length });
    }

    setSaving(false);
    setEditing(null);
    setCreating(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este produto?")) return;
    const supabase = createClient();
    await supabase.from("store_products").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Produtos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monte seu catálogo com fotos, preço e descrição ({products.length}/{limit} produtos)
          </p>
        </div>
        {!creating && !editing && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="size-4" /> Novo produto
          </button>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {(creating || editing) && (
        <form onSubmit={handleSave} className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">{editing ? "Editar produto" : "Novo produto"}</h2>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
              className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nome *</label>
              <input
                id="p-name"
                defaultValue={editing?.name ?? ""}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
                placeholder="Ex.: Bolo de cenoura"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Descrição</label>
              <textarea
                id="p-desc"
                rows={3}
                defaultValue={editing?.description ?? ""}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
                placeholder="Ex.: Bolo fofinho com cobertura de chocolate, feito na hora."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Preço (R$)</label>
                <input
                  id="p-price"
                  type="text"
                  inputMode="decimal"
                  defaultValue={editing?.price != null ? String(editing.price).replace(".", ",") : ""}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
                  placeholder="Ex.: 19,90"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Categoria</label>
                <input
                  id="p-cat"
                  defaultValue={editing?.category ?? ""}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
                  placeholder="Ex.: Bolos, Salgados"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Foto do produto</label>
              <input
                id="p-image"
                type="file"
                accept="image/*"
                className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>
            {editing?.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={storageUrl(editing.image_url) ?? ""} alt="" className="h-24 w-24 rounded-xl object-cover" />
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}

      {products.length === 0 && !creating ? (
        <div className="mt-10 grid place-items-center rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <Package className="size-8 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">Nenhum produto ainda. Crie o primeiro!</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const img = storageUrl(p.image_url);
            return (
              <div key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={p.name} className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="grid aspect-[4/3] w-full place-items-center bg-slate-100 text-slate-300">
                    <Package className="size-8" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-800">{p.name}</h3>
                    {p.price != null && (
                      <span className="shrink-0 font-bold text-emerald-600">
                        {p.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    )}
                  </div>
                  {p.category && <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-400">{p.category}</p>}
                  {p.description && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{p.description}</p>}
                  <div className="mt-auto flex gap-2 pt-4">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setCreating(false);
                      }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Pencil className="size-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}