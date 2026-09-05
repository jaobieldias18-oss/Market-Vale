import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PlanCards from "@/components/plan-cards";
import { Sparkles, Store as StoreIcon, Palette, Share2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Planos e preços | Market Vale",
  description:
    "Compare os planos Básico, Profissional e Premium e escolha o ideal para o seu negócio no Vale do Ribeira.",
};

export default function PlanosPage() {
  return (
    <>
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-14">
        <div className="text-center">
          <p className="flex items-center justify-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-emerald-600">
            <Sparkles className="size-4" /> Preços simples, sem fidelidade
          </p>
          <h1 className="mx-auto mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Escolha o plano ideal para o seu negócio
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Comece pelo plano que faz sentido para o seu negócio. Todos os planos têm
            página pública e aparecem no catálogo do Market Vale.
          </p>
        </div>
        <div className="mt-12">
          <PlanCards />
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          <Perk
            icon={<StoreIcon className="size-5" />}
            title="Qualquer negócio da região"
            text="Confeitarias, cafeterias, mercados, restaurantes, advocacia, marcenarias e muitos outros."
          />
          <Perk
            icon={<Palette className="size-5" />}
            title="Monte do seu jeito"
            text="Escolha cores, fonte e layout. Sem precisar de conhecimento técnico."
          />
          <Perk
            icon={<Share2 className="size-5" />}
            title="Link exclusivo"
            text="Divulgue marketvale.com.br/loja/seunegocio no WhatsApp e nas redes sociais."
          />
        </div>
      </section>
      <Footer />
    </>
  );
}

function Perk({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <span className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
        {icon}
      </span>
      <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{text}</p>
    </div>
  );
}