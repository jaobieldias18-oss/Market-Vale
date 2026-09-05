-- ============================================================
-- MARKET VALE - SCHEMA
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

create extension if not exists moddatetime schema extensions;

-- ------------------------------------------------------------
-- PLANOS (assinaturas)
-- ------------------------------------------------------------
create table if not exists public.plans (
  id text primary key,
  name text not null,
  price_monthly numeric not null default 0,
  features jsonb not null default '[]'::jsonb,
  sort_order int not null default 0
);

-- ------------------------------------------------------------
-- PERFIS (1 por usuário autenticado)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  role text not null default 'owner' check (role in ('owner', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ------------------------------------------------------------
-- CATEGORIAS DE NEGÓCIO
-- ------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  icon text,
  color text default '#16a34a',
  sort_order int not null default 0
);

-- ------------------------------------------------------------
-- LOJAS / NEGÓCIOS
-- ------------------------------------------------------------
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text unique not null,
  category_id uuid references public.categories(id),
  description text,
  logo_url text,
  cover_url text,
  phone text,
  whatsapp text,
  email text,
  address text,
  city text,
  cep text,
  instagram text,
  facebook text,
  website text,
  links jsonb not null default '[]'::jsonb,
  opening_hours jsonb,
  details jsonb not null default '{}'::jsonb,
  plan_id text not null default 'basico' references public.plans(id),
  template text not null default 'classico',
  theme jsonb not null default '{"primary":"#16a34a","secondary":"#064e3b","font":"sans"}'::jsonb,
  status text not null default 'active' check (status in ('active', 'inactive')),
  is_featured boolean not null default false,
  views bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger handle_updated_at before update on public.stores
  for each row execute procedure extensions.moddatetime(updated_at);

-- ------------------------------------------------------------
-- ASSINATURAS (histórico por loja)
-- ------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  plan_id text not null references public.plans(id),
  status text not null default 'active' check (status in ('pending', 'active', 'canceled')),
  provider text not null default 'manual',
  stripe_customer_id text,
  stripe_subscription_id text,
  started_at timestamptz not null default now(),
  renews_at timestamptz
);

create unique index if not exists subscriptions_stripe_subscription_key
  on public.subscriptions(stripe_subscription_id)
  where stripe_subscription_id is not null;

-- ------------------------------------------------------------
-- GALERIA DE FOTOS
-- ------------------------------------------------------------
create table if not exists public.store_gallery (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  url text not null,
  caption text,
  sort_order int not null default 0
);

-- ------------------------------------------------------------
-- TRIGGER: cria perfil automaticamente no cadastro
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- FUNÇÃO: incrementar visitas ao acessar a página da loja
-- ------------------------------------------------------------
create or replace function public.increment_views(store_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.stores set views = views + 1 where id = store_id;
$$;

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table public.plans enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.stores enable row level security;
alter table public.subscriptions enable row level security;
alter table public.store_gallery enable row level security;

-- planos: qualquer um pode ler
create policy "plans public read" on public.plans
  for select using (true);
create policy "plans admin write" on public.plans
  for all using (public.is_admin());

-- perfis: usuário lê/atualiza o próprio; admin lê tudo
create policy "profiles read own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles admin all" on public.profiles
  for all using (public.is_admin());

-- categorias: público lê; admin escreve
create policy "categories public read" on public.categories
  for select using (true);
create policy "categories admin write" on public.categories
  for all using (public.is_admin());

-- lojas: público lê ativas; dono gerencia; admin gerencia tudo
create policy "stores public read active" on public.stores
  for select using (status = 'active');
create policy "stores owner read own" on public.stores
  for select using (auth.uid() = owner_id);
create policy "stores owner insert" on public.stores
  for insert with check (auth.uid() = owner_id);
create policy "stores owner update" on public.stores
  for update using (auth.uid() = owner_id);
create policy "stores owner delete" on public.stores
  for delete using (auth.uid() = owner_id);
create policy "stores admin all" on public.stores
  for all using (public.is_admin());

-- assinaturas: dono lê da própria loja; admin tudo
create policy "subscriptions owner read" on public.subscriptions
  for select using (
    auth.uid() in (select owner_id from public.stores where id = store_id)
  );
create policy "subscriptions owner insert" on public.subscriptions
  for insert with check (
    auth.uid() in (select owner_id from public.stores where id = store_id)
  );
create policy "subscriptions admin all" on public.subscriptions
  for all using (public.is_admin());

-- galeria: público lê; dono gerencia; admin tudo
create policy "gallery public read" on public.store_gallery
  for select using (true);
create policy "gallery owner all" on public.store_gallery
  for all using (
    auth.uid() in (select owner_id from public.stores where id = store_id)
  );
create policy "gallery admin all" on public.store_gallery
  for all using (public.is_admin());

-- ------------------------------------------------------------
-- STORAGE (bucket para fotos)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('marketvale', 'marketvale', true)
on conflict (id) do nothing;

create policy "storage public read" on storage.objects
  for select using (bucket_id = 'marketvale');
create policy "storage authenticated upload" on storage.objects
  for insert with check (
    bucket_id = 'marketvale'
    and auth.role() = 'authenticated'
  );
create policy "storage owner update" on storage.objects
  for update using (
    bucket_id = 'marketvale'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "storage owner delete" on storage.objects
  for delete using (
    bucket_id = 'marketvale'
    and auth.uid()::text = (storage.foldername(name))[1]
  );