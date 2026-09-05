"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Store, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white">
            <Store className="size-5" />
          </span>
          Market<span className="text-emerald-600">Vale</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/" className="hover:text-emerald-600">Início</Link>
          <Link href="/#categorias" className="hover:text-emerald-600">Categorias</Link>
          <Link href="/#como-funciona" className="hover:text-emerald-600">Como funciona</Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : hasSession ? (
            <>
              {role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                >
                  <LayoutDashboard className="size-4" />
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Minha loja
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-500 hover:text-red-600"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-600">
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Criar loja grátis
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg border border-slate-300 p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <Link href="/" onClick={() => setOpen(false)} className="text-sm font-medium">Início</Link>
          <Link href="/#categorias" onClick={() => setOpen(false)} className="text-sm font-medium">Categorias</Link>
          <Link href="/#como-funciona" onClick={() => setOpen(false)} className="text-sm font-medium">Como funciona</Link>
          {loading ? null : hasSession ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-sm font-semibold text-emerald-600">
                Minha loja
              </Link>
              <button onClick={handleLogout} className="text-left text-sm font-medium text-slate-500">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-medium">Entrar</Link>
              <Link
                href="/cadastro"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Criar loja grátis
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}