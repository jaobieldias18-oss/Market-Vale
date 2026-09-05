import Link from "next/link";
import type { Category, Store } from "@/lib/types";
import { storageUrl } from "@/lib/utils";
import { MapPin, Star, ArrowUpRight } from "lucide-react";

export default function StoreCard({
  store,
  category,
}: {
  store: Store;
  category?: Category | null;
}) {
  const cover = storageUrl(store.cover_url);

  return (
    <Link
      href={`/loja/${store.slug}`}
      className="card card-hover group overflow-hidden !rounded-2xl"
    >
      <div className="relative h-40 overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={store.name}
            className="size-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-50 to-sky-100 text-5xl">
            {category?.icon ?? "✨"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
        {store.is_featured && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950 shadow-sm">
            <Star className="size-3 fill-amber-950" />
            Destaque
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-bold tracking-tight text-slate-900 transition group-hover:text-emerald-700">
            {store.name}
          </h3>
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="size-3.5 text-emerald-500" />
          {store.city || "Vale do Ribeira"}
          {category ? ` · ${category.name}` : ""}
        </p>
        {store.description && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{store.description}</p>
        )}
        <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-emerald-600 opacity-0 transition group-hover:opacity-100">
          Ver site <ArrowUpRight className="size-4" />
        </div>
      </div>
    </Link>
  );
}