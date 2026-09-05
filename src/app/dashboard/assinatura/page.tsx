import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlansSection from "@/components/plans-section";
import type { Plan, Store } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AssinaturaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: storeData } = await supabase.from("stores").select("*").eq("owner_id", user.id).maybeSingle();
  const store = storeData as Store | null;
  if (!store) redirect("/dashboard");

  const { data: plansData } = await supabase.from("plans").select("*").order("sort_order");
  const plans = (plansData as Plan[]) ?? [];

  return <PlansSection store={store} plans={plans} />;
}