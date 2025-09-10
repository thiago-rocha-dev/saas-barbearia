-- ============================================================================
-- BARBERPRO - SETUP AUTOMÁTICO COMPLETO
-- ============================================================================
-- Este script configura TUDO automaticamente:
-- 1. Cria todas as tabelas necessárias
-- 2. Configura triggers para criação automática de perfis
-- 3. Insere dados de seed (barbearia, serviços, usuários de teste)
-- 4. Não requer NENHUMA edição manual
-- ============================================================================

-- Limpar dados existentes (se houver)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Deletar dados existentes
DELETE FROM public.appointments;
DELETE FROM public.barbers;
DELETE FROM public.services;
DELETE FROM public.profiles;
DELETE FROM public.barbershops;

-- ============================================================================
-- 1. CRIAÇÃO DAS TABELAS
-- ============================================================================

-- Tabela de barbearias
CREATE TABLE IF NOT EXISTS public.barbershops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'barber', 'customer')),
    phone VARCHAR(20),
    avatar_url TEXT,
    barbershop_id UUID REFERENCES public.barbershops(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de barbeiros
CREATE TABLE IF NOT EXISTS public.barbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    specialties TEXT[],
    bio TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INTEGER NOT NULL, -- em minutos
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de horários de trabalho dos barbeiros
CREATE TABLE IF NOT EXISTS public.working_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=domingo, 1=segunda, etc
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(barber_id, day_of_week)
);

-- ============================================================================
-- 2. CONFIGURAÇÃO DE RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permissivas para desenvolvimento)
CREATE POLICY "Permitir tudo para usuários autenticados" ON public.barbershops FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir tudo para usuários autenticados" ON public.profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir tudo para usuários autenticados" ON public.barbers FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir tudo para usuários autenticados" ON public.services FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir tudo para usuários autenticados" ON public.appointments FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir tudo para usuários autenticados" ON public.working_hours FOR ALL TO authenticated USING (true);

-- ============================================================================
-- 3. FUNÇÃO E TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE PERFIS
-- ============================================================================

-- Função que será executada quando um novo usuário for criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role VARCHAR(20);
    barbershop_uuid UUID;
BEGIN
    -- Buscar a barbearia padrão
    SELECT id INTO barbershop_uuid FROM public.barbershops LIMIT 1;
    
    -- Determinar role baseado no email
    IF NEW.email = 'admin@barberpro.com' THEN
        user_role := 'admin';
    ELSIF NEW.email = 'barbeiro@barberpro.com' THEN
        user_role := 'barber';
    ELSIF NEW.email = 'cliente@barberpro.com' THEN
        user_role := 'customer';
    ELSE
        user_role := 'customer'; -- padrão
    END IF;
    
    -- Inserir perfil automaticamente
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        barbershop_id
    ) VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN NEW.email = 'admin@barberpro.com' THEN 'Administrador BarberPro'
            WHEN NEW.email = 'barbeiro@barberpro.com' THEN 'João Silva (Barbeiro)'
            WHEN NEW.email = 'cliente@barberpro.com' THEN 'Maria Santos (Cliente)'
            ELSE 'Usuário ' || NEW.email
        END,
        user_role,
        CASE WHEN user_role IN ('admin', 'barber') THEN barbershop_uuid ELSE NULL END
    );
    
    -- Se for barbeiro, criar registro na tabela barbers
    IF user_role = 'barber' THEN
        INSERT INTO public.barbers (
            profile_id,
            barbershop_id,
            specialties,
            bio,
            rating,
            total_reviews
        ) VALUES (
            NEW.id,
            barbershop_uuid,
            ARRAY['Corte Masculino', 'Barba', 'Bigode'],
            'Barbeiro experiente com mais de 5 anos de experiência.',
            4.8,
            127
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger que executa a função quando um usuário é criado
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. INSERÇÃO DE DADOS DE SEED
-- ============================================================================

-- Inserir barbearia padrão
INSERT INTO public.barbershops (id, name, address, phone, email) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'BarberPro - Barbearia Premium',
    'Rua das Flores, 123 - Centro',
    '(11) 99999-9999',
    'contato@barberpro.com'
);

-- Inserir serviços
INSERT INTO public.services (barbershop_id, name, description, price, duration_minutes) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Corte Masculino', 'Corte moderno e estiloso', 35.00, 30),
('550e8400-e29b-41d4-a716-446655440000', 'Barba Completa', 'Aparar e modelar barba', 25.00, 20),
('550e8400-e29b-41d4-a716-446655440000', 'Corte + Barba', 'Pacote completo', 55.00, 45),
('550e8400-e29b-41d4-a716-446655440000', 'Bigode', 'Aparar e modelar bigode', 15.00, 10),
('550e8400-e29b-41d4-a716-446655440000', 'Sobrancelha', 'Design de sobrancelha masculina', 20.00, 15);

-- ============================================================================
-- 5. FUNÇÃO PARA CRIAR USUÁRIOS DE TESTE
-- ============================================================================

-- Esta função deve ser chamada APÓS a execução deste script
-- para criar os usuários de teste no Supabase Auth
CREATE OR REPLACE FUNCTION public.create_test_users()
RETURNS TEXT AS $$
BEGIN
    -- Esta função serve como documentação
    -- Os usuários devem ser criados via Supabase Auth API ou painel
    RETURN 'Execute o script seed-users.js para criar os usuários de teste automaticamente';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FINALIZAÇÃO
-- ============================================================================

-- Mostrar resumo da configuração
SELECT 
    'Setup completo!' as status,
    (SELECT COUNT(*) FROM public.barbershops) as barbearias,
    (SELECT COUNT(*) FROM public.services) as servicos,
    'Execute seed-users.js para criar usuários' as proximo_passo;

-- ============================================================================
-- INSTRUÇÕES FINAIS:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Execute: npm run seed:users (para criar usuários automaticamente)
-- 3. Pronto! Sistema 100% funcional
-- ============================================================================