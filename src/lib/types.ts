export type PlanId = "basico" | "profissional" | "premium";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  price_monthly: number;
  features: string[];
  sort_order: number;
}

export interface ExternalLink {
  label: string;
  url: string;
}

export interface OpeningHour {
  day: number;
  open: string;
  close: string;
  closed: boolean;
}

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  category_id: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  cep: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  links: ExternalLink[] | null;
  opening_hours: OpeningHour[] | null;
  details: Record<string, unknown>;
  plan_id: PlanId;
  template: string;
  theme: { primary: string; secondary: string; font: string };
  status: "active" | "inactive";
  is_featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  role: "owner" | "admin";
  avatar_url: string | null;
  created_at: string;
}

export interface StoreGalleryItem {
  id: string;
  store_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
}

export interface StoreProduct {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface DetailField {
  key: string;
  label: string;
  placeholder?: string;
  type: "text" | "textarea" | "list";
}

export interface CategoryFields {
  icon: string;
  label: string;
  fields: DetailField[];
}