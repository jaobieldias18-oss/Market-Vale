export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function storageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || base.includes("SEU-PROJETO")) return null;
  return `${base}/storage/v1/object/public/marketvale/${path}`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR");
}

export function whatsappLink(number: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/55${digits}`;
}

export function mapLink(address: string, city: string): string {
  const query = encodeURIComponent(`${address}, ${city}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function normalizeUrl(url: string): string {
  const value = url.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.includes(".")) return `https://${value}`;
  return value;
}

export const DAY_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];