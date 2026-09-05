import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GalleryManager from "@/components/gallery-manager";
import type { Store, StoreGalleryItem } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function FotosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: storeData } = await supabase.from("stores").select("*").eq("owner_id", user.id).maybeSingle();
  const store = storeData as Store | null;
  if (!store) redirect("/dashboard");

  const { data: gallery } = await supabase
    .from("store_gallery")
    .select("*")
    .eq("store_id", store.id)
    .order("sort_order");

  return <GalleryManager store={store} items={(gallery as StoreGalleryItem[]) ?? []} />;
}