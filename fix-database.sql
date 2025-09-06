-- Script para corrigir e popular o banco de dados
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos garantir que as tabelas existam
-- Se já existirem, este comando será ignorado

-- Criar tabela de barbearias
CREATE TABLE IF NOT EXISTS barbershops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT UNIQUE,
  logo_url TEXT,
  theme_color TEXT DEFAULT '#F59E0B',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de perfis
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'barber', 'customer')),
  barbershop_id UUID REFERENCES barbershops(id),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de barbeiros
CREATE TABLE IF NOT EXISTS barbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  specialty TEXT,
  experience_years INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  customer_id UUID REFERENCES profiles(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS básicas

-- Políticas para profiles
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public can insert profiles" ON profiles;
CREATE POLICY "Public can insert profiles" ON profiles FOR INSERT WITH CHECK (true);

-- Políticas para barbershops
DROP POLICY IF EXISTS "Public view active barbershops" ON barbershops;
CREATE POLICY "Public view active barbershops" ON barbershops FOR SELECT USING (is_active = true);

-- Políticas para services
DROP POLICY IF EXISTS "Public view active services" ON services;
CREATE POLICY "Public view active services" ON services FOR SELECT USING (is_active = true);

-- Políticas para barbers
DROP POLICY IF EXISTS "Public view available barbers" ON barbers;
CREATE POLICY "Public view available barbers" ON barbers FOR SELECT USING (is_available = true);

-- Políticas para appointments
DROP POLICY IF EXISTS "Users view own appointments" ON appointments;
CREATE POLICY "Users view own appointments" ON appointments FOR SELECT USING (
  auth.uid() = customer_id OR 
  auth.uid() IN (SELECT profile_id FROM barbers WHERE id = appointments.barber_id) OR
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

DROP POLICY IF EXISTS "Users manage own appointments" ON appointments;
CREATE POLICY "Users manage own appointments" ON appointments FOR ALL USING (
  auth.uid() = customer_id OR 
  auth.uid() IN (SELECT profile_id FROM barbers WHERE id = appointments.barber_id) OR
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- 4. Inserir dados de teste

-- Inserir barbearia de teste
INSERT INTO barbershops (id, name, address, phone, email) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'BarberPro Demo', 'Rua das Flores, 123', '(11) 99999-9999', 'contato@barberpro.com')
ON CONFLICT (email) DO NOTHING;

-- Inserir serviços de teste
INSERT INTO services (barbershop_id, name, description, price, duration_minutes) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Corte Simples', 'Corte de cabelo tradicional', 25.00, 30),
('550e8400-e29b-41d4-a716-446655440000', 'Corte + Barba', 'Corte de cabelo + barba completa', 45.00, 60),
('550e8400-e29b-41d4-a716-446655440000', 'Barba', 'Barba completa com finalização', 20.00, 30),
('550e8400-e29b-41d4-a716-446655440000', 'Corte Premium', 'Corte premium com lavagem', 35.00, 45)
ON CONFLICT DO NOTHING;

-- Nota: Os usuários devem ser criados manualmente no Supabase Auth
-- Depois execute o script quick-setup-users.sql para criar os perfis

SELECT 'Database setup completed successfully!' as status;