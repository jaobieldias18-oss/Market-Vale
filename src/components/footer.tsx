import Link from "next/link";
import { Store } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white">
              <Store className="size-5" />
            </span>
            Market<span className="text-emerald-500">Vale</span>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Conectando o Vale do Ribeira. Encontre e divulgue negócios de toda a
            região em um só lugar.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Para lojistas</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/cadastro" className="hover:text-emerald-400">Crie sua loja grátis</Link></li>
            <li><Link href="/login" className="hover:text-emerald-400">Acessar painel</Link></li>
            <li><Link href="/dashboard/assinatura" className="hover:text-emerald-400">Planos</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Região</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Registro</li>
            <li>Iguape</li>
            <li>Cananeia</li>
            <li>Eldorado</li>
            <li>Juquiá</li>
            <li>E toda a região do Vale do Ribeira</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Market Vale · Vale do Ribeira, São Paulo
      </div>
    </footer>
  );
}