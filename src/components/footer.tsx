import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-emerald-900 bg-emerald-950 text-emerald-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Market Vale" className="size-10 rounded-full object-cover" />
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-emerald-200/70">
            Conectando o Vale do Ribeira. Encontre e divulgue negócios de toda a
            região em um só lugar.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300">
            Para lojistas
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/cadastro" className="text-emerald-100 transition hover:text-amber-300">
                Crie sua loja
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-emerald-100 transition hover:text-amber-300">
                Acessar painel
              </Link>
            </li>
            <li>
              <Link href="/planos" className="text-emerald-100 transition hover:text-amber-300">
                Planos e preços
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300">
            Região
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li className="text-emerald-100">Registro</li>
            <li className="text-emerald-100">Iguape</li>
            <li className="text-emerald-100">Cananeia</li>
            <li className="text-emerald-100">Eldorado</li>
            <li className="text-emerald-100">Juquiá</li>
            <li className="text-emerald-200/60">E toda a região do Vale do Ribeira</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-emerald-900 py-5 text-center text-xs text-emerald-200/60">
        © {new Date().getFullYear()} Market Vale · Vale do Ribeira, São Paulo
      </div>
    </footer>
  );
}