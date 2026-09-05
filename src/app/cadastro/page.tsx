"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Store, Check, ArrowRight } from "lucide-react";
import PlanCards from "@/components/plan-cards";
import type { PlanId } from "@/lib/types";

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState<"planos" | "conta">("planos");
  const [planid, setPlanId] = useState<PlanId>("basico");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push(`/dashboard?plano=${planid}`);
      router.refresh();
    } else {
      setError("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-5xl px-4">
      <div className="flex flex-col items-center text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-emerald-600 text-white">
          <Store className="size-6" />
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
          Crie sua loja grátis
        </h1>
        <p className="mt-2 max-w-xl text-slate-500">
          Escolha o plano que faz sentido para o seu negócio. Você pode começar
          grátis e fazer upgrade quando quiser.
        </p>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-xl gap-2 rounded-full border border-slate-200 bg-white p-1.5 shadow-sm">
        <StepButton
          active={step === "planos"}
          onClick={() => setStep("planos")}
          done={step === "conta"}
          label="1. Escolha o plano"
        />
        <StepButton
          active={step === "conta"}
          onClick={() => setStep("conta")}
          done={false}
          label="2. Criar conta"
        />
      </div>

      {step === "planos" ? (
        <div className="mt-8">
          <PlanCards
            selected={planid}
            onSelect={setPlanId}
          />
          <div className="mt-6 text-center">
            <button
              onClick={() => setStep("conta")}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-xl"
            >
              Continuar com o plano {planName(planid)} <ArrowRight className="size-4" />
            </button>
            <p className="mt-3 text-xs text-slate-400">
              Você pode trocar de plano depois, direto no seu painel.
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-8 max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <Check className="size-4 shrink-0" />
              Plano escolhido:{" "}
              <span className="font-bold">{planName(planid)}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Seu nome">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Maria da Silva"
                />
              </Field>
              <Field label="E-mail">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="voce@email.com"
                />
              </Field>
              <Field label="Senha">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Mínimo de 6 caracteres"
                />
              </Field>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "Criando conta..." : "Criar conta"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Já tem conta?{" "}
              <Link href="/login" className="font-medium text-emerald-600 hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      )}

      <p className="mt-6 pb-4 text-center text-xs text-slate-400">
        <Link href="/" className="hover:text-emerald-600">← Voltar para o início</Link>
      </p>
    </div>
  );
}

function StepButton({
  active,
  done,
  label,
  onClick,
}: {
  active: boolean;
  done: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
        active ? "bg-emerald-600 text-white shadow" : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {done && <Check className="size-4" />}
      {label}
    </button>
  );
}

function planName(id: PlanId) {
  switch (id) {
    case "profissional":
      return "Profissional";
    case "premium":
      return "Premium";
    default:
      return "Básico";
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}