import Link from "next/link";
import type { Category, Store } from "@/lib/types";
import { storageUrl } from "@/lib/utils";
import { MapPin, Star } from "lucide-react";

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
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt={store.name}
          className="h-36 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 text-4xl">
          {category?.icon ?? "✨"}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold text-slate-800 group-hover:text-emerald-700">
            {store.name}
          </h3>
          {store.is_featured && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              <Star className="size-3" />
              Destaque
            </span>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="size-3.5" />
          {store.city || "Vale do Ribeira"}
          {category ? ` · ${category.name}` : ""}
        </p>
        {store.description && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{store.description}</p>
        )}
      </div>
    </Link>
  );
}