-- ============================================================
-- MARKET VALE - ABAS CUSTOMIZADAS DO SITE DA LOJA + MIGRATION
-- Cole TUDO abaixo no SQL Editor do Supabase e clique em "Run"
-- ============================================================

-- Abas que o dono da loja cria (ex.: "Feminino", "Promoções")
create table if not exists public.store_tabs (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  label text not null,
  payment_methods jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Cada produto passa a pertencer a uma aba
alter table public.store_products
  add column if not exists tab_id uuid references public.store_tabs(id) on delete set null;

-- RLS
alter table public.store_tabs enable row level security;

create policy "tabs public read active" on public.store_tabs
  for select using (store_id in (select id from public.stores where status = 'active'));

create policy "tabs owner all" on public.store_tabs
  for all using (
    auth.uid() in (select owner_id from public.stores where id = store_id)
  );

create policy "tabs admin all" on public.store_tabs
  for all using (public.is_admin());