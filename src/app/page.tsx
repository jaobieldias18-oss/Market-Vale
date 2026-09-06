import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CategoryCard from "@/components/category-card";
import StoreCard from "@/components/store-card";
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

      <section className="relative overflow-hidden bg-emerald-950 text-white">
        <div className="absolute inset-0 opacity-60 [background:radial-gradient(at_20%_12%,rgb(16_185_129/0.25)_0px,transparent_42%),radial-gradient(at_82%_8%,rgb(217_119_6/0.25)_0px,transparent_38%),radial-gradient(at_78%_88%,rgb(180_118_9/0.2)_0px,transparent_40%),radial-gradient(at_4%_84%,rgb(16_185_129/0.2)_0px,transparent_42%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 text-center md:pt-28">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-amber-200">
            <MapPin className="size-3.5" />
            Vale do Ribeira · São Paulo
          </span>

          <h1 className="animate-fade-up mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl">
            Todos os negócios da sua região,{" "}
            <span className="text-amber-400">em um só lugar</span>
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-emerald-100/90">
            Encontre confeitarias, cafeterias, advocacia, mercados e muito mais.
            E se você é lojista, crie o seu site em minutos.
          </p>

          <div className="animate-fade-up mx-auto mt-10 max-w-2xl">
            <SearchBar />
          </div>

          <div className="animate-fade-up mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/cadastro"
              className="group inline-flex items-center gap-2 rounded-lg bg-amber-400 px-7 py-3.5 text-base font-semibold text-emerald-950 transition hover:bg-amber-300"
            >
              Cadastre minha loja
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/#categorias"
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-700 bg-white/5 px-7 py-3.5 text-base font-semibold text-emerald-50 transition hover:border-amber-300 hover:text-amber-200"
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
              <p className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-amber-600">
                <Sparkles className="size-4" /> Os favoritos da região
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-emerald-950 md:text-3xl">
                Em destaque
              </h2>
            </div>
            <Link
              href="/#categorias"
              className="hidden items-center gap-1 text-sm font-semibold text-emerald-700 transition hover:gap-2 sm:flex"
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
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
            Procure por tipo de negócio
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-emerald-950 md:text-4xl">
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

      {recent.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-20">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
                Acabaram de chegar
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-emerald-950 md:text-3xl">
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

      <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-16 px-4 pt-24">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-900 bg-emerald-950 p-8 text-white md:p-14">
          <div className="absolute -left-24 -top-24 size-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 size-72 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute -right-20 -top-16 size-40 rounded-full bg-amber-400/15 blur-3xl" />

          <div className="relative text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
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
              className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-7 py-3.5 font-semibold text-emerald-950 transition hover:bg-amber-300"
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
      className="group flex items-center gap-2 rounded-xl border border-emerald-800 bg-white p-2 pl-5 transition focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-300/40"
    >
      <Search className="size-5 shrink-0 text-slate-400" />
      <input
        name="q"
        placeholder="Buscar negócio ou categoria..."
        className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-amber-400 px-6 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-amber-300"
      >
        Buscar
      </button>
    </form>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-extrabold tracking-tight text-amber-400 md:text-4xl">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-emerald-200/80 md:text-sm">
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
      <div className="mx-auto grid size-14 place-items-center rounded-xl bg-amber-400/15 text-amber-300">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-emerald-200/80">{text}</p>
    </div>
  );
}