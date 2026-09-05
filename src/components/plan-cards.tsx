import { PLANS, PLAN_MATRIX } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { PlanId } from "@/lib/types";
import { Check, Minus } from "lucide-react";

const HIGHLIGHT: Record<string, string> = {
  basico: "border-slate-200 bg-white",
  profissional: "border-transparent bg-gradient-to-b from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-500/25",
  premium: "border-transparent bg-slate-950 text-white shadow-xl shadow-slate-900/25",
};

const HIGHLIGHT_LABEL: Record<string, string> = {
  basico: "text-slate-400",
  profissional: "text-emerald-100",
  premium: "text-slate-400",
};

export default function PlanCards({
  selected,
  onSelect,
  ctaHref,
}: {
  selected?: PlanId;
  onSelect?: (id: PlanId) => void;
  ctaHref?: string;
}) {
  const selectable = !!onSelect;
  const Clickable = selectable ? "button" : "a";

  return (
    <div>
      <div className="grid gap-5 md:grid-cols-3">
        {PLANS.map((plan) => {
          const price = Number(plan.price_monthly);
          const isCurrent = selected === plan.id;
          const highlight = HIGHLIGHT[plan.id];
          const highlightLabel = HIGHLIGHT_LABEL[plan.id];

          const wrapper = selectable
            ? {
                onClick: () => onSelect!(plan.id),
                ...(isCurrent ? { "aria-pressed": true } : {}),
              }
            : { href: ctaHref ?? "/cadastro" };

          return (
            <Clickable
              key={plan.id}
              {...(wrapper as Record<string, string>)}
              className={`relative flex flex-col rounded-3xl border p-6 text-left transition duration-200 ${
                selectable
                  ? isCurrent
                    ? "border-emerald-500 ring-2 ring-emerald-200 shadow-lg"
                    : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md"
                  : `${highlight} hover:-translate-y-1`
              }`}
            >
              {plan.id === "profissional" && (
                <span
                  className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-bold shadow-sm ${
                    selectable
                      ? "bg-amber-400 text-amber-950"
                      : "bg-amber-400 text-amber-950"
                  }`}
                >
                  MAIS POPULAR
                </span>
              )}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold tracking-tight">{plan.name}</h3>
                {selectable && (
                  <span
                    className={`grid size-5 place-items-center rounded-full border-2 ${
                      isCurrent
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {isCurrent && <Check className="size-3" />}
                  </span>
                )}
              </div>
              <p className={`mt-2 text-3xl font-extrabold tracking-tight ${highlightLabel}`}>
                {price === 0 ? (
                  "Grátis"
                ) : (
                  <>
                    {formatPrice(price)}
                    <span className={`text-sm font-medium ${highlightLabel}`}>/mês</span>
                  </>
                )}
              </p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {(plan.features as string[]).map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span className={highlightLabel}>{feature}</span>
                  </li>
                ))}
              </ul>
              {selectable ? (
                <span
                  className={`mt-5 rounded-full py-2.5 text-center text-sm font-semibold transition ${
                    isCurrent
                      ? "border border-emerald-500 text-emerald-600"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {isCurrent ? "Plano selecionado" : "Selecionar"}
                </span>
              ) : (
                <span
                  className={`mt-5 rounded-full py-2.5 text-center text-sm font-semibold transition ${
                    plan.id === "basico"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25"
                      : plan.id === "premium"
                        ? "bg-white text-slate-900 hover:bg-slate-100"
                        : "bg-white text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {plan.id === "basico" ? "Comece grátis" : `Quero ${plan.name}`}
                </span>
              )}
            </Clickable>
          );
        })}
      </div>

      <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-5 py-4 font-semibold">Comparar planos</th>
              {PLANS.map((plan) => (
                <th key={plan.id} className="px-5 py-4 text-center font-semibold">
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {PLAN_MATRIX.map((row, i) => (
              <tr key={row.label} className={i % 2 ? "bg-slate-50/50" : ""}>
                <td className="px-5 py-3 font-medium text-slate-700">{row.label}</td>
                {PLANS.map((plan) => (
                  <td key={plan.id} className="px-5 py-3 text-center">
                    {row.plans.includes(plan.id) ? (
                      <Check className="mx-auto size-5 text-emerald-500" />
                    ) : (
                      <span className="mx-auto grid size-5 place-items-center">
                        <Minus className="size-4 text-slate-300" />
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Assinatura simples, sem fidelidade. Você define o plano na hora de criar a loja.
      </p>
    </div>
  );
}