import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StorePage from "@/components/store-page";
import type { Category, Store, StoreGalleryItem, StoreProduct } from "@/lib/types";

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

  const [catRes, galleryRes, productsRes] = await Promise.all([
    store.category_id
      ? supabase.from("categories").select("*").eq("id", store.category_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("store_gallery").select("*").eq("store_id", store.id).order("sort_order"),
    supabase.from("store_products").select("*").eq("store_id", store.id).eq("is_active", true).order("sort_order"),
  ]);

  const category = (catRes as { data: Category | null }).data;
  const gallery = (galleryRes.data as StoreGalleryItem[]) ?? [];
  const products = (productsRes.data as StoreProduct[]) ?? [];

  return <StorePage store={store} category={category} gallery={gallery} products={products} />;
}