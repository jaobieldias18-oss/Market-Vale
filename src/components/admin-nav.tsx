"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Building2,
  FolderTree,
  FileText,
  Users,
  LogOut,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/lojas", label: "Lojas", icon: Building2 },
  { href: "/admin/categorias", label: "Categorias", icon: FolderTree },
  { href: "/admin/planos", label: "Planos", icon: FileText },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="w-full shrink-0 border-b border-slate-200 bg-white md:w-60 md:border-b-0 md:border-r">
      <nav className="flex gap-1 p-2 md:flex-col">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium md:flex-none ${
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 md:flex-none"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </nav>
    </aside>
  );
}