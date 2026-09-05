import type { CategoryFields, Plan, PlanId } from "@/lib/types";

export const PLANS: Plan[] = [
  {
    id: "basico",
    name: "Básico",
    price_monthly: 0,
    features: [
      "Página pública gratuita com link exclusivo",
      "Perfil completo (descrição, contato, endereço, WhatsApp)",
      "Aparece no catálogo Market Vale",
      "1 categoria de negócio",
    ],
    sort_order: 1,
  },
  {
    id: "profissional",
    name: "Profissional",
    price_monthly: 49.9,
    features: [
      "Tudo do plano Básico",
      "Personalização completa: cores, fonte e capa",
      "Galeria de fotos (até 15 fotos)",
      "Horários de funcionamento",
      "Redes sociais e site externo",
      "Destaque nos resultados da categoria",
    ],
    sort_order: 2,
  },
  {
    id: "premium",
    name: "Premium",
    price_monthly: 99.9,
    features: [
      "Tudo do plano Profissional",
      "Cardápio digital (para mercados, marmitarias e restaurantes)",
      "Posição priorizada no catálogo",
      "Estatísticas de visitas",
      "Selos \u201cDestaque\u201d e \u201cPremium\u201d",
      "Suporte prioritário",
    ],
    sort_order: 3,
  },
];

export const FEATURE_LIMITS: Record<
  PlanId,
  { gallery: number; custom_theme: boolean; details: boolean; priority: boolean }
> = {
  basico: { gallery: 0, custom_theme: false, details: false, priority: false },
  profissional: { gallery: 15, custom_theme: true, details: true, priority: true },
  premium: { gallery: 60, custom_theme: true, details: true, priority: true },
};

export const CATEGORIES = [
  "confeitaria",
  "cafeteria",
  "marmitaria",
  "restaurante",
  "padaria",
  "mercado",
  "hortifruti",
  "advocacia",
  "contabilidade",
  "imobiliaria",
  "beleza",
  "pet-shop",
  "farmacia",
  "loja-roupas",
  "loja-calcados",
  "eletronicos",
  "oficina",
  "construcao",
  "outros",
] as const;

export const CATEGORY_FIELDS: Record<string, CategoryFields> = {
  confeitaria: {
    icon: "🍰",
    label: "Confeitaria",
    fields: [
      {
        key: "especialidades",
        label: "Especialidades",
        type: "list",
        placeholder: "Bolo de pote, doces finos, tortas...",
      },
      { key: "encomendas", label: "Encomendas", type: "text", placeholder: "Sim, com 3 dias de antecedência" },
      { key: "formas_pagamento", label: "Formas de pagamento", type: "list", placeholder: "Pix, dinheiro, cartão" },
    ],
  },
  cafeteria: {
    icon: "☕",
    label: "Cafeteria",
    fields: [
      {
        key: "especialidades",
        label: "Especialidades",
        type: "list",
        placeholder: "Expresso, cappuccino, bolo caseiro...",
      },
      { key: "wifi", label: "Wi-Fi grátis", type: "text", placeholder: "Sim" },
      { key: "formas_pagamento", label: "Formas de pagamento", type: "list" },
    ],
  },
  marmitaria: {
    icon: "🍱",
    label: "Marmitaria",
    fields: [
      {
        key: "cardapio",
        label: "Cardápio",
        type: "list",
        placeholder: "Marmita simples, executiva, kg...",
      },
      { key: "entrega", label: "Entrega", type: "text", placeholder: "Bairros atendidos e taxa" },
      { key: "formas_pagamento", label: "Formas de pagamento", type: "list" },
    ],
  },
  restaurante: {
    icon: "🍽️",
    label: "Restaurante",
    fields: [
      {
        key: "cardapio",
        label: "Destaques do cardápio",
        type: "list",
        placeholder: "Prato principal, bebidas, sobremesas...",
      },
      { key: "reservas", label: "Aceita reservas", type: "text" },
      { key: "formas_pagamento", label: "Formas de pagamento", type: "list" },
    ],
  },
  padaria: {
    icon: "🥐",
    label: "Padaria",
    fields: [
      {
        key: "especialidades",
        label: "Especialidades",
        type: "list",
        placeholder: "Pão francês, salgados, bolos...",
      },
      { key: "formas_pagamento", label: "Formas de pagamento", type: "list" },
    ],
  },
  mercado: {
    icon: "🛒",
    label: "Mercado",
    fields: [
      {
        key: "servicos",
        label: "Serviços",
        type: "list",
        placeholder: "Entrega em domicílio, açougue, hortifrúti...",
      },
      { key: "formas_pagamento", label: "Formas de pagamento", type: "list" },
    ],
  },
  hortifruti: {
    icon: "🥦",
    label: "Hortifrúti",
    fields: [
      { key: "produtos", label: "Produtos", type: "list", placeholder: "Verduras, legumes, frutas da estação..." },
      { key: "feiras", label: "feiras que participa", type: "text" },
    ],
  },
  advocacia: {
    icon: "⚖️",
    label: "Advocacia",
    fields: [
      {
        key: "areas",
        label: "Áreas de atuação",
        type: "list",
        placeholder: "Trabalhista, cível, família...",
      },
      { key: "oab", label: "OAB da equipe", type: "text" },
      { key: "atendimento", label: "Atendimento", type: "text", placeholder: "Presencial e online" },
    ],
  },
  contabilidade: {
    icon: "🧾",
    label: "Contabilidade",
    fields: [
      {
        key: "servicos",
        label: "Serviços",
        type: "list",
        placeholder: "Abertura de empresa, imposto de renda, folha de pagamento...",
      },
      { key: "atendimento", label: "Atendimento", type: "text" },
    ],
  },
  imobiliaria: {
    icon: "🏠",
    label: "Imobiliária",
    fields: [
      { key: "servicos", label: "Serviços", type: "list", placeholder: "Venda, locação, avaliação..." },
      { key: "regioes", label: "Regiões atendidas", type: "text" },
    ],
  },
  beleza: {
    icon: "💇‍♀️",
    label: "Beleza e Estética",
    fields: [
      { key: "servicos", label: "Serviços", type: "list", placeholder: "Corte, manicure, maquiagem..." },
      { key: "agendamento", label: "Agendamento", type: "text", placeholder: "WhatsApp e balcão" },
    ],
  },
  "pet-shop": {
    icon: "🐾",
    label: "Pet Shop",
    fields: [
      { key: "servicos", label: "Serviços", type: "list", placeholder: "Banho e tosa, rações, atendimento veterinário..." },
      { key: "formas_pagamento", label: "Formas de pagamento", type: "list" },
    ],
  },
  farmacia: {
    icon: "💊",
    label: "Farmácia",
    fields: [
      { key: "servicos", label: "Serviços", type: "list", placeholder: "Manipulação, entrega, testes rápidos..." },
      { key: "plantao", label: "Plantão", type: "text", placeholder: "Funciona 24h aos sábados" },
    ],
  },
  "loja-roupas": {
    icon: "👗",
    label: "Loja de Roupas",
    fields: [
      { key: "tamanhos", label: "Tamanhos", type: "text" },
      { key: "nova_colecao", label: "Novidades", type: "text" },
      { key: "formas_pagamento", label: "Formas de pagamento", type: "list" },
    ],
  },
  "loja-calcados": {
    icon: "👟",
    label: "Loja de Calçados",
    fields: [
      { key: "tamanhos", label: "Numerações", type: "text" },
      { key: "formas_pagamento", label: "Formas de pagamento", type: "list" },
    ],
  },
  eletronicos: {
    icon: "📱",
    label: "Eletrônicos",
    fields: [
      { key: "servicos", label: "Serviços", type: "list", placeholder: "Venda, conserto, assistência técnica..." },
      { key: "formas_pagamento", label: "Formas de pagamento", type: "list" },
    ],
  },
  oficina: {
    icon: "🔧",
    label: "Oficina Mecânica",
    fields: [
      { key: "servicos", label: "Serviços", type: "list", placeholder: "Injeção eletrônica, mecânica geral, elétrica..." },
      { key: "guincho", label: "Guincho", type: "text", placeholder: "Disponível 24h" },
    ],
  },
  construcao: {
    icon: "🏗️",
    label: "Construção",
    fields: [
      { key: "servicos", label: "Serviços", type: "list", placeholder: "Obras, reformas, pintura, elétrica..." },
      { key: "orcamento", label: "Orçamento", type: "text", placeholder: "Gratuito" },
    ],
  },
  outros: {
    icon: "✨",
    label: "Outros",
    fields: [
      { key: "destaques", label: "Destaques", type: "list" },
      { key: "formas_pagamento", label: "Formas de pagamento", type: "list" },
    ],
  },
};

export function getCategoryFields(slug: string | null): CategoryFields {
  if (slug && CATEGORY_FIELDS[slug]) return CATEGORY_FIELDS[slug];
  return CATEGORY_FIELDS.outros;
}