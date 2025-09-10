-- SQL para criar a tabela working_hours no Supabase
-- Execute este SQL no SQL Editor do Supabase Dashboard

-- 1. Criar a tabela working_hours
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

-- 2. Habilitar RLS
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

-- 3. Criar política de acesso
CREATE POLICY "Permitir tudo para usuários autenticados" 
ON public.working_hours FOR ALL TO authenticated USING (true);

-- 4. Adicionar colunas necessárias na tabela appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS customer_name TEXT;

ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- 5. Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('working_hours', 'appointments');

-- 6. Verificar colunas da tabela appointments
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'appointments'
ORDER BY ordinal_position;