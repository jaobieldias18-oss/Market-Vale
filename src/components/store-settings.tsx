"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FEATURE_LIMITS, getCategoryFields } from "@/lib/constants";
import { slugify, storageUrl, DAY_LABELS } from "@/lib/utils";
import type { Category, OpeningHour, Store } from "@/lib/types";
import { Check, Lock, Upload, Camera } from "lucide-react";

const TEMPLATES = [
  { id: "classico", label: "Clássico", desc: "Visual centrado e clean" },
  { id: "moderno", label: "Moderno", desc: "Layout com lateral e destaque" },
  { id: "elegante", label: "Elegante", desc: "Sofisticado e minimalista" },
];

const FONTS = [
  { id: "sans", label: "Moderna (sem serifa)" },
  { id: "serif", label: "Clássica (serifa)" },
  { id: "mono", label: "Monoespaçada" },
];

export default function StoreSettings({
  store,
  categories,
}: {
  store: Store;
  categories: Category[];
}) {
  const router = useRouter();
  const limits = FEATURE_LIMITS[store.plan_id];
  const category = categories.find((c) => c.id === store.category_id) ?? null;
  const fields = getCategoryFields(category?.slug ?? null);

  const [form, setForm] = useState({
    name: store.name,
    slug: store.slug,
    category_id: store.category_id ?? "",
    city: store.city ?? "",
    description: store.description ?? "",
    phone: store.phone ?? "",
    whatsapp: store.whatsapp ?? "",
    email: store.email ?? "",
    cep: store.cep ?? "",
    address: store.address ?? "",
    instagram: store.instagram ?? "",
    facebook: store.facebook ?? "",
    website: store.website ?? "",
  });
  const [details, setDetails] = useState<Record<string, unknown>>({
    ...(store.details ?? {}),
  });
  const [hours, setHours] = useState<OpeningHour[]>(
    store.opening_hours?.length
      ? store.opening_hours
      : DAY_LABELS.map((_, day) => ({ day, open: "08:00", close: "18:00", closed: false })),
  );
  const [template, setTemplate] = useState(store.template);
  const [theme, setTheme] = useState(store.theme ?? { primary: "#16a34a", secondary: "#064e3b", font: "sans" });
  const [logoUrl, setLogoUrl] = useState(store.logo_url ?? "");
  const [coverUrl, setCoverUrl] = useState(store.cover_url ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasCustom = limits.custom_theme;
  const publicUrl = useMemo(() => `marketvale.com.br/loja/${form.slug}`, [form.slug]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadImage(
    file: File,
    kind: "logo" | "cover",
  ) {
    const supabase = createClient();
    const path = `${store.id}/${kind}-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error: upError } = await supabase.storage.from("marketvale").upload(path, file, {
      upsert: true,
    });
    if (upError) {
      setError(upError.message);
      return;
    }
    const {
      data: { publicUrl: url },
    } = supabase.storage.from("marketvale").getPublicUrl(path);
    if (kind === "logo") setLogoUrl(url);
    else setCoverUrl(url);
  }

  function updateDetail(key: string, value: unknown) {
    setDetails((d) => ({ ...d, [key]: value }));
  }

  function updateHour(day: number, patch: Partial<OpeningHour>) {
    setHours((h) => h.map((item) => (item.day === day ? { ...item, ...patch } : item)));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    setError(null);
    const supabase = createClient();

    let slug = form.slug;
    const desired = slugify(form.name) || slugify(form.slug) || "minha-loja";
    if (desired !== slug) {
      const check = await supabase.from("stores").select("id").eq("slug", desired).maybeSingle();
      if (!check.data) slug = desired;
    }

    const payload: Record<string, unknown> = {
      name: form.name,
      slug,
      category_id: form.category_id || null,
      city: form.city || null,
      description: form.description || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      email: form.email || null,
      cep: form.cep || null,
      address: form.address || null,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
      website: form.website || null,
      logo_url: logoUrl || null,
      cover_url: coverUrl || null,
    };
    if (hasCustom) {
      payload.details = details;
      payload.opening_hours = hours;
      payload.template = template;
      payload.theme = theme;
    }

    const { error } = await supabase.from("stores").update(payload).eq("id", store.id);
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    setForm((f) => ({ ...f, slug }));
    setMessage("Salvo com sucesso!");
    router.refresh();
    setTimeout(() => setMessage(null), 3000);
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meu site</h1>
          <a
            href={`/loja/${store.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-emerald-600 hover:underline"
          >
            Ver página pública · {publicUrl} ↗
          </a>
        </div>
        <div className="flex items-center gap-2">
          {message && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <Check className="size-4" /> {message}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </header>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <Card title="Identidade visual">
        <div className="flex flex-wrap items-center gap-6">
          <ImageUploader
            label="Logo"
            url={logoUrl}
            planLocked={false}
            onChange={async (file) => uploadImage(file, "logo")}
          />
          <ImageUploader
            label="Capa"
            url={coverUrl}
            planLocked={false}
            onChange={async (file) => uploadImage(file, "cover")}
          />
        </div>
      </Card>

      <Card title="Informações básicas">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nome do negócio">
            <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Categoria">
            <select
              className="input"
              value={form.category_id}
              onChange={(e) => set("category_id", e.target.value)}
            >
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cidade">
            <input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Registro" />
          </Field>
          <Field label="CEP">
            <input className="input" value={form.cep} onChange={(e) => set("cep", e.target.value)} placeholder="11900-000" />
          </Field>
          <Field label="Endereço">
            <input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Rua, número, bairro" />
          </Field>
          <Field label="Telefone">
            <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="13 3821-0000" />
          </Field>
          <Field label="WhatsApp">
            <input className="input" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="13 99999-9999" />
          </Field>
          <Field label="E-mail">
            <input type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contato@loja.com" />
          </Field>
          <Field label="Instagram">
            <input className="input" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@seu.instagram" />
          </Field>
          <Field label="Facebook">
            <input className="input" value={form.facebook} onChange={(e) => set("facebook", e.target.value)} placeholder="https://facebook.com/..." />
          </Field>
          <Field label="Site externo">
            <input className="input" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://..." />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Descrição">
              <textarea
                className="input resize-none"
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Card>

      {limits.details || category ? (
        <Card
          title={`Informações de ${fields.label}`}
          locked={!limits.details}
          plan="profissional"
        >
          {limits.details ? (
            <div className="space-y-5">
              {fields.fields.map((field) => (
                <Field key={field.key} label={field.label}>
                  {field.type === "textarea" ? (
                    <textarea
                      className="input resize-none"
                      rows={3}
                      value={String(details[field.key] ?? "")}
                      placeholder={field.placeholder}
                      onChange={(e) => updateDetail(field.key, e.target.value)}
                    />
                  ) : field.type === "list" ? (
                    <ListEditor
                      values={((details[field.key] as string[]) ?? [])}
                      placeholder={field.placeholder}
                      onChange={(v) => updateDetail(field.key, v)}
                    />
                  ) : (
                    <input
                      className="input"
                      value={String(details[field.key] ?? "")}
                      placeholder={field.placeholder}
                      onChange={(e) => updateDetail(field.key, e.target.value)}
                    />
                  )}
                </Field>
              ))}
            </div>
          ) : (
            <Locked overline="Disponível no plano Profissional" />
          )}
        </Card>
      ) : null}

      <Card title="Horário de funcionamento" locked={!hasCustom} plan="profissional">
        {hasCustom ? (
          <div className="space-y-2">
            {hours.map((h) => (
              <div key={h.day} className="flex flex-wrap items-center gap-3 text-sm">
                <span className="w-24 font-medium text-slate-700">{DAY_LABELS[h.day]}</span>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={h.closed}
                    onChange={(e) => updateHour(h.day, { closed: e.target.checked })}
                  />
                  Fechado
                </label>
                {!h.closed && (
                  <>
                    <input
                      type="time"
                      className="input w-32"
                      value={h.open}
                      onChange={(e) => updateHour(h.day, { open: e.target.value })}
                    />
                    <span>até</span>
                    <input
                      type="time"
                      className="input w-32"
                      value={h.close}
                      onChange={(e) => updateHour(h.day, { close: e.target.value })}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Locked overline="Disponível no plano Profissional" />
        )}
      </Card>

      <Card title="Personalização do site" locked={!hasCustom} plan="profissional">
        {hasCustom ? (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Layout</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    className={`rounded-xl border p-3 text-left transition ${
                      template === t.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-800">{t.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Cor principal</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.primary}
                    onChange={(e) => setTheme((t) => ({ ...t, primary: e.target.value }))}
                    className="size-10 cursor-pointer rounded-lg border border-slate-300"
                  />
                  <span className="text-xs text-slate-500">{theme.primary}</span>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Cor secundária</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.secondary}
                    onChange={(e) => setTheme((t) => ({ ...t, secondary: e.target.value }))}
                    className="size-10 cursor-pointer rounded-lg border border-slate-300"
                  />
                  <span className="text-xs text-slate-500">{theme.secondary}</span>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Fonte</p>
                <select
                  className="input"
                  value={theme.font}
                  onChange={(e) => setTheme((t) => ({ ...t, font: e.target.value }))}
                >
                  {FONTS.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <Locked overline="Disponível no plano Profissional" />
        )}
      </Card>
    </div>
  );
}

function ImageUploader({
  label,
  url,
  planLocked,
  onChange,
}: {
  label: string;
  url: string;
  planLocked: boolean;
  onChange: (file: File) => void;
}) {
  const preview = storageUrl(url);
  return (
    <div className="flex flex-col items-center gap-2">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={label} className="h-24 w-24 rounded-xl object-cover" />
      ) : (
        <div className="grid h-24 w-24 place-items-center rounded-xl border-2 border-dashed border-slate-300 text-slate-300">
          <Camera className="size-6" />
        </div>
      )}
      <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200">
        <Upload className="size-3.5" />
        {label}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange(file);
          }}
        />
      </label>
      {planLocked && <Lock className="size-3 text-slate-300" />}
    </div>
  );
}

function ListEditor({
  values,
  placeholder,
  onChange,
}: {
  values: string[];
  placeholder?: string;
  onChange: (values: string[]) => void;
}) {
  function set(i: number, value: string) {
    const next = [...values];
    next[i] = value;
    onChange(next);
  }
  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="input"
            value={v}
            placeholder={placeholder}
            onChange={(e) => set(i, e.target.value)}
          />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, idx) => idx !== i))}
            className="rounded-lg px-3 text-sm text-red-500 hover:bg-red-50"
          >
            Remover
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-500 hover:border-emerald-400 hover:text-emerald-600"
      >
        + Adicionar item
      </button>
    </div>
  );
}

function Card({
  title,
  children,
  locked,
  plan,
}: {
  title: string;
  children: React.ReactNode;
  locked?: boolean;
  plan?: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="flex items-center gap-2 font-semibold text-slate-800">
        {title}
        {locked && <Lock className="size-4 text-amber-500" />}
      </h2>
      <div className="mt-4">{children}</div>
      {locked && <p className="mt-3 text-xs text-amber-600">Recurso do plano {plan}</p>}
    </section>
  );
}

function Locked({ overline }: { overline: string }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-slate-200 py-8 text-center">
      <Lock className="size-6 text-slate-300" />
      <p className="mt-2 text-sm font-medium text-slate-500">{overline}</p>
      <a href="/dashboard/assinatura" className="mt-1 text-sm font-semibold text-emerald-600 hover:underline">
        Fazer upgrade →
      </a>
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