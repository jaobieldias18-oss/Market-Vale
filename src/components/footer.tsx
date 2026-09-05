import Link from "next/link";
import { Store } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
              <Store className="size-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              Market<span className="gradient-text">Vale</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            Conectando o Vale do Ribeira. Encontre e divulgue negócios de toda a
            região em um só lugar.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Para lojistas
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/cadastro" className="transition hover:text-emerald-400">
                Crie sua loja
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition hover:text-emerald-400">
                Acessar painel
              </Link>
            </li>
            <li>
              <Link href="/planos" className="transition hover:text-emerald-400">
                Planos e preços
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Região
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>Registro</li>
            <li>Iguape</li>
            <li>Cananeia</li>
            <li>Eldorado</li>
            <li>Juquiá</li>
            <li className="text-slate-500">E toda a região do Vale do Ribeira</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-900 py-5 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Market Vale · Vale do Ribeira, São Paulo
      </div>
    </footer>
  );
}