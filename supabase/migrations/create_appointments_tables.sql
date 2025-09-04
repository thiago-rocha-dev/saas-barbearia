-- Create appointments and services tables for BarberPro SaaS
-- This migration creates the necessary tables for the appointment system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    barber_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    price DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_barber_datetime UNIQUE (barber_id, appointment_date, appointment_time),
    CONSTRAINT future_appointment CHECK (appointment_date >= CURRENT_DATE),
    CONSTRAINT valid_time CHECK (appointment_time >= '09:00:00' AND appointment_time <= '18:00:00')
);

-- Create working_hours table for barber schedules
CREATE TABLE IF NOT EXISTS public.working_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barber_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL DEFAULT '09:00:00',
    end_time TIME NOT NULL DEFAULT '18:00:00',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_barber_day UNIQUE (barber_id, day_of_week),
    CONSTRAINT valid_hours CHECK (start_time < end_time)
);

-- Create blocked_times table for barber unavailability
CREATE TABLE IF NOT EXISTS public.blocked_times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barber_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_block_period CHECK (start_datetime < end_datetime)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_barber_id ON public.appointments(barber_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON public.appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_barber_date ON public.appointments(barber_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_working_hours_barber ON public.working_hours(barber_id);
CREATE INDEX IF NOT EXISTS idx_blocked_times_barber ON public.blocked_times(barber_id);
CREATE INDEX IF NOT EXISTS idx_blocked_times_datetime ON public.blocked_times(start_datetime, end_datetime);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_working_hours_updated_at
    BEFORE UPDATE ON public.working_hours
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert default services
INSERT INTO public.services (name, description, duration_minutes, price, category, is_popular) VALUES
('Corte Masculino', 'Corte de cabelo masculino tradicional', 30, 25.00, 'Corte', true),
('Corte + Barba', 'Corte de cabelo + barba completa', 60, 40.00, 'Combo', true),
('Barba', 'Aparar e modelar barba', 30, 20.00, 'Barba', false),
('Corte Infantil', 'Corte de cabelo para crianças até 12 anos', 30, 20.00, 'Corte', false),
('Corte Degradê', 'Corte degradê moderno', 45, 35.00, 'Corte', true),
('Barba + Bigode', 'Barba completa com bigode', 45, 30.00, 'Barba', false),
('Sobrancelha', 'Design de sobrancelha masculina', 15, 15.00, 'Estética', false),
('Lavagem + Corte', 'Lavagem, corte e finalização', 60, 45.00, 'Combo', false),
('Corte Social', 'Corte social executivo', 30, 30.00, 'Corte', false),
('Platinado', 'Descoloração completa', 120, 80.00, 'Coloração', false)
ON CONFLICT DO NOTHING;

-- Insert default working hours (Monday to Friday, 9 AM to 6 PM)
-- This will be populated when barbers are created

-- Create RLS (Row Level Security) policies
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_times ENABLE ROW LEVEL SECURITY;

-- Services policies (everyone can read active services)
CREATE POLICY "Services are viewable by everyone" ON public.services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Services are manageable by admins" ON public.services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Appointments policies
-- Clients can view their own appointments
CREATE POLICY "Clients can view own appointments" ON public.appointments
    FOR SELECT USING (client_id = auth.uid());

-- Barbers can view their own appointments
CREATE POLICY "Barbers can view own appointments" ON public.appointments
    FOR SELECT USING (barber_id = auth.uid());

-- Admins can view all appointments
CREATE POLICY "Admins can view all appointments" ON public.appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Clients can create appointments for themselves
CREATE POLICY "Clients can create own appointments" ON public.appointments
    FOR INSERT WITH CHECK (client_id = auth.uid());

-- Barbers can create appointments for their clients
CREATE POLICY "Barbers can create appointments" ON public.appointments
    FOR INSERT WITH CHECK (barber_id = auth.uid());

-- Admins can create any appointment
CREATE POLICY "Admins can create any appointment" ON public.appointments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Clients can update their own appointments (with restrictions)
CREATE POLICY "Clients can update own appointments" ON public.appointments
    FOR UPDATE USING (client_id = auth.uid())
    WITH CHECK (client_id = auth.uid());

-- Barbers can update their own appointments
CREATE POLICY "Barbers can update own appointments" ON public.appointments
    FOR UPDATE USING (barber_id = auth.uid())
    WITH CHECK (barber_id = auth.uid());

-- Admins can update any appointment
CREATE POLICY "Admins can update any appointment" ON public.appointments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Working hours policies
CREATE POLICY "Working hours are viewable by everyone" ON public.working_hours
    FOR SELECT USING (true);

CREATE POLICY "Barbers can manage own working hours" ON public.working_hours
    FOR ALL USING (barber_id = auth.uid());

CREATE POLICY "Admins can manage all working hours" ON public.working_hours
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Blocked times policies
CREATE POLICY "Blocked times are viewable by everyone" ON public.blocked_times
    FOR SELECT USING (true);

CREATE POLICY "Barbers can manage own blocked times" ON public.blocked_times
    FOR ALL USING (barber_id = auth.uid());

CREATE POLICY "Admins can manage all blocked times" ON public.blocked_times
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create function to get available time slots
CREATE OR REPLACE FUNCTION public.get_available_time_slots(
    p_barber_id UUID,
    p_date DATE,
    p_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE(
    time_slot TIME,
    is_available BOOLEAN
) AS $$
DECLARE
    slot_time TIME;
    start_time TIME := '09:00:00';
    end_time TIME := '18:00:00';
    slot_interval INTERVAL := (p_duration_minutes || ' minutes')::INTERVAL;
BEGIN
    -- Get working hours for the barber on this day
    SELECT wh.start_time, wh.end_time INTO start_time, end_time
    FROM public.working_hours wh
    WHERE wh.barber_id = p_barber_id 
    AND wh.day_of_week = EXTRACT(DOW FROM p_date)
    AND wh.is_available = true;
    
    -- If no working hours found, use default
    IF start_time IS NULL THEN
        start_time := '09:00:00';
        end_time := '18:00:00';
    END IF;
    
    -- Generate time slots
    slot_time := start_time;
    WHILE slot_time + slot_interval <= end_time LOOP
        RETURN QUERY
        SELECT 
            slot_time,
            NOT EXISTS (
                -- Check for existing appointments
                SELECT 1 FROM public.appointments a
                WHERE a.barber_id = p_barber_id
                AND a.appointment_date = p_date
                AND a.appointment_time = slot_time
                AND a.status NOT IN ('cancelled')
            ) AND NOT EXISTS (
                -- Check for blocked times
                SELECT 1 FROM public.blocked_times bt
                WHERE bt.barber_id = p_barber_id
                AND p_date::TIMESTAMP + slot_time >= bt.start_datetime
                AND p_date::TIMESTAMP + slot_time + slot_interval <= bt.end_datetime
            );
        
        slot_time := slot_time + '00:30:00'::INTERVAL; -- 30-minute intervals
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check appointment conflicts
CREATE OR REPLACE FUNCTION public.check_appointment_conflicts(
    p_barber_id UUID,
    p_date DATE,
    p_time TIME,
    p_duration_minutes INTEGER,
    p_exclude_appointment_id UUID DEFAULT NULL
)
RETURNS TABLE(
    conflict_id UUID,
    conflict_time TIME,
    conflict_service VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.appointment_time,
        s.name
    FROM public.appointments a
    JOIN public.services s ON a.service_id = s.id
    WHERE a.barber_id = p_barber_id
    AND a.appointment_date = p_date
    AND a.status NOT IN ('cancelled')
    AND (p_exclude_appointment_id IS NULL OR a.id != p_exclude_appointment_id)
    AND (
        -- Check if new appointment overlaps with existing ones
        (a.appointment_time <= p_time AND a.appointment_time + (a.duration_minutes || ' minutes')::INTERVAL > p_time::TIME)
        OR
        (p_time <= a.appointment_time AND p_time + (p_duration_minutes || ' minutes')::INTERVAL > a.appointment_time)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.services IS 'Available services offered by the barbershop';
COMMENT ON TABLE public.appointments IS 'Customer appointments with barbers';
COMMENT ON TABLE public.working_hours IS 'Barber working hours by day of week';
COMMENT ON TABLE public.blocked_times IS 'Blocked time periods for barbers';
COMMENT ON FUNCTION public.get_available_time_slots IS 'Returns available time slots for a barber on a specific date';
COMMENT ON FUNCTION public.check_appointment_conflicts IS 'Checks for appointment conflicts for a barber on a specific date and time';