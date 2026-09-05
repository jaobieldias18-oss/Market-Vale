"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Settings, Image, CreditCard, Package } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Visão geral" },
  { href: "/dashboard/configuracao", label: "Meu site", icon: Settings },
  { href: "/dashboard/produtos", label: "Catálogo", icon: Package },
  { href: "/dashboard/fotos", label: "Fotos", icon: Image },
  { href: "/dashboard/assinatura", label: "Plano", icon: CreditCard },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-3">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
                active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {Icon && <Icon className="size-4" />}
              {link.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </div>
    </div>
  );
}