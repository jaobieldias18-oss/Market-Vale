"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FEATURE_LIMITS } from "@/lib/constants";
import { storageUrl } from "@/lib/utils";
import type { Store, StoreGalleryItem } from "@/lib/types";
import { Lock, Plus, Trash2, Upload } from "lucide-react";

export default function GalleryManager({
  store,
  items,
}: {
  store: Store;
  items: StoreGalleryItem[];
}) {
  const router = useRouter();
  const limit = FEATURE_LIMITS[store.plan_id].gallery;
  const locked = limit === 0;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();

    if (items.length + files.length > limit) {
      setError(`Seu plano permite no máximo ${limit} fotos.`);
      setUploading(false);
      return;
    }

    let lastError: string | null = null;
    for (const file of Array.from(files)) {
      const path = `${store.id}/galeria-${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/\s+/g, "-")}`;
      const { error: up } = await supabase.storage.from("marketvale").upload(path, file, { upsert: true });
      if (up) {
        lastError = up.message;
        continue;
      }
      const {
        data: { publicUrl: url },
      } = supabase.storage.from("marketvale").getPublicUrl(path);
      await supabase.from("store_gallery").insert({ store_id: store.id, url, sort_order: items.length });
    }
    if (lastError) setError(lastError);
    setUploading(false);
    router.refresh();
  }

  async function handleDelete(item: StoreGalleryItem) {
    const supabase = createClient();
    await supabase.from("store_gallery").delete().eq("id", item.id);
    router.refresh();
  }

  if (locked) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Lock className="mx-auto size-8 text-slate-300" />
        <h1 className="mt-4 text-xl font-semibold text-slate-800">Galeria de fotos</h1>
        <p className="mt-2 text-sm text-slate-500">
          O plano Básico não inclui galeria de fotos.
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Galeria de fotos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Mostre o seu espaço e seus produtos ({items.length}/{limit} fotos usadas)
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
          <Plus className="size-4" />
          {uploading ? "Enviando..." : "Enviar fotos"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {items.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <Upload className="size-8 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">Nenhuma foto ainda. Envie a primeira!</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item, i) => {
            const url = storageUrl(item.url);
            return (
              <div key={item.id} className="group relative overflow-hidden rounded-xl border border-slate-200">
                {url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt={item.caption ?? ""} className="aspect-square w-full object-cover" />
                )}
                <button
                  onClick={() => handleDelete(item)}
                  className="absolute right-2 top-2 grid size-8 place-items-center rounded-lg bg-white/90 text-red-500 opacity-0 shadow transition group-hover:opacity-100"
                  aria-label="Excluir foto"
                >
                  <Trash2 className="size-4" />
                </button>
                <span className="absolute left-2 top-2 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {i + 1}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}