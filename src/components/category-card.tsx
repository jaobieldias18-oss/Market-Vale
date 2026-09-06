import Link from "next/link";
import type { Category } from "@/lib/types";
import { ArrowUpRight } from "lucide-react";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categorias/${category.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-900/5"
    >
      <div
        className="absolute -right-6 -top-6 size-24 rounded-full opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
        style={{ backgroundColor: `${category.color}33` }}
      />
      <div className="relative flex items-start justify-between">
        <div
          className="grid size-14 place-items-center rounded-xl text-3xl"
          style={{
            background: `linear-gradient(135deg, ${category.color}24, ${category.color}0d)`,
          }}
        >
          {category.icon}
        </div>
        <ArrowUpRight className="size-4 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-500" />
      </div>
      <h3 className="relative mt-4 font-bold tracking-tight text-slate-900 transition group-hover:text-emerald-700">
        {category.name}
      </h3>
      <p className="relative mt-1 line-clamp-2 text-sm text-slate-500">{category.description}</p>
    </Link>
  );
}