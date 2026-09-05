import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StoreSettings from "@/components/store-settings";
import type { Category, Store } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ConfiguracaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: storeData } = await supabase.from("stores").select("*").eq("owner_id", user.id).maybeSingle();
  const store = storeData as Store | null;
  if (!store) redirect("/dashboard");

  const { data: categoriesData } = await supabase.from("categories").select("*").order("sort_order");
  const categories = (categoriesData as Category[]) ?? [];

  return <StoreSettings store={store} categories={categories} />;
}