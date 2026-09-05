# Market Vale

Plataforma que conecta os negócios do **Vale do Ribeira (SP)**. Cada lojista cria o
próprio site com um link exclusivo (`marketvale.com.br/loja/seunegocio`) e aparece no
catálogo por categoria (confeitaria, cafeteria, marmitaria, advocacia, mercado, etc).

## Recursos

- **Catálogo por categoria** com suporte específico para cada tipo de negócio
- **Site próprio para cada loja** com link exclusivo, 3 layouts, cores e fontes
- **Dashboard do lojista**: cria, edita e personaliza a loja; gerencia fotos e plano
- **Painel do administrador**: controla lojas, categorias, planos e usuários
- **Planos**: Básico (grátis), Profissional e Premium
- **Contas com e-mail/senha** (Supabase Auth) e páginas protegidas

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS 4
- [Supabase](https://supabase.com) (Auth, PostgreSQL + RLS, Storage)

## Como rodar

### 1. Crie o projeto no Supabase

1. Crie uma conta grátis em <https://supabase.com> e crie um novo projeto
   (região: `South America (Sao Paulo)`).
2. Copie arquivo `supabase/schema.sql`, cole no **SQL Editor** e execute.
3. Copie o arquivo `supabase/seed.sql`, cole no **SQL Editor** e execute.
4. Na página **Settings → API**, copie o **Project URL** e a **anon public key**.

### 2. Configure as variáveis de ambiente

Edite o arquivo `.env.local` (crie a partir de `.env.example` se preferir):

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

### 3. Instale e rode

```bash
npm.cmd install
npm.cmd run dev
```

Abra <http://localhost:3000>.

### 4. Torne-se administrador

Crie sua conta em `/cadastro`, faça login e rode no SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'seuemail@example.com';
```

Pronto: o menu **Admin** aparecerá no topo.

## Publicação (Vercel)

1. Suba o código para o GitHub.
2. Em <https://vercel.com>, importe o repositório.
3. Adicione as 2 variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy. Configure o domínio (ex: `marketvale.com.br`) em **Settings → Domains**.

> O site fica pronto em Português do Brasil. Em seguida, em **Settings → Domains**,
> registre `marketvale.com.br` (ou outro domínio) e o link das lojas passa a ser
> `marketvale.com.br/loja/seunegocio`.

## Como usar (fluxo do lojista)

1. `/cadastro` → cria conta
2. `/dashboard` → cadastrar negócio (nome, categoria, cidade, WhatsApp)
3. `/dashboard/configuracao` → editar site (contatos, fotos de logo/capa, detalhes
   específicos da categoria, horários e personalização com cores/fonte/layout)
4. `/dashboard/assinatura` → escolher plano
5. Compartilhar o link `marketvale.com.br/loja/seunegocio`

## Estrutura

```
supabase/
  schema.sql   # tabelas, RLS, storage, função de visitas
  seed.sql     # planos e categorias
src/
  app/                  # páginas
    page.tsx            # home (categorias, destaques, busca)
    categorias/[slug]/  # catálogo por categoria
    loja/[slug]/        # site público da loja
    login|cadastro/     # autenticação
    dashboard/          # painel do lojista
    admin/              # painel do administrador
  components/           # navbar, footer, cartões, site da loja, formulários
  lib/
    supabase/           # clientes browser/server/middleware
    constants.ts        # planos, campos por categoria, limites por plano
    utils.ts            # helpers (slug, preço, links)
```

## Observações

- As assinaturas são registradas manualmente (o lojista escolhe o plano e combina o
  pagamento com você). Pagamentos automáticos (Stripe/Asaas) podem ser adicionados.
- O bucket de imagens se chama `marketvale` e é público.
- Contas criadas sem confirmação de e-mail: ajuste em **Authentication → Providers →
  Email → Confirm email** conforme preferir.