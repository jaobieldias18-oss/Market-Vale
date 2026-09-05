-- ============================================================
-- MARKET VALE - SEED (categorias e planos)
-- Execute depois do schema.sql
-- ============================================================

insert into public.plans (id, name, price_monthly, features, sort_order) values
  ('basico', 'Básico', 0,
   '["Página pública gratuita com link exclusivo","Perfil completo (descrição, contato, endereço, WhatsApp)","Aparece no catálogo Market Vale","1 categoria de negócio"]'::jsonb,
   1),
  ('profissional', 'Profissional', 49.90,
   '["Tudo do plano Básico","Personalização completa: cores, fonte e capa","Galeria de fotos (até 15 fotos)","Horários de funcionamento","Redes sociais e site externo","Destaque nos resultados da categoria"]'::jsonb,
   2),
  ('premium', 'Premium', 99.90,
   '["Tudo do plano Profissional","Cardápio digital (mercados, marmitarias e restaurantes)","Posição priorizada no catálogo","Estatísticas de visitas","Selos Destaque e Premium","Suporte prioritário"]'::jsonb,
   3)
on conflict (id) do nothing;

insert into public.categories (slug, name, description, icon, color, sort_order) values
  ('confeitaria', 'Confeitaria', 'Doces, bolos e guloseimas artesanais', '🍰', '#ec4899', 1),
  ('cafeteria', 'Cafeteria', 'Cafés especiais e acompanhamentos', '☕', '#92400e', 2),
  ('marmitaria', 'Marmitaria', 'Comida caseira por porção ou marmita', '🍱', '#ea580c', 3),
  ('restaurante', 'Restaurante', 'Restaurantes e food services', '🍽️', '#dc2626', 4),
  ('padaria', 'Padaria', 'Pães, salgados e bolos fresquinhos', '🥐', '#ca8a04', 5),
  ('mercado', 'Mercado', 'Mercados e supermercados da região', '🛒', '#16a34a', 6),
  ('hortifruti', 'Hortifrúti', 'Frutas, legumes e verduras', '🥦', '#65a30d', 7),
  ('advocacia', 'Advocacia', 'Escritórios de advocacia', '⚖️', '#4f46e5', 8),
  ('contabilidade', 'Contabilidade', 'Contadores e assessoria fiscal', '🧾', '#0d9488', 9),
  ('imobiliaria', 'Imobiliária', 'Venda, aluguel e avaliação de imóveis', '🏠', '#ea580c', 10),
  ('beleza', 'Beleza e Estética', 'Salões, barbearias e estética', '💇‍♀️', '#db2777', 11),
  ('pet-shop', 'Pet Shop', 'Produtos e serviços para pets', '🐾', '#7c3aed', 12),
  ('farmacia', 'Farmácia', 'Farmácias e drogarias', '💊', '#0284c7', 13),
  ('loja-roupas', 'Loja de Roupas', 'Moda masculina e feminina', '👗', '#be185d', 14),
  ('loja-calcados', 'Loja de Calçados', 'Calçados e acessórios', '👟', '#7c3aed', 15),
  ('eletronicos', 'Eletrônicos', 'Eletrônicos e assistência técnica', '📱', '#0891b2', 16),
  ('oficina', 'Oficina Mecânica', 'Mecânica e serviços automotivos', '🔧', '#525252', 17),
  ('construcao', 'Construção', 'Construção, reformas e acabamento', '🏗️', '#a16207', 18),
  ('outros', 'Outros', 'Outros tipos de negócio', '✨', '#64748b', 19)
on conflict (slug) do nothing;