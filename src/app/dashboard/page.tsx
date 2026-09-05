import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateStore from "@/components/create-store";
import { storageUrl, formatDate } from "@/lib/utils";
import type { Store } from "@/lib/types";
import {
  Eye,
  MapPin,
  Share2,
  ArrowRight,
  Star,
  Camera,
  CreditCard,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: storeData } = await supabase.from("stores").select("*").eq("owner_id", user.id).maybeSingle();
  const store = storeData as Store | null;

  if (!store) return <CreateStore />;

  const [catRes, planRes] = await Promise.all([
    store.category_id
      ? supabase.from("categories").select("name, icon").eq("id", store.category_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("plans").select("name").eq("id", store.plan_id).maybeSingle(),
  ]);
  const category = catRes.data as { name: string; icon: string } | null;
  const plan = planRes.data as { name: string } | null;
  const cover = storageUrl(store.cover_url);
  const logo = storageUrl(store.logo_url);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-4">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={store.name} className="size-16 rounded-2xl object-cover" />
        ) : (
          <span className="grid size-16 place-items-center rounded-2xl bg-emerald-100 text-3xl">
            {category?.icon ?? "âœ¨"}
          </span>
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{store.name}</h1>
            {store.is_featured && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                <Star className="size-3" /> Destaque
              </span>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="size-3.5" />
            {store.city || "Vale do Ribeira"} · {category?.name}
          </p>
        </div>
        <a
          href="/dashboard/assinatura"
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
            store.plan_id === "premium"
              ? "bg-slate-900 text-white"
              : store.plan_id === "profissional"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          Plano {plan?.name ?? store.plan_id}
        </a>
      </div>

      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="Capa" className="mt-6 h-44 w-full rounded-2xl object-cover" />
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat icon={<Eye className="size-5" />} value={store.views} label="Visitas na página" />
        <Stat icon={<Share2 className="size-5" />} value="Seu link" label="Compartilhe seu site" />
        <Stat icon={<CreditCard className="size-5" />} value={plan?.name ?? "Básico"} label="Plano atual" />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-800">Seu link exclusivo</h2>
        <p className="mt-1 text-sm text-slate-500">
          Compartilhe este link nas redes sociais e no WhatsApp. Ele mostra tudo sobre a sua loja.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <code className="flex-1 rounded-lg bg-slate-100 px-4 py-2.5 text-sm text-slate-700">
            marketvale.com.br/loja/{store.slug}
          </code>
          <a
            href={`/loja/${store.slug}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Abrir site
          </a>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Criado em {formatDate(store.created_at)}
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <QuickLink icon={<Share2 className="size-5" />} title="Editar informações" desc="Nome, contatos, endereço" href="/dashboard/configuracao" />
        <QuickLink icon={<Camera className="size-5" />} title="Gerenciar fotos" desc="Galeria do seu negócio" href="/dashboard/fotos" />
        <QuickLink icon={<CreditCard className="size-5" />} title="Alterar plano" desc="Básico, Profissional ou Premium" href="/dashboard/assinatura" />
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 text-emerald-600">
        {icon}
        <span className="text-2xl font-bold text-slate-900">{value}</span>
      </div>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function QuickLink({
  icon,
  title,
  desc,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          {icon}
        </span>
        <ArrowRight className="size-4 text-slate-300 group-hover:text-emerald-500" />
      </div>
      <h3 className="mt-3 font-semibold text-slate-800">{title}</h3>
      <p className="mt-0.5 text-sm text-slate-500">{desc}</p>
    </a>
  );
}