import Link from "next/link";
import type { Category } from "@/lib/types";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categorias/${category.slug}`}
      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
    >
      <div
        className="grid size-12 place-items-center rounded-xl text-2xl"
        style={{ backgroundColor: `${category.color}18` }}
      >
        {category.icon}
      </div>
      <h3 className="mt-3 font-semibold text-slate-800 group-hover:text-emerald-700">
        {category.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{category.description}</p>
    </Link>
  );
}