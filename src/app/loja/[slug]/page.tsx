import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StorePage from "@/components/store-page";
import type { Category, Store, StoreGalleryItem, StoreProduct, StoreTabRow } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("stores").select("name, description").eq("slug", slug).maybeSingle();
  return {
    title: data ? data.name : "Negócio",
    description: data?.description ?? "Negócio do Vale do Ribeira",
  };
}

export default async function StoreLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: storeData } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  const store = storeData as Store | null;
  if (!store) notFound();

  try {
    await supabase.rpc("increment_views", { store_id: store.id });
  } catch {
    // views increment is best-effort
  }

  const [catRes, galleryRes, productsRes, tabsRes] = await Promise.allSettled([
    store.category_id
      ? supabase.from("categories").select("*").eq("id", store.category_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("store_gallery").select("*").eq("store_id", store.id).order("sort_order"),
    supabase.from("store_products").select("*").eq("store_id", store.id).eq("is_active", true).order("sort_order"),
    supabase.from("store_tabs").select("*").eq("store_id", store.id).order("sort_order"),
  ]);

  const category =
    catRes.status === "fulfilled" ? (catRes.value as { data: Category | null }).data : null;
  const gallery = galleryRes.status === "fulfilled" ? ((galleryRes.value.data as StoreGalleryItem[]) ?? []) : [];
  const products = productsRes.status === "fulfilled" ? ((productsRes.value.data as StoreProduct[]) ?? []) : [];
  const tabs = tabsRes.status === "fulfilled" ? ((tabsRes.value.data as StoreTabRow[]) ?? []) : [];

  return <StorePage store={store} category={category} gallery={gallery} products={products} tabs={tabs} />;
}