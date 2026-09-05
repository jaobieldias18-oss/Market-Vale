import type { ReactNode } from "react";
import type { Category, DetailField, Store, StoreGalleryItem } from "@/lib/types";
import { getCategoryFields } from "@/lib/constants";
import {
  storageUrl,
  whatsappLink,
  mapLink,
  DAY_LABELS,
} from "@/lib/utils";
import StoreTabs, { type StoreTab } from "@/components/store-tabs";
import {
  Clock,
  Facebook,
  Instagram,
  Link as LinkIcon,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Utensils,
} from "lucide-react";

const GROUP_CARDAPIO = new Set([
  "cardapio",
  "especialidades",
  "encomendas",
  "reservas",
  "entrega",
  "delivery",
  "bebida",
  "prato",
  "feira",
  "petisco",
  "buffet",
]);

const GROUP_SERVICOS = new Set([
  "servico",
  "servicos",
  "atendimento",
  "atuacao",
  "agendamento",
  "plantao",
  "guincho",
  "orcamento",
  "tamanho",
  "numero",
  "novidade",
  "regioes",
]);

function linkBadgeMeta(label: string) {
  const l = label.toLowerCase();
  if (l.includes("instagram"))
    return { icon: <Instagram className="size-4" />, cls: "bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white" };
  if (l.includes("ifood"))
    return { icon: <Utensils className="size-4" />, cls: "bg-[#ea1d2c] text-white" };
  if (l.includes("aiqfome"))
    return { icon: <Utensils className="size-4" />, cls: "bg-[#ff6900] text-white" };
  if (l.includes("whatsapp"))
    return { icon: <MessageCircle className="size-4" />, cls: "bg-[#25d366] text-white" };
  if (l.includes("facebook"))
    return { icon: <Facebook className="size-4" />, cls: "bg-[#1877f2] text-white" };
  if (l.includes("maps"))
    return { icon: <MapPin className="size-4" />, cls: "bg-white border border-slate-300 text-slate-700" };
  return { icon: <LinkIcon className="size-4" />, cls: "bg-white border border-slate-300 text-slate-700" };
}

function ExternalLinks({ store, center }: { store: Store; center?: boolean }) {
  const links = (store.links ?? []).filter((l) => l.label && l.url);
  if (links.length === 0) return null;
  return (
    <div className={`mt-4 flex flex-wrap gap-2 ${center ? "justify-center" : ""}`}>
      {links.map((link, i) => {
        const meta = linkBadgeMeta(link.label);
        return (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition hover:opacity-90 ${meta.cls}`}
          >
            {meta.icon} {link.label}
          </a>
        );
      })}
    </div>
  );
}

const TEMPLATES: Record<string, string> = {
  classico: "centered",
  moderno: "split",
  elegante: "elegant",
};

const FONTS: Record<string, string> = {
  sans: "ui-sans-serif, system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, 'Cascadia Code', monospace",
};

function DetailValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return (
      <ul className="flex flex-wrap gap-2">
        {value.map((item, i) => (
          <li
            key={i}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm"
          >
            {String(item)}
          </li>
        ))}
      </ul>
    );
  }
  if (value === null || value === undefined || value === "") return null;
  return <p className="text-sm text-slate-700">{String(value)}</p>;
}

export default function StorePage({
  store,
  category,
  gallery,
}: {
  store: Store;
  category: Category | null;
  gallery: StoreGalleryItem[];
}) {
  const theme = store.theme ?? { primary: "#16a34a", secondary: "#064e3b", font: "sans" };
  const template = TEMPLATES[store.template] ?? "centered";
  const font = FONTS[theme.font] ?? FONTS.sans;
  const categoryFields = getCategoryFields(category?.slug ?? null);

  const logo = storageUrl(store.logo_url);
  const cover = storageUrl(store.cover_url);
  const detailsEntries = (Object.entries(categoryFields.fields) as [string, DetailField][]).filter(([, field]) => {
    const value = store.details?.[field.key];
    if (Array.isArray(value)) return (value as unknown[]).length > 0;
    return !!value;
  });
  const hasHours = Array.isArray(store.opening_hours) && store.opening_hours.length > 0;

  const premium = store.plan_id === "premium";

  const sobreEntries = detailsEntries.filter(
    ([, field]) => !GROUP_CARDAPIO.has(field.key) && !GROUP_SERVICOS.has(field.key)
  );
  const cardapioEntries = detailsEntries.filter(([, field]) => GROUP_CARDAPIO.has(field.key));
  const servicosEntries = detailsEntries.filter(([, field]) => GROUP_SERVICOS.has(field.key));

  const tabs: StoreTab[] = [];

  const sobreContent: ReactNode[] = [];
  if (store.description) {
    sobreContent.push(
      <p key="desc" className="text-pretty leading-relaxed text-slate-700">
        {store.description}
      </p>
    );
  }
  if (sobreEntries.length > 0) {
    sobreContent.push(
      <div key="info">
        <h2 className="text-lg font-semibold" style={{ color: theme.primary }}>
          Informações
        </h2>
        <div className="mt-4">
          <FieldRows entries={sobreEntries} store={store} />
        </div>
      </div>
    );
  }
  if (hasHours) {
    sobreContent.push(
      <div key="horas">
        <h2 className="text-lg font-semibold" style={{ color: theme.primary }}>
          Horário de funcionamento
        </h2>
        <div className="mt-4">
          <HoursBody store={store} accent={theme.primary} />
        </div>
      </div>
    );
  }
  tabs.push({ id: "sobre", label: "Sobre", content: <div className="grid gap-8">{sobreContent}</div> });

  if (cardapioEntries.length > 0) {
    tabs.push({
      id: "cardapio",
      label: "Cardápio",
      content: <FieldRows entries={cardapioEntries} store={store} />,
    });
  }
  if (servicosEntries.length > 0) {
    tabs.push({
      id: "servicos",
      label: "Serviços",
      content: <FieldRows entries={servicosEntries} store={store} />,
    });
  }
  if (premium && gallery.length > 0) {
    tabs.push({
      id: "fotos",
      label: "Fotos",
      content: <Gallery gallery={gallery} accent={theme.primary} heading="Fotos" />,
    });
  }

  const body = <StoreTabs tabs={tabs} accent={theme.primary} />;

  if (template === "elegant") {
    return (
      <div style={{ fontFamily: font, backgroundColor: "#faf9f7" }} className="min-h-screen text-stone-800">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={store.name} className="h-64 w-full object-cover" />
        ) : (
          <div className="h-40 w-full" style={{ backgroundColor: theme.primary }} />
        )}
        <div className="mx-auto max-w-3xl px-4 pb-16">
          <div className="-mt-14 grid size-28 place-items-center overflow-hidden rounded-full border-4 border-stone-100 shadow" style={{ backgroundColor: "#fff" }}>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={store.name} className="size-full object-cover" />
            ) : (
              <span className="text-4xl">{category?.icon ?? "✨"}</span>
            )}
          </div>
          <h1 className="mt-4 text-center text-4xl" style={{ fontFamily: font }}>{store.name}</h1>
          {store.city && <p className="mt-1 text-center text-sm uppercase tracking-widest text-stone-500">{store.city} · Vale do Ribeira</p>}
          {premium && (
            <div className="mt-3 flex justify-center"><Badge text="Premium" /></div>
          )}
          <div className="mt-8">{body}</div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ContactButtons store={store} accent={theme.primary} />
          </div>
          <ExternalLinks store={store} center />
        </div>
      </div>
    );
  }

  if (template === "split") {
    return (
      <div style={{ fontFamily: font }} className="min-h-screen bg-white text-slate-900">
        <header className="relative h-56 w-full overflow-hidden md:h-64" style={{ backgroundColor: theme.secondary }}>
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={store.name} className="size-full object-cover opacity-90" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-6xl opacity-40">{category?.icon ?? "✨"}</div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
        </header>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[280px_1fr]">
          <aside>
            <div className="-mt-24 grid size-40 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={store.name} className="size-full object-cover" />
              ) : (
                <span className="text-5xl">{category?.icon ?? "✨"}</span>
              )}
            </div>
            <h1 className="mt-4 text-2xl font-bold">{store.name}</h1>
            <p className="text-sm" style={{ color: theme.primary }}>{category?.name ?? "Negócio local"}</p>
            {premium && <Badge text="Premium" />}
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <ContactList store={store} accent={theme.primary} />
            </div>
            <ExternalLinks store={store} />
          </aside>

          <main>{body}</main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: font }} className="min-h-screen bg-slate-50 text-slate-900">
      <div className="h-2 w-full" style={{ backgroundColor: theme.primary }} />
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt={store.name} className="h-48 w-full object-cover md:h-64" />
      )}
      <div className="mx-auto max-w-2xl px-4 pb-16">
        <div className="-mt-12 grid size-24 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={store.name} className="size-full object-cover" />
          ) : (
            <span className="text-3xl">{category?.icon ?? "✨"}</span>
          )}
        </div>

        <div className="mt-4 text-center">
          <h1 className="text-3xl font-bold">{store.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {category?.name ?? "Negócio local"}
            {store.city ? ` · ${store.city}` : ""}
          </p>
          {premium && (
            <div className="mt-2 flex justify-center"><Badge text="Premium" /></div>
          )}
        </div>

        <div className="mt-8">{body}</div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ContactButtons store={store} accent={theme.primary} />
        </div>
        <ExternalLinks store={store} center />
      </div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-block rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950">
      {text}
    </span>
  );
}

function FieldRows({
  entries,
  store,
}: {
  entries: [string, DetailField][];
  store: Store;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {entries.map(([, field]) => (
        <div key={field.key} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium text-slate-500">{field.label}</p>
          <div className="mt-1">
            <DetailValue value={store.details?.[field.key]} />
          </div>
        </div>
      ))}
    </div>
  );
}

function HoursBody({ store, accent }: { store: Store; accent: string }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {(store.opening_hours ?? []).map((h) => (
        <li key={h.day} className="flex justify-between border-b border-dashed border-slate-300 pb-1">
          <span className="font-medium">{DAY_LABELS[h.day]}</span>
          <span style={{ color: h.closed ? undefined : accent }}>
            {h.closed ? "Fechado" : `${h.open} – ${h.close}`}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Gallery({ gallery, accent, heading = "Galeria" }: { gallery: StoreGalleryItem[]; accent: string; heading?: string }) {
  if (gallery.length === 0) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold" style={{ color: accent }}>{heading}</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {gallery.map((item) => {
          const url = storageUrl(item.url);
          if (!url) return null;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={item.id}
              src={url}
              alt={item.caption ?? ""}
              className="aspect-square w-full rounded-xl object-cover"
              loading="lazy"
            />
          );
        })}
      </div>
    </section>
  );
}

function ContactList({ store, accent }: { store: Store; accent: string }) {
  return (
    <>
      {store.phone && (
        <a className="flex items-center gap-2 hover:underline" href={`tel:${store.phone}`}>
          <Phone className="size-4" style={{ color: accent }} /> {store.phone}
        </a>
      )}
      {store.whatsapp && (
        <a className="flex items-center gap-2 hover:underline" href={whatsappLink(store.whatsapp)} target="_blank" rel="noreferrer">
          <MessageCircle className="size-4" style={{ color: accent }} /> {store.whatsapp}
        </a>
      )}
      {store.email && (
        <a className="flex items-center gap-2 hover:underline" href={`mailto:${store.email}`}>
          <Mail className="size-4" style={{ color: accent }} /> {store.email}
        </a>
      )}
      {store.address && store.city && (
        <a className="flex items-start gap-2 hover:underline" href={mapLink(store.address, store.city)} target="_blank" rel="noreferrer">
          <MapPin className="mt-0.5 size-4 shrink-0" style={{ color: accent }} />
          {store.address}, {store.city}
        </a>
      )}
    </>
  );
}

function ContactButtons({ store, accent }: { store: Store; accent: string }) {
  return (
    <>
      {store.whatsapp && (
        <a
          href={whatsappLink(store.whatsapp)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: accent }}
        >
          <MessageCircle className="size-4" /> WhatsApp
        </a>
      )}
      {store.phone && (
        <a
          href={`tel:${store.phone}`}
          className="flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-100"
        >
          <Phone className="size-4" /> {store.phone}
        </a>
      )}
      {store.instagram && (
        <a
          href={`https://instagram.com/${store.instagram.replace(/^@/, "")}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-100"
        >
          <Instagram className="size-4" /> @{store.instagram.replace(/^@/, "")}
        </a>
      )}
      {store.facebook && (
        <a
          href={store.facebook}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-100"
        >
          <Facebook className="size-4" /> Facebook
        </a>
      )}
      {store.website && (
        <a
          href={store.website}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-100"
        >
          <LinkIcon className="size-4" /> Site
        </a>
      )}
      {store.opening_hours?.length && (
        <span className="flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm">
          <Clock className="size-4" /> Consultar horários
        </span>
      )}
    </>
  );
}