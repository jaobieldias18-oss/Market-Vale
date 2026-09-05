import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import StoreCard from "@/components/store-card";
import { getCategoryFields, CATEGORY_FIELDS } from "@/lib/constants";
import type { Category, Store } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();

  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();

  const category = data as Category | null;
  const fallback = CATEGORY_FIELDS[slug] ?? CATEGORY_FIELDS.outros;
  const meta = category ? category : ({ slug, name: fallback.label, icon: fallback.icon, color: "#16a34a" } as Category);

  if (!category && !CATEGORY_FIELDS[slug]) notFound();

  let stores: Store[] = [];
  const storesRes = await supabase
    .from("stores")
    .select("*")
    .eq("status", "active")
    .eq("category_id", category?.id ?? "__none__")
    .order("views", { ascending: false });

  if (storesRes.data) {
    stores = storesRes.data as Store[];
  }

  if (query) {
    stores = stores.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        (s.city ?? "").toLowerCase().includes(query) ||
        (s.description ?? "").toLowerCase().includes(query),
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-emerald-600 py-14 text-center text-white">
        <h1 className="text-3xl font-bold">{meta.icon} {meta.name}</h1>
        <p className="mx-auto mt-2 max-w-lg px-4 text-emerald-100">
          {category?.description ??
            `Encontre prestadores de ${meta.name.toLowerCase()} no Vale do Ribeira.`}
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <form className="mx-auto flex max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar nesta categoria..."
            className="w-full bg-transparent text-sm outline-none"
          />
          <button className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">
            Buscar
          </button>
        </form>

        {stores.length === 0 ? (
          <div className="mt-14 text-center">
            <p className="text-4xl">{meta.icon}</p>
            <h2 className="mt-4 text-xl font-semibold">Nenhum negócio encontrado ainda</h2>
            <p className="mt-2 text-slate-500">
              Seja o primeiro da categoria {meta.name} a aparecer aqui.
            </p>
            <Link
              href="/cadastro"
              className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              Cadastrar {getCategoryFields(slug).label.toLowerCase()}
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-8 text-sm text-slate-500">
              {stores.length} negócio{stores.length > 1 ? "s" : ""} encontrado{stores.length > 1 ? "s" : ""}
            </p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} category={category} />
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}