-- Script para criar profiles de teste manualmente
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos verificar se já existem usuários no auth.users
SELECT 'Usuários existentes no auth.users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- Inserir profiles para usuários existentes (se houver)
-- Substitua os UUIDs pelos IDs reais dos usuários do auth.users

-- IMPORTANTE: Execute primeiro a query acima para obter os UUIDs reais
-- Depois substitua os UUIDs abaixo pelos valores reais

-- Exemplo de inserção (substitua os UUIDs):
/*
INSERT INTO public.profiles (id, email, full_name, role, barbershop_id, is_active)
VALUES 
  ('UUID_DO_ADMIN', 'admin@barberpro.com', 'Administrador BarberPro', 'admin', (SELECT id FROM barbershops LIMIT 1), true),
  ('UUID_DO_BARBEIRO', 'barbeiro@barberpro.com', 'João Silva (Barbeiro)', 'barber', (SELECT id FROM barbershops LIMIT 1), true),
  ('UUID_DO_CLIENTE', 'cliente@barberpro.com', 'Maria Santos (Cliente)', 'customer', NULL, true)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  barbershop_id = EXCLUDED.barbershop_id,
  is_active = EXCLUDED.is_active;
*/

-- Verificar profiles criados
SELECT 'Profiles criados:' as info;
SELECT id, email, full_name, role, is_active FROM public.profiles ORDER BY created_at;

-- Criar registro de barbeiro se necessário
/*
INSERT INTO public.barbers (profile_id, barbershop_id, specialties, bio, rating, total_reviews)
SELECT 
  p.id,
  p.barbershop_id,
  ARRAY['Corte Masculino', 'Barba', 'Bigode'],
  'Barbeiro experiente com mais de 5 anos de experiência.',
  4.8,
  127
FROM public.profiles p
WHERE p.role = 'barber' AND p.id NOT IN (SELECT profile_id FROM public.barbers);
*/

SELECT 'Setup concluído! Verifique os dados acima.' as resultado;