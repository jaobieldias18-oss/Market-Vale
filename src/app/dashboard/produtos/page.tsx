import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductManager from "@/components/product-manager";
import type { Store, StoreProduct, StoreTabRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function ProdutosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: storeData } = await supabase.from("stores").select("*").eq("owner_id", user.id).maybeSingle();
  const store = storeData as Store | null;
  if (!store) redirect("/dashboard");

  const [productsRes, tabsRes] = await Promise.all([
    supabase.from("store_products").select("*").eq("store_id", store.id).order("sort_order"),
    supabase.from("store_tabs").select("*").eq("store_id", store.id).order("sort_order"),
  ]);

  return (
    <ProductManager
      store={store}
      products={(productsRes.data as StoreProduct[]) ?? []}
      tabs={(tabsRes.data as StoreTabRow[]) ?? []}
    />
  );
}