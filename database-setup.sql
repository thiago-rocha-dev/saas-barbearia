-- BarberPro SaaS - Database Schema Setup
-- Execute este arquivo no Supabase SQL Editor

-- CRIAÇÃO DAS TABELAS

-- BARBEARIAS
CREATE TABLE barbershops (
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

-- PERFIS
CREATE TABLE profiles (
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

-- BARBEIROS
CREATE TABLE barbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  specialty TEXT,
  experience_years INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVIÇOS
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AGENDAMENTOS
CREATE TABLE appointments (
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

-- HABILITAR RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS

-- Políticas Profiles
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public can insert profiles" ON profiles FOR INSERT WITH CHECK (true);

-- Políticas Barbershops
CREATE POLICY "Public view active barbershops" ON barbershops FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage their barbershop" ON barbershops FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin' 
    AND profiles.barbershop_id = barbershops.id
  )
);

-- Políticas Services
CREATE POLICY "Public view active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage their services" ON services FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin' 
    AND profiles.barbershop_id = services.barbershop_id
  )
);

-- Políticas Barbers
CREATE POLICY "Public view available barbers" ON barbers FOR SELECT USING (is_available = true);
CREATE POLICY "Barbers view own data" ON barbers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.id = barbers.profile_id
  )
);
CREATE POLICY "Admins manage their barbers" ON barbers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin' 
    AND profiles.barbershop_id = barbers.barbershop_id
  )
);

-- Políticas Appointments
CREATE POLICY "Users view own appointments" ON appointments FOR SELECT USING (
  auth.uid() = customer_id OR
  EXISTS (
    SELECT 1 FROM barbers 
    WHERE barbers.id = appointments.barber_id 
    AND barbers.profile_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin' 
    AND profiles.barbershop_id = appointments.barbershop_id
  )
);

CREATE POLICY "Public can create appointments" ON appointments FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own appointments" ON appointments FOR UPDATE USING (
  auth.uid() = customer_id OR
  EXISTS (
    SELECT 1 FROM barbers 
    WHERE barbers.id = appointments.barber_id 
    AND barbers.profile_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin' 
    AND profiles.barbershop_id = appointments.barbershop_id
  )
);

-- DADOS DE TESTE

-- Barbearia Demo
INSERT INTO barbershops (id, name, address, phone, email) VALUES 
('11111111-1111-1111-1111-111111111111', 'Elite Barber Shop', 'Rua das Palmeiras, 123', '(11) 99999-9999', 'contato@elitebarber.com');

-- Serviços Demo
INSERT INTO services (barbershop_id, name, price, duration_minutes) VALUES 
('11111111-1111-1111-1111-111111111111', 'Corte Clássico', 35.00, 30),
('11111111-1111-1111-1111-111111111111', 'Barba Completa', 25.00, 20),
('11111111-1111-1111-1111-111111111111', 'Combo Completo', 55.00, 45);

-- FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- COMENTÁRIOS
COMMENT ON TABLE barbershops IS 'Tabela de barbearias cadastradas no sistema';
COMMENT ON TABLE profiles IS 'Perfis de usuários (admin, barbeiro, cliente)';
COMMENT ON TABLE barbers IS 'Dados específicos dos barbeiros';
COMMENT ON TABLE services IS 'Serviços oferecidos pelas barbearias';
COMMENT ON TABLE appointments IS 'Agendamentos realizados';

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_profiles_barbershop_id ON profiles(barbershop_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_barbers_barbershop_id ON barbers(barbershop_id);
CREATE INDEX idx_services_barbershop_id ON services(barbershop_id);
CREATE INDEX idx_appointments_barbershop_id ON appointments(barbershop_id);
CREATE INDEX idx_appointments_barber_id ON appointments(barber_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- SUCESSO!
SELECT 'Database schema created successfully! 🚀' as message;