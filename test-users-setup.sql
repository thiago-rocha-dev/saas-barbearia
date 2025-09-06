-- BarberPro - Script de Usuários de Teste
-- Execute este arquivo no Supabase SQL Editor após o database-setup.sql

-- IMPORTANTE: Este script cria usuários de teste para desenvolvimento
-- NÃO execute em produção!

-- =====================================================
-- USUÁRIOS DE TESTE
-- =====================================================

-- CREDENCIAIS DE TESTE:
-- Admin:    admin@barberpro.com    / senha: admin123
-- Barbeiro: barbeiro@barberpro.com / senha: barber123  
-- Cliente:  cliente@barberpro.com  / senha: client123

-- =====================================================
-- INSERIR PERFIS DE TESTE
-- =====================================================

-- 1. ADMIN DE TESTE
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@barberpro.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin BarberPro"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 2. BARBEIRO DE TESTE
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'barbeiro@barberpro.com',
  crypt('barber123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "João Silva - Barbeiro"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 3. CLIENTE DE TESTE
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'cliente@barberpro.com',
  crypt('client123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Carlos Santos - Cliente"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- INSERIR PERFIS NA TABELA PROFILES
-- =====================================================

-- Admin Profile
INSERT INTO profiles (
  id,
  email,
  full_name,
  phone,
  role,
  barbershop_id,
  is_active
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'admin@barberpro.com',
  'Admin BarberPro',
  '(11) 99999-0001',
  'admin',
  '11111111-1111-1111-1111-111111111111',
  true
) ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  barbershop_id = EXCLUDED.barbershop_id;

-- Barbeiro Profile
INSERT INTO profiles (
  id,
  email,
  full_name,
  phone,
  role,
  barbershop_id,
  is_active
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'barbeiro@barberpro.com',
  'João Silva - Barbeiro',
  '(11) 99999-0002',
  'barber',
  '11111111-1111-1111-1111-111111111111',
  true
) ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  barbershop_id = EXCLUDED.barbershop_id;

-- Cliente Profile
INSERT INTO profiles (
  id,
  email,
  full_name,
  phone,
  role,
  barbershop_id,
  is_active
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  'cliente@barberpro.com',
  'Carlos Santos - Cliente',
  '(11) 99999-0003',
  'customer',
  NULL,
  true
) ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role;

-- =====================================================
-- INSERIR DADOS DO BARBEIRO NA TABELA BARBERS
-- =====================================================

INSERT INTO barbers (
  id,
  profile_id,
  barbershop_id,
  specialty,
  experience_years,
  rating,
  is_available
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Cortes clássicos e modernos, barbas estilizadas',
  5,
  4.8,
  true
) ON CONFLICT (profile_id) DO UPDATE SET
  specialty = EXCLUDED.specialty,
  experience_years = EXCLUDED.experience_years,
  rating = EXCLUDED.rating;

-- =====================================================
-- CRIAR ALGUNS AGENDAMENTOS DE EXEMPLO
-- =====================================================

-- Agendamento confirmado (passado)
INSERT INTO appointments (
  id,
  barbershop_id,
  barber_id,
  service_id,
  customer_id,
  customer_name,
  customer_email,
  customer_phone,
  appointment_date,
  appointment_time,
  status,
  total_price
) VALUES (
  '66666666-6666-6666-6666-666666666666',
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555',
  (SELECT id FROM services WHERE name = 'Combo Completo' LIMIT 1),
  '44444444-4444-4444-4444-444444444444',
  'Carlos Santos - Cliente',
  'cliente@barberpro.com',
  '(11) 99999-0003',
  CURRENT_DATE - INTERVAL '7 days',
  '14:00:00',
  'completed',
  55.00
) ON CONFLICT (id) DO NOTHING;

-- Agendamento futuro
INSERT INTO appointments (
  id,
  barbershop_id,
  barber_id,
  service_id,
  customer_id,
  customer_name,
  customer_email,
  customer_phone,
  appointment_date,
  appointment_time,
  status,
  total_price
) VALUES (
  '77777777-7777-7777-7777-777777777777',
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555',
  (SELECT id FROM services WHERE name = 'Corte Clássico' LIMIT 1),
  '44444444-4444-4444-4444-444444444444',
  'Carlos Santos - Cliente',
  'cliente@barberpro.com',
  '(11) 99999-0003',
  CURRENT_DATE + INTERVAL '3 days',
  '10:00:00',
  'confirmed',
  35.00
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- =====================================================

SELECT 
  'Usuários de teste criados com sucesso! 🎉' as message,
  (
    SELECT COUNT(*) 
    FROM profiles 
    WHERE email IN ('admin@barberpro.com', 'barbeiro@barberpro.com', 'cliente@barberpro.com')
  ) as usuarios_criados;

-- Mostrar resumo dos usuários criados
SELECT 
  p.email,
  p.full_name,
  p.role,
  CASE 
    WHEN p.role = 'admin' THEN '🔑 Admin'
    WHEN p.role = 'barber' THEN '✂️ Barbeiro'
    WHEN p.role = 'customer' THEN '👤 Cliente'
    ELSE '❓ Desconhecido'
  END as tipo,
  p.is_active as ativo
FROM profiles p
WHERE p.email IN ('admin@barberpro.com', 'barbeiro@barberpro.com', 'cliente@barberpro.com')
ORDER BY 
  CASE p.role 
    WHEN 'admin' THEN 1
    WHEN 'barber' THEN 2
    WHEN 'customer' THEN 3
    ELSE 4
  END;

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================

/*
CREDENCIAIS DE TESTE CRIADAS:

🔑 ADMIN:
   Email: admin@barberpro.com
   Senha: admin123
   Acesso: Dashboard administrativo completo

✂️ BARBEIRO:
   Email: barbeiro@barberpro.com
   Senha: barber123
   Acesso: Dashboard do barbeiro

👤 CLIENTE:
   Email: cliente@barberpro.com
   Senha: client123
   Acesso: Dashboard do cliente

PARA DELETAR OS USUÁRIOS DE TESTE:
1. DELETE FROM appointments WHERE customer_email IN ('admin@barberpro.com', 'barbeiro@barberpro.com', 'cliente@barberpro.com');
2. DELETE FROM barbers WHERE profile_id IN (SELECT id FROM profiles WHERE email IN ('admin@barberpro.com', 'barbeiro@barberpro.com', 'cliente@barberpro.com'));
3. DELETE FROM profiles WHERE email IN ('admin@barberpro.com', 'barbeiro@barberpro.com', 'cliente@barberpro.com');
4. DELETE FROM auth.users WHERE email IN ('admin@barberpro.com', 'barbeiro@barberpro.com', 'cliente@barberpro.com');

PARA ALTERAR ROLES:
UPDATE profiles SET role = 'NOVA_ROLE' WHERE email = 'EMAIL_DO_USUARIO';
(Roles disponíveis: 'admin', 'barber', 'customer')
*/