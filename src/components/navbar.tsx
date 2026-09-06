"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, Menu, X } from "lucide-react";

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
    setHasSession(false);
    setRole(null);
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
      className={`sticky top-0 z-40 bg-emerald-950 text-white transition-all duration-300 ${
        scrolled ? "shadow-lg shadow-emerald-950/20" : ""
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center">
          <span className="grid size-9 place-items-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Market Vale" className="size-9 rounded-full object-cover" />
          </span>
        </Link>

        <div className="hidden items-center gap-7 text-sm font-medium text-emerald-100 md:flex">
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
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-700 bg-emerald-900 px-3.5 py-2 text-sm font-semibold text-emerald-50 transition hover:border-emerald-600"
                >
                  <LayoutDashboard className="size-4" />
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-amber-300"
              >
                Minha loja
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-emerald-200 transition hover:text-amber-300"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-emerald-100 transition hover:text-amber-300"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-amber-300"
              >
                Criar loja
              </Link>
            </>
          )}
        </div>

        <button
          className="grid size-10 place-items-center rounded-lg border border-emerald-700 bg-emerald-900 text-emerald-50 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-3 border-t border-emerald-800 bg-emerald-950 px-4 py-4 md:hidden">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-900"
          >
            Início
          </Link>
          <Link
            href="/#categorias"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-900"
          >
            Categorias
          </Link>
          <Link
            href="/#como-funciona"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-900"
          >
            Como funciona
          </Link>
          <Link
            href="/planos"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-900"
          >
            Planos
          </Link>
          <div className="mt-2 border-t border-emerald-800 pt-3">
            {loading ? null : hasSession ? (
              <>
                {role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-amber-300"
                  >
                    Painel Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-amber-300"
                >
                  Minha loja
                </Link>
                <button
                  onClick={handleLogout}
                  className="block px-3 py-2 text-sm font-medium text-emerald-200"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-emerald-100"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  onClick={() => setOpen(false)}
                  className="mt-1 block rounded-lg bg-amber-400 px-3 py-2.5 text-center text-sm font-semibold text-emerald-950 hover:bg-amber-300"
                >
                  Criar loja
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
      className={`relative transition hover:text-amber-300 ${
        active ? "text-amber-300" : ""
      } after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-amber-400 after:transition-all after:duration-300 hover:after:w-full ${
        active ? "after:w-full" : ""
      }`}
    >
      {children}
    </Link>
  );
}