-- BarberPro - Seed Data para Desenvolvimento
-- Script simplificado para popular o banco com dados de teste

-- =====================================================
-- LIMPAR DADOS EXISTENTES (OPCIONAL)
-- =====================================================

-- Descomente as linhas abaixo se quiser limpar dados existentes
-- DELETE FROM appointments;
-- DELETE FROM barbers;
-- DELETE FROM profiles WHERE email LIKE '%barberpro.com';
-- DELETE FROM auth.users WHERE email LIKE '%barberpro.com';

-- =====================================================
-- FUNÇÃO AUXILIAR PARA CRIAR USUÁRIOS
-- =====================================================

CREATE OR REPLACE FUNCTION create_test_user(
  user_id UUID,
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  user_role TEXT,
  user_phone TEXT DEFAULT NULL,
  barbershop_id UUID DEFAULT '11111111-1111-1111-1111-111111111111'
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Inserir na tabela auth.users
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
    is_super_admin
  ) VALUES (
    user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    json_build_object('full_name', user_name),
    false
  ) ON CONFLICT (id) DO NOTHING;

  -- Inserir na tabela profiles
  INSERT INTO profiles (
    id,
    email,
    full_name,
    phone,
    role,
    barbershop_id,
    is_active
  ) VALUES (
    user_id,
    user_email,
    user_name,
    user_phone,
    user_role,
    CASE WHEN user_role = 'customer' THEN NULL ELSE barbershop_id END,
    true
  ) ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    barbershop_id = EXCLUDED.barbershop_id,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CRIAR USUÁRIOS DE TESTE
-- =====================================================

-- Admin
SELECT create_test_user(
  '22222222-2222-2222-2222-222222222222',
  'admin@barberpro.com',
  'admin123',
  'Admin BarberPro',
  'admin',
  '(11) 99999-0001'
);

-- Barbeiro
SELECT create_test_user(
  '33333333-3333-3333-3333-333333333333',
  'barbeiro@barberpro.com',
  'barber123',
  'João Silva - Barbeiro',
  'barber',
  '(11) 99999-0002'
);

-- Cliente
SELECT create_test_user(
  '44444444-4444-4444-4444-444444444444',
  'cliente@barberpro.com',
  'client123',
  'Carlos Santos - Cliente',
  'customer',
  '(11) 99999-0003'
);

-- =====================================================
-- CRIAR DADOS DO BARBEIRO
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
  'Especialista em cortes clássicos e modernos, barbas estilizadas e tratamentos capilares',
  5,
  4.8,
  true
) ON CONFLICT (profile_id) DO UPDATE SET
  specialty = EXCLUDED.specialty,
  experience_years = EXCLUDED.experience_years,
  rating = EXCLUDED.rating,
  is_available = EXCLUDED.is_available;

-- =====================================================
-- CRIAR AGENDAMENTOS DE EXEMPLO
-- =====================================================

-- Agendamento passado (concluído)
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
) 
SELECT 
  '66666666-6666-6666-6666-666666666666',
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555',
  s.id,
  '44444444-4444-4444-4444-444444444444',
  'Carlos Santos - Cliente',
  'cliente@barberpro.com',
  '(11) 99999-0003',
  CURRENT_DATE - INTERVAL '7 days',
  '14:00:00',
  'completed',
  s.price
FROM services s 
WHERE s.name = 'Combo Completo' 
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Agendamento futuro (confirmado)
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
) 
SELECT 
  '77777777-7777-7777-7777-777777777777',
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555',
  s.id,
  '44444444-4444-4444-4444-444444444444',
  'Carlos Santos - Cliente',
  'cliente@barberpro.com',
  '(11) 99999-0003',
  CURRENT_DATE + INTERVAL '3 days',
  '10:00:00',
  'confirmed',
  s.price
FROM services s 
WHERE s.name = 'Corte Clássico' 
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Agendamento pendente
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
) 
SELECT 
  '88888888-8888-8888-8888-888888888888',
  '11111111-1111-1111-1111-111111111111',
  '55555555-5555-5555-5555-555555555555',
  s.id,
  '44444444-4444-4444-4444-444444444444',
  'Carlos Santos - Cliente',
  'cliente@barberpro.com',
  '(11) 99999-0003',
  CURRENT_DATE + INTERVAL '1 day',
  '16:00:00',
  'pending',
  s.price
FROM services s 
WHERE s.name = 'Barba Completa' 
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- LIMPAR FUNÇÃO AUXILIAR
-- =====================================================

DROP FUNCTION IF EXISTS create_test_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID);

-- =====================================================
-- VERIFICAÇÃO E RELATÓRIO
-- =====================================================

-- Verificar usuários criados
SELECT 
  '✅ Seed data executado com sucesso!' as status,
  (
    SELECT COUNT(*) 
    FROM profiles 
    WHERE email IN ('admin@barberpro.com', 'barbeiro@barberpro.com', 'cliente@barberpro.com')
  ) as usuarios_criados,
  (
    SELECT COUNT(*) 
    FROM appointments 
    WHERE customer_email = 'cliente@barberpro.com'
  ) as agendamentos_criados;

-- Relatório dos usuários
SELECT 
  '📊 USUÁRIOS DE TESTE CRIADOS:' as relatorio;

SELECT 
  p.email as "📧 Email",
  p.full_name as "👤 Nome",
  CASE 
    WHEN p.role = 'admin' THEN '🔑 Admin'
    WHEN p.role = 'barber' THEN '✂️ Barbeiro'
    WHEN p.role = 'customer' THEN '👤 Cliente'
    ELSE '❓ Desconhecido'
  END as "🎭 Tipo",
  CASE WHEN p.is_active THEN '✅ Ativo' ELSE '❌ Inativo' END as "📊 Status"
FROM profiles p
WHERE p.email IN ('admin@barberpro.com', 'barbeiro@barberpro.com', 'cliente@barberpro.com')
ORDER BY 
  CASE p.role 
    WHEN 'admin' THEN 1
    WHEN 'barber' THEN 2
    WHEN 'customer' THEN 3
    ELSE 4
  END;

-- Relatório dos agendamentos
SELECT 
  '📅 AGENDAMENTOS DE EXEMPLO:' as relatorio;

SELECT 
  a.appointment_date as "📅 Data",
  a.appointment_time as "🕐 Hora",
  s.name as "✂️ Serviço",
  CASE 
    WHEN a.status = 'completed' THEN '✅ Concluído'
    WHEN a.status = 'confirmed' THEN '🔄 Confirmado'
    WHEN a.status = 'pending' THEN '⏳ Pendente'
    WHEN a.status = 'cancelled' THEN '❌ Cancelado'
    ELSE a.status
  END as "📊 Status",
  CONCAT('R$ ', a.total_price) as "💰 Valor"
FROM appointments a
JOIN services s ON a.service_id = s.id
WHERE a.customer_email = 'cliente@barberpro.com'
ORDER BY a.appointment_date, a.appointment_time;