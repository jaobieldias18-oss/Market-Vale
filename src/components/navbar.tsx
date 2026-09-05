"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Store, LayoutDashboard, Menu, X } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user);
      setLoading(false);
      if (data.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user!.id)
          .maybeSingle()
          .then(({ data: profile }) => setRole(profile?.role ?? null));
      }
    });
  }, [pathname]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-slate-200/70 shadow-[0_4px_24px_-12px_rgb(15_23_42_/_0.15)]"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 transition group-hover:scale-105">
            <Store className="size-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Market<span className="gradient-text">Vale</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          <NavLink href="/" active={pathname === "/"}>
            Início
          </NavLink>
          <NavLink href="/#categorias" active={pathname.startsWith("/categorias")}>
            Categorias
          </NavLink>
          <NavLink href="/#como-funciona" active={false}>
            Como funciona
          </NavLink>
          <NavLink href="/planos" active={pathname.startsWith("/planos")}>
            Planos
          </NavLink>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : hasSession ? (
            <>
              {role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
                >
                  <LayoutDashboard className="size-4" />
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:shadow-lg hover:shadow-emerald-500/30"
              >
                Minha loja
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-500 transition hover:text-red-600"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 transition hover:text-emerald-600"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:shadow-lg hover:shadow-emerald-500/30"
              >
                Criar loja grátis
              </Link>
            </>
          )}
        </div>

        <button
          className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="glass z-50 flex flex-col gap-3 border-t border-slate-200/70 px-4 py-4 md:hidden">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Início
          </Link>
          <Link
            href="/#categorias"
            onClick={() => setOpen(false)}
            className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Categorias
          </Link>
          <Link
            href="/#como-funciona"
            onClick={() => setOpen(false)}
            className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Como funciona
          </Link>
          <Link
            href="/planos"
            onClick={() => setOpen(false)}
            className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Planos
          </Link>
          <div className="mt-2 border-t border-slate-200/70 pt-3">
            {loading ? null : hasSession ? (
              <>
                {role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    Painel Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm font-semibold text-emerald-600"
                >
                  Minha loja
                </Link>
                <button
                  onClick={handleLogout}
                  className="block px-3 py-2 text-sm font-medium text-slate-500"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm font-medium"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  onClick={() => setOpen(false)}
                  className="mt-1 block rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Criar loja grátis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative transition hover:text-emerald-600 ${
        active ? "text-emerald-600" : ""
      } after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-emerald-500 after:transition-all after:duration-300 hover:after:w-full ${
        active ? "after:w-full" : ""
      }`}
    >
      {children}
    </Link>
  );
}