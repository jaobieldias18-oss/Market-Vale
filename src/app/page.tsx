import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CategoryCard from "@/components/category-card";
import StoreCard from "@/components/store-card";
import { ValeToWorldScene } from "@/components/vale-scene";
import { CATEGORIES as defaultCategorySlugs, CATEGORY_FIELDS } from "@/lib/constants";
import type { Category, Store } from "@/lib/types";
import {
  Search,
  Store as StoreIcon,
  MousePointerClick,
  Share2,
  ArrowRight,
  MapPin,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const runtime = "edge";

async function getData() {
  const categories: Category[] = [];
  const featured: Store[] = [];
  const recent: Store[] = [];
  const categoryById = new Map<string, Category>();

  const PLAN_PRIORITY: Record<string, number> = { premium: 3, profissional: 2, basico: 1 };

  const supabase = await createClient();
  const [catsRes, storePoolRes, recRes, countRes, citiesRes] = await Promise.allSettled([
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("stores")
      .select("*")
      .eq("status", "active")
      .order("views", { ascending: false })
      .limit(12),
    supabase.from("stores").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(8),
    supabase.from("stores").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("stores").select("city").eq("status", "active"),
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

  if (storePoolRes.status === "fulfilled" && storePoolRes.value.data) {
    const pool = storePoolRes.value.data as Store[];
    pool.sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      const pa = PLAN_PRIORITY[a.plan_id] ?? 0;
      const pb = PLAN_PRIORITY[b.plan_id] ?? 0;
      if (pa !== pb) return pb - pa;
      return (b.views ?? 0) - (a.views ?? 0);
    });
    featured.push(...pool.slice(0, 4));
  }
  if (recRes.status === "fulfilled" && recRes.value.data) {
    recent.push(...(recRes.value.data as Store[]));
  }

  const totalStores =
    countRes.status === "fulfilled" && countRes.value.count != null
      ? countRes.value.count
      : featured.length + recent.length;

  const cityCount =
    citiesRes.status === "fulfilled" && citiesRes.value.data
      ? new Set(
          (citiesRes.value.data as { city: string | null }[])
            .map((c) => c.city?.trim().toLowerCase())
            .filter(Boolean),
        ).size
      : 0;

  return { categories, featured, recent, categoryById, totalStores, cityCount };
}

export default async function HomePage() {
  const { categories, featured, recent, categoryById, totalStores, cityCount } = await getData();

  return (
    <>
      <Navbar />

      <section className="mesh-bg relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center md:pt-24">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/70 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm backdrop-blur">
            <MapPin className="size-3.5" />
            Vale do Ribeira · São Paulo
          </span>

          <h1 className="animate-fade-up mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 md:text-6xl">
            Todos os negócios da sua região,{" "}
            <span className="gradient-text">em um só lugar</span>
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Encontre confeitarias, cafeterias, advocacia, mercados e muito mais.
            E se você é lojista, crie o seu site em minutos.
          </p>

          <div className="animate-fade-up mx-auto mt-10 max-w-2xl">
            <SearchBar />
          </div>

          <div className="animate-fade-up mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/cadastro"
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-xl hover:shadow-emerald-500/40"
            >
              Cadastre minha loja
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/#categorias"
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-7 py-3.5 text-base font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-emerald-300 hover:text-emerald-700"
            >
              Explorar negócios
            </Link>
          </div>

          <div className="animate-fade-up mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4">
            <HeroStat value={String(totalStores)} label="negócios cadastrados" />
            <HeroStat value={String(categories.length)} label="categorias" />
            <HeroStat value={cityCount > 0 ? String(cityCount) : "10"} label="cidades da região" />
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-14">
          <div className="flex items-end justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-emerald-600">
                <Sparkles className="size-4" /> Os favoritos da região
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                Em destaque
              </h2>
            </div>
            <Link
              href="/#categorias"
              className="hidden items-center gap-1 text-sm font-semibold text-emerald-600 transition hover:gap-2 sm:flex"
            >
              Ver todos <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      <section id="categorias" className="mx-auto max-w-6xl scroll-mt-16 px-4 pt-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Procure por tipo de negócio
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Explore por categoria
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Um suporte específico para cada tipo de negócio da região.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 px-6 py-10 text-white shadow-xl md:px-12 md:py-14">
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 size-72 rounded-full bg-emerald-400/15 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
                Conectando a região
              </p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
                Do{" "}
                <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
                  Vale
                </span>{" "}
                para o{" "}
                <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  mundo
                </span>
              </h2>
              <p className="mt-4 max-w-md text-emerald-100/80">
                Do rio às pontes da cidade, o que nasce no Vale do Ribeira
                encontra clientes de qualquer lugar — tudo num link, do jeito
                certo.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/cadastro"
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-900 shadow-lg transition hover:bg-emerald-50"
                >
                  Levar meu negócio ao mundo
                </Link>
                <Link
                  href="/#categorias"
                  className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Conhecer as lojas
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="overflow-hidden rounded-3xl ring-1 ring-white/15 shadow-2xl">
                <ValeToWorldScene />
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />
            </div>
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-20">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
                Acabaram de chegar
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                Novidades da região
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recent.slice(0, 8).map((store) => (
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
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white md:p-14">
          <div className="absolute -left-24 -top-24 size-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 size-72 rounded-full bg-cyan-500/15 blur-3xl" />

          <div className="relative text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
              Para o lojista
            </p>
            <h2 className="mx-auto mt-2 max-w-2xl text-2xl font-extrabold tracking-tight md:text-4xl">
              Tenha um site próprio para o seu negócio
            </h2>
          </div>

          <div className="relative mt-12 grid gap-10 md:grid-cols-3">
            <Step
              icon={<StoreIcon className="size-6" />}
              title="1. Cadastre-se"
              text="Crie sua conta gratuita e escolha a categoria do seu negócio."
            />
            <Step
              icon={<MousePointerClick className="size-6" />}
              title="2. Monte seu site"
              text="Escolha cores, layout, fotos, horários e preencha tudo no seu painel."
            />
            <Step
              icon={<Share2 className="size-6" />}
              title="3. Compartilhe"
              text="Ganhe um link exclusivo: marketvale.com.br/loja/seunegocio."
            />
          </div>

          <div className="relative mt-12 text-center">
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-xl"
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
      className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white p-2 pl-5 shadow-xl shadow-slate-900/5 ring-1 ring-black/5 transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100"
    >
      <Search className="size-5 shrink-0 text-slate-400" />
      <input
        name="q"
        placeholder="Buscar negócio ou categoria..."
        className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:shadow-lg"
      >
        Buscar
      </button>
    </form>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="gradient-text text-3xl font-extrabold tracking-tight md:text-4xl">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500 md:text-sm">
        {label}
      </p>
    </div>
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
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500/25 to-cyan-500/15 text-emerald-300 ring-1 ring-emerald-400/20">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
    </div>
  );
}