-- ============================================================
-- MARKET VALE - TABELA DE PRODUTOS + RLS
-- Cole TUDO abaixo no SQL Editor do Supabase e clique em "Run"
-- ============================================================

create table if not exists public.store_products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  description text,
  price numeric,
  image_url text,
  category text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger handle_updated_at_products before update on public.store_products
  for each row execute procedure extensions.moddatetime(updated_at);

alter table public.store_products enable row level security;

create policy "products public read active" on public.store_products
  for select using (store_id in (select id from public.stores where status = 'active'));

create policy "products owner all" on public.store_products
  for all using (
    auth.uid() in (select owner_id from public.stores where id = store_id)
  );

create policy "products admin all" on public.store_products
  for all using (public.is_admin());
