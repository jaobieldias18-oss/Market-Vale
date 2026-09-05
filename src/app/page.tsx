import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CategoryCard from "@/components/category-card";
import StoreCard from "@/components/store-card";
import { CATEGORIES as defaultCategorySlugs, CATEGORY_FIELDS } from "@/lib/constants";
import type { Category, Store } from "@/lib/types";
import { Search, Store as StoreIcon, MousePointerClick, Share2, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getData() {
  const categories: Category[] = [];
  const featured: Store[] = [];
  const recent: Store[] = [];
  const categoryById = new Map<string, Category>();

  const supabase = await createClient();
  const [catsRes, featRes, recRes] = await Promise.allSettled([
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("stores")
      .select("*")
      .eq("status", "active")
      .order("is_featured", { ascending: false })
      .order("views", { ascending: false })
      .limit(3),
    supabase.from("stores").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(6),
  ]);

  if (catsRes.status === "fulfilled" && catsRes.value.data) {
    categories.push(...(catsRes.value.data as Category[]));
  } else {
    for (const slug of defaultCategorySlugs) {
      const meta = CATEGORY_FIELDS[slug] ?? CATEGORY_FIELDS.outros;
      categories.push({
        id: slug,
        slug,
        name: meta.label,
        description: `Encontre ${meta.label.toLowerCase()}s no Vale do Ribeira.`,
        icon: meta.icon,
        color: "#16a34a",
        sort_order: 0,
      });
    }
  }
  for (const c of categories) categoryById.set(c.id, c);

  if (featRes.status === "fulfilled" && featRes.value.data) {
    featured.push(...(featRes.value.data as Store[]));
  }
  if (recRes.status === "fulfilled" && recRes.value.data) {
    recent.push(...(recRes.value.data as Store[]));
  }

  return { categories, featured, recent, categoryById };
}

export default async function HomePage() {
  const { categories, featured, recent, categoryById } = await getData();

  return (
    <>
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            🌿 Vale do Ribeira, São Paulo
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
            Todos os negócios da sua região,{" "}
            <span className="text-emerald-600">em um só lugar</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Encontre confeitarias, cafeterias, advocacia, mercados e muito mais.
            E se você é lojista, crie o seu site grátis em minutos.
          </p>
          <SearchBar />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/cadastro"
              className="rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Cadastre minha loja grátis
            </Link>
            <Link
              href="/#categorias"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50"
            >
              Explorar negócios
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Em destaque</h2>
            <Link href="/#categorias" className="text-sm font-medium text-emerald-600 hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                category={store.category_id ? categoryById.get(store.category_id) : null}
              />
            ))}
          </div>
        </section>
      )}

      <section id="categorias" className="mx-auto max-w-6xl scroll-mt-16 px-4 pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Explore por categoria</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Um suporte específico para cada tipo de negócio da região.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-16">
          <h2 className="text-2xl font-bold text-slate-900">Novidades da região</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                category={store.category_id ? categoryById.get(store.category_id) : null}
              />
            ))}
          </div>
        </section>
      )}

      <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-16 px-4 pt-20">
        <div className="rounded-3xl bg-slate-900 p-8 text-white md:p-12">
          <h2 className="text-center text-2xl font-bold md:text-3xl">Como funciona para o lojista</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <Step
              icon={<StoreIcon className="size-6" />}
              title="1. Cadastre-se"
              text="Crie sua conta gratuita e escolha a categoria do seu negócio."
            />
            <Step
              icon={<MousePointerClick className="size-6" />}
              title="2. Monte seu site"
              text="Escolha cores, fotos, horários e preencha as informações no seu painel."
            />
            <Step
              icon={<Share2 className="size-6" />}
              title="3. Compartilhe"
              text="Ganhe um link exclusivo do tipo marketvale.com.br/u/seunegocio."
            />
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-400"
            >
              Começar agora <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function SearchBar() {
  return (
    <form
      action="/categorias/outros"
      className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
    >
      <Search className="ml-2 size-5 text-slate-400" />
      <input
        name="q"
        placeholder="Buscar negócio ou categoria..."
        className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
      />
      <button
        type="submit"
        className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Buscar
      </button>
    </form>
  );
}

function Step({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{text}</p>
    </div>
  );
}