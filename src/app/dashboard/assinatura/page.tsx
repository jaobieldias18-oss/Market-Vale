import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlansSection from "@/components/plans-section";
import type { Store } from "@/lib/types";

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

  return <PlansSection store={store} />;
}