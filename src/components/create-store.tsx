"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import type { Category } from "@/lib/types";

export default function CreateStore() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createClient()
      .from("categories")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setCategories((data as Category[]) ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Sessão expirada. Faça login novamente.");
      setLoading(false);
      return;
    }

    let slug = slugify(name) || "minha-loja";
    const slugRes = await supabase.from("stores").select("slug").eq("slug", slug).maybeSingle();
    if (slugRes.data) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    const { error } = await supabase
      .from("stores")
      .insert({
        owner_id: user.id,
        name,
        slug,
        category_id: categoryId || null,
        city: city || null,
        whatsapp: whatsapp || null,
        description: description || null,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard/configuracao");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Cadastre seu negócio</h1>
      <p className="mt-1 text-sm text-slate-500">
        Comece com o plano Básico grátis e personalize depois.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <Field label="Nome do negócio">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Confeitaria Doce Ribeira"
            className="input"
          />
        </Field>

        <Field label="Tipo de negócio">
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input"
          >
            <option value="">Selecione...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Cidade">
            <input
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Registro"
              className="input"
            />
          </Field>
          <Field label="WhatsApp (com DDD)">
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ex: 13 99999-9999"
              className="input"
            />
          </Field>
        </div>

        <Field label="Descrição">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Conte um pouco sobre o seu negócio..."
            className="input resize-none"
          />
        </Field>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Criando..." : "Criar minha loja"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}