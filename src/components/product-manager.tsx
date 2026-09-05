"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FEATURE_LIMITS } from "@/lib/constants";
import { storageUrl } from "@/lib/utils";
import type { Store, StoreProduct, StoreTabRow } from "@/lib/types";
import {
  Lock,
  Package,
  Pencil,
  Plus,
  Trash2,
  X,
  Layers,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export default function ProductManager({
  store,
  products,
  tabs,
}: {
  store: Store;
  products: StoreProduct[];
  tabs: StoreTabRow[];
}) {
  const router = useRouter();
  const limit = FEATURE_LIMITS[store.plan_id].products;
  const locked = limit === 0;
  const canTabs = FEATURE_LIMITS[store.plan_id].custom_tabs;

  const [activeTabId, setActiveTabId] = useState<string>(canTabs ? tabs[0]?.id ?? "none" : "none");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<StoreProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newTabLabel, setNewTabLabel] = useState("");
  const [newTabPayments, setNewTabPayments] = useState("");
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [tabFormLabel, setTabFormLabel] = useState("");
  const [tabFormPayments, setTabFormPayments] = useState("");

  const currentTab: { id: string; label: string; payment_methods: string[] | null } =
    activeTabId === "none"
      ? { id: "none", label: "Produtos", payment_methods: null }
      : tabs.find((t) => t.id === activeTabId) ?? { id: "none", label: "Produtos", payment_methods: null };

  const visibleProducts =
    currentTab.id === "none" ? products.filter((p) => !p.tab_id) : products.filter((p) => p.tab_id === currentTab.id);

  if (locked) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Lock className="mx-auto size-8 text-slate-300" />
        <h1 className="mt-4 text-xl font-semibold text-slate-800">Seu site</h1>
        <p className="mt-2 text-sm text-slate-500">
          O plano Básico não inclui catálogo de produtos. Suba para o Profissional e monte o catálogo da sua loja, ou o
          Premium para ter um site completo com abas próprias, fotos, preços e formas de pagamento.
        </p>
        <a
          href="/dashboard/assinatura"
          className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Ver planos
        </a>
      </div>
    );
  }

  const supabase = createClient();

  async function handleSaveTab() {
    if (!tabFormLabel.trim()) return;
    setSaving(true);
    setError(null);
    const methods = tabFormPayments
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (editingTabId) {
      await supabase.from("store_tabs").update({ label: tabFormLabel.trim(), payment_methods: methods }).eq("id", editingTabId);
    } else {
      await supabase.from("store_tabs").insert({
        store_id: store.id,
        label: tabFormLabel.trim(),
        payment_methods: methods,
        sort_order: tabs.length,
      });
    }
    setSaving(false);
    setEditingTabId(null);
    setTabFormLabel("");
    setTabFormPayments("");
    router.refresh();
  }

  async function handleDeleteTab(tab: StoreTabRow) {
    if (!confirm(`Excluir a aba "${tab.label}"? Os produtos dela voltam para "Produtos".`)) return;
    const supabaseClient = createClient();
    await supabaseClient.from("store_products").update({ tab_id: null }).eq("tab_id", tab.id);
    await supabaseClient.from("store_tabs").delete().eq("id", tab.id);
    if (activeTabId === tab.id) setActiveTabId("none");
    router.refresh();
  }

  async function handleMoveTab(tab: StoreTabRow, dir: -1 | 1) {
    const ordered = [...tabs].sort((a, b) => a.sort_order - b.sort_order);
    const idx = ordered.findIndex((t) => t.id === tab.id);
    const swap = ordered[idx + dir];
    if (!swap) return;
    const sb = createClient();
    await sb.from("store_tabs").update({ sort_order: swap.sort_order }).eq("id", tab.id);
    await sb.from("store_tabs").update({ sort_order: tab.sort_order }).eq("id", swap.id);
    router.refresh();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const sb = createClient();

    const name = (document.getElementById("p-name") as HTMLInputElement).value.trim();
    const description = (document.getElementById("p-desc") as HTMLTextAreaElement).value.trim();
    const priceRaw = (document.getElementById("p-price") as HTMLInputElement).value.trim();
    if (!name) {
      setError("Informe o nome do produto.");
      setSaving(false);
      return;
    }
    const price = priceRaw === "" ? null : Number(priceRaw.replace(",", "."));
    if (price !== null && Number.isNaN(price)) {
      setError("Preço inválido.");
      setSaving(false);
      return;
    }

    const fileInput = document.getElementById("p-image") as HTMLInputElement;
    const file = fileInput?.files?.[0] ?? null;
    let image_url: string | null = editing?.image_url ?? null;

    if (file) {
      const path = `${store.id}/produto-${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/\s+/g, "-")}`;
      const { error: up } = await sb.storage.from("marketvale").upload(path, file, { upsert: true });
      if (up) {
        setError(up.message);
        setSaving(false);
        return;
      }
      image_url = sb.storage.from("marketvale").getPublicUrl(path).data.publicUrl;
    }

    const payload = {
      name,
      description: description || null,
      price,
      image_url,
      tab_id: currentTab.id === "none" ? null : currentTab.id,
    };

    if (editing) {
      await sb.from("store_products").update(payload).eq("id", editing.id);
    } else {
      if (products.length >= limit) {
        setError(`Seu plano permite no máximo ${limit} produtos.`);
        setSaving(false);
        return;
      }
      await sb.from("store_products").insert({ store_id: store.id, ...payload, sort_order: products.length });
    }

    setSaving(false);
    setCreating(false);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este produto?")) return;
    const sb = createClient();
    await sb.from("store_products").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meu site — Conteúdo</h1>
          <p className="mt-1 text-sm text-slate-500">
            {canTabs
              ? "Crie abas e monte o site da sua loja com produtos, fotos, preços e formas de pagamento."
              : "Monte seu catálogo com fotos, preço e descrição."}{" "}
            Limit: {products.length}/{limit}
          </p>
        </div>
        {(creating || editing) && (
          <button
            onClick={() => {
              setCreating(false);
              setEditing(null);
            }}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Ver catálogo
          </button>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {canTabs && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-emerald-600" />
            <h2 className="font-semibold text-slate-800">Abas do meu site</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Cada aba vira uma página do seu site (ex.: Feminino, Masculino, Promoções). Dentro dela você adiciona os
            produtos.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveTabId("none");
                setCreating(false);
                setEditing(null);
              }}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                currentTab.id === "none"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Produtos
            </button>
            {tabs.map((tab) => (
              <div key={tab.id} className="group flex items-center gap-1">
                <button
                  onClick={() => {
                    setActiveTabId(tab.id);
                    setCreating(false);
                    setEditing(null);
                  }}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    currentTab.id === tab.id
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
                <div className="hidden items-center gap-0.5 group-hover:flex">
                  <button
                    onClick={() => handleMoveTab(tab, -1)}
                    className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100"
                    title="Mover para cima"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveTab(tab, 1)}
                    className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100"
                    title="Mover para baixo"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingTabId(tab.id);
                      setTabFormLabel(tab.label);
                      setTabFormPayments((tab.payment_methods ?? []).join(", "));
                    }}
                    className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100"
                    title="Editar aba"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTab(tab)}
                    className="grid size-6 place-items-center rounded text-red-400 hover:bg-red-50"
                    title="Excluir aba"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {!editingTabId && (
              <button
                onClick={() => {
                  setEditingTabId("");
                  setTabFormLabel("");
                  setTabFormPayments("");
                }}
                className="flex items-center gap-1.5 rounded-full border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                <Plus className="size-4" /> Nova aba
              </button>
            )}
          </div>

          {editingTabId !== null && (
            <div className="mt-4 grid gap-3 rounded-xl bg-emerald-50/60 p-4 sm:grid-cols-[1fr_1fr_auto]">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Nome da aba</label>
                <input
                  value={tabFormLabel}
                  onChange={(e) => setTabFormLabel(e.target.value)}
                  placeholder="Ex.: Feminino"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Formas de pagamento (separadas por vírgula)</label>
                <input
                  value={tabFormPayments}
                  onChange={(e) => setTabFormPayments(e.target.value)}
                  placeholder="Pix, Cartão, Dinheiro"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                />
              </div>
              <div className="flex items-end gap-2 pb-0.5">
                <button
                  onClick={handleSaveTab}
                  disabled={saving}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? "..." : editingTabId ? "Salvar" : "Criar"}
                </button>
                <button
                  onClick={() => setEditingTabId(null)}
                  className="grid size-9 place-items-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Produtos da aba “{currentTab.label}”
          </h2>
          <p className="text-sm text-slate-500">
            {currentTab.payment_methods && currentTab.payment_methods.length > 0
              ? `Pagamento aceito: ${currentTab.payment_methods.join(" · ")}`
              : canTabs
                ? "Defina as formas de pagamento na aba acima (elas aparecem no seu site)."
                : "Adicione produtos com foto, preço e descrição."}
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
      </section>

      {(creating || editing) && (
        <form onSubmit={handleSave} className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">{editing ? "Editar produto" : "Novo produto"}</h3>
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
                placeholder="Ex.: Vestido de verão"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Descrição</label>
              <textarea
                id="p-desc"
                rows={3}
                defaultValue={editing?.description ?? ""}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
                placeholder="Ex.: Vestido leve, tamanhos P ao GG."
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
                  placeholder="Ex.: 89,90"
                />
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

      {visibleProducts.length === 0 && !creating ? (
        <div className="mt-6 grid place-items-center rounded-2xl border-2 border-dashed border-slate-200 py-14 text-center">
          <Package className="size-8 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">Nenhum produto nesta aba ainda. Crie o primeiro!</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((p) => {
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