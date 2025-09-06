-- Script para criar perfis de usuários de teste
-- Execute APÓS criar os usuários no Supabase Auth
-- IDs dos usuários devem corresponder aos criados no Auth

-- IMPORTANTE: Substitua os UUIDs abaixo pelos IDs reais dos usuários criados no Supabase Auth

-- 1. Inserir perfil do Admin
INSERT INTO profiles (id, email, full_name, phone, role, barbershop_id, is_active) 
VALUES (
  '11111111-1111-1111-1111-111111111111', -- Substitua pelo ID real do usuário admin
  'admin@barberpro.com',
  'Administrador Sistema',
  '(11) 99999-0001',
  'admin',
  '550e8400-e29b-41d4-a716-446655440000',
  true
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  barbershop_id = EXCLUDED.barbershop_id;

-- 2. Inserir perfil do Barbeiro
INSERT INTO profiles (id, email, full_name, phone, role, barbershop_id, is_active) 
VALUES (
  '22222222-2222-2222-2222-222222222222', -- Substitua pelo ID real do usuário barbeiro
  'barbeiro@barberpro.com',
  'Carlos Silva',
  '(11) 99999-0002',
  'barber',
  '550e8400-e29b-41d4-a716-446655440000',
  true
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  barbershop_id = EXCLUDED.barbershop_id;

-- 3. Inserir perfil do Cliente
INSERT INTO profiles (id, email, full_name, phone, role, barbershop_id, is_active) 
VALUES (
  '33333333-3333-3333-3333-333333333333', -- Substitua pelo ID real do usuário cliente
  'cliente@barberpro.com',
  'João Santos',
  '(11) 99999-0003',
  'customer',
  NULL, -- Clientes não pertencem a uma barbearia específica
  true
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role;

-- 4. Criar registro de barbeiro para o usuário barbeiro
INSERT INTO barbers (profile_id, barbershop_id, specialty, experience_years, rating, is_available) 
VALUES (
  '22222222-2222-2222-2222-222222222222', -- ID do perfil do barbeiro
  '550e8400-e29b-41d4-a716-446655440000', -- ID da barbearia
  'Cortes clássicos e modernos',
  5,
  4.8,
  true
) ON CONFLICT (profile_id) DO UPDATE SET
  barbershop_id = EXCLUDED.barbershop_id,
  specialty = EXCLUDED.specialty,
  experience_years = EXCLUDED.experience_years,
  rating = EXCLUDED.rating,
  is_available = EXCLUDED.is_available;

-- 5. Criar alguns agendamentos de exemplo
INSERT INTO appointments (
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
  '550e8400-e29b-41d4-a716-446655440000',
  b.id,
  s.id,
  '33333333-3333-3333-3333-333333333333',
  'João Santos',
  'cliente@barberpro.com',
  '(11) 99999-0003',
  CURRENT_DATE + INTERVAL '1 day',
  '10:00:00',
  'confirmed',
  s.price
FROM barbers b, services s 
WHERE b.profile_id = '22222222-2222-2222-2222-222222222222'
AND s.name = 'Corte + Barba'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO appointments (
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
  '550e8400-e29b-41d4-a716-446655440000',
  b.id,
  s.id,
  '33333333-3333-3333-3333-333333333333',
  'João Santos',
  'cliente@barberpro.com',
  '(11) 99999-0003',
  CURRENT_DATE + INTERVAL '3 days',
  '14:00:00',
  'pending',
  s.price
FROM barbers b, services s 
WHERE b.profile_id = '22222222-2222-2222-2222-222222222222'
AND s.name = 'Corte Simples'
LIMIT 1
ON CONFLICT DO NOTHING;

SELECT 'User profiles setup completed successfully!' as status;
SELECT 'Remember to update the UUIDs with real user IDs from Supabase Auth!' as reminder;