import { supabase } from './supabase';
import type {
  BarberProfile,
  BarberStats,
  BarberService,
  WorkingHours,
  BarberAppointment,
  BarberScheduleDay,
  UpdateBarberProfileRequest,
  CreateServiceRequest,
  UpdateServiceRequest,
  UpdateWorkingHoursRequest,
  BlockTimeSlotRequest,
  BarberFilters,
  TimeSlot
} from '../types/barber';

// Função para obter perfil do barbeiro
export async function getBarberProfile(barberId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', barberId)
      .eq('role', 'barber')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as BarberProfile };
  } catch (err) {
    return { success: false, error: 'Erro inesperado ao buscar perfil do barbeiro' };
  }
}

// Função para atualizar perfil do barbeiro
export async function updateBarberProfile(barberId: string, updates: UpdateBarberProfileRequest) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', barberId)
      .eq('role', 'barber')
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as BarberProfile };
  } catch (err) {
    return { success: false, error: 'Erro inesperado ao atualizar perfil' };
  }
}

// Função para obter serviços do barbeiro
// TRAE_FIX-services: Corrigir para usar barbershop_id em vez de barber_id
export async function getBarberServices(barberId: string) {
  try {
    // Primeiro, buscar o barbershop_id do barbeiro
    const { data: barberData, error: barberError } = await supabase
      .from('barbers')
      .select('barbershop_id')
      .eq('profile_id', barberId)
      .single();

    if (barberError || !barberData) {
      return { success: false, error: 'Barbeiro não encontrado' };
    }

    // Buscar serviços da barbearia
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('barbershop_id', barberData.barbershop_id)
      .eq('is_active', true)
      .order('name');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as BarberService[] };
  } catch (err) {
    return { success: false, error: 'Erro inesperado ao buscar serviços' };
  }
}

// Função para criar serviço
// TRAE_FIX-services: Corrigir para usar tabela services com barbershop_id
export async function createBarberService(barberId: string, service: CreateServiceRequest) {
  try {
    // Primeiro, buscar o barbershop_id do barbeiro
    const { data: barberData, error: barberError } = await supabase
      .from('barbers')
      .select('barbershop_id')
      .eq('profile_id', barberId)
      .single();

    if (barberError || !barberData) {
      return { success: false, error: 'Barbeiro não encontrado' };
    }

    const { data, error } = await supabase
      .from('services')
      .insert({
        ...service,
        barbershop_id: barberData.barbershop_id,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as BarberService };
  } catch (err) {
    return { success: false, error: 'Erro inesperado ao criar serviço' };
  }
}

// Função para atualizar serviço
// TRAE_FIX-services: Corrigir para usar tabela services
export async function updateBarberService(serviceId: string, updates: UpdateServiceRequest) {
  try {
    const { data, error } = await supabase
      .from('services')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', serviceId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as BarberService };
  } catch (err) {
    return { success: false, error: 'Erro inesperado ao atualizar serviço' };
  }
}

// Função para deletar serviço
// TRAE_FIX-services: Corrigir para usar tabela services
export async function deleteBarberService(serviceId: string) {
  try {
    const { error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', serviceId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Erro inesperado ao deletar serviço' };
  }
}

// Função para obter horários de trabalho
export async function getWorkingHours(barberId: string) {
  try {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('barber_id', barberId)
      .order('day_of_week');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as WorkingHours[] };
  } catch (err) {
    return { success: false, error: 'Erro inesperado ao buscar horários de trabalho' };
  }
}

// Função para atualizar horários de trabalho
export async function updateWorkingHours(barberId: string, workingHours: UpdateWorkingHoursRequest[]) {
  try {
    // Primeiro, deletar horários existentes
    await supabase
      .from('working_hours')
      .delete()
      .eq('barber_id', barberId);

    // Inserir novos horários
    const { data, error } = await supabase
      .from('working_hours')
      .insert(
        workingHours.map(hours => ({
          ...hours,
          barber_id: barberId
        }))
      )
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as WorkingHours[] };
  } catch (err) {
    return { success: false, error: 'Erro inesperado ao atualizar horários de trabalho' };
  }
}

// Função para obter agendamentos do barbeiro
export async function getBarberAppointments(barberId: string, filters?: BarberFilters) {
  try {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        client:profiles!appointments_client_id_fkey(name, phone),
        service:barber_services!appointments_service_id_fkey(name, duration, price)
      `)
      .eq('barber_id', barberId);

    if (filters?.date_from) {
      query = query.gte('appointment_date', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('appointment_date', filters.date_to);
    }

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters?.service_id) {
      query = query.eq('service_id', filters.service_id);
    }

    const { data, error } = await query.order('appointment_date', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    // Transformar dados para o formato esperado
    const appointments: BarberAppointment[] = data.map(appointment => ({
      id: appointment.id,
      client_id: appointment.client_id,
      client_name: appointment.client?.name || 'Cliente não encontrado',
      client_phone: appointment.client?.phone || '',
      service_id: appointment.service_id,
      service_name: appointment.service?.name || 'Serviço não encontrado',
      service_duration: appointment.service?.duration || 0,
      service_price: appointment.service?.price || 0,
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      status: appointment.status,
      notes: appointment.notes,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at
    }));

    return { success: true, data: appointments };
  } catch (err) {
    return { success: false, error: 'Erro inesperado ao buscar agendamentos' };
  }
}

// Função para atualizar status do agendamento
export async function updateAppointmentStatus(appointmentId: string, status: BarberAppointment['status']) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: 'Erro inesperado ao atualizar agendamento' };
  }
}

// Função para obter estatísticas do barbeiro
export async function getBarberStats(barberId: string): Promise<{ success: boolean; data?: BarberStats; error?: string }> {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Buscar agendamentos para estatísticas
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        service:barber_services!appointments_service_id_fkey(price)
      `)
      .eq('barber_id', barberId)
      .gte('appointment_date', startOfMonth.toISOString().split('T')[0]);

    if (error) {
      return { success: false, error: error.message };
    }

    // Calcular estatísticas
    const todayAppointments = appointments.filter(apt => 
      apt.appointment_date === startOfToday.toISOString().split('T')[0]
    );
    
    const weekAppointments = appointments.filter(apt => 
      new Date(apt.appointment_date) >= startOfWeek
    );
    
    const monthAppointments = appointments;

    const calculateStats = (appointmentsList: any[]) => {
      const completed = appointmentsList.filter(apt => apt.status === 'completed');
      const revenue = completed.reduce((sum, apt) => sum + (apt.service?.price || 0), 0);
      const completionRate = appointmentsList.length > 0 ? (completed.length / appointmentsList.length) * 100 : 0;
      
      return {
        appointments: appointmentsList.length,
        revenue,
        clients_served: completed.length,
        completion_rate: completionRate
      };
    };

    const stats: BarberStats = {
      today: calculateStats(todayAppointments),
      week: {
        ...calculateStats(weekAppointments),
        growth_percentage: 0 // Implementar cálculo de crescimento se necessário
      },
      month: {
        ...calculateStats(monthAppointments),
        growth_percentage: 0 // Implementar cálculo de crescimento se necessário
      },
      ratings: {
        average: 4.5, // Implementar sistema de avaliações
        total_reviews: 0,
        recent_reviews: []
      }
    };

    return { success: true, data: stats };
  } catch (err) {
    return { success: false, error: 'Erro inesperado ao calcular estatísticas' };
  }
}

// Função para gerar agenda do dia
export async function getBarberScheduleDay(barberId: string, date: string): Promise<{ success: boolean; data?: BarberScheduleDay; error?: string }> {
  try {
    const dayOfWeek = new Date(date).getDay();
    
    // Buscar horários de trabalho para o dia
    const { data: workingHours } = await supabase
      .from('working_hours')
      .select('*')
      .eq('barber_id', barberId)
      .eq('day_of_week', dayOfWeek)
      .single();

    // Buscar agendamentos do dia
    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        *,
        client:profiles!appointments_client_id_fkey(name, phone),
        service:barber_services!appointments_service_id_fkey(name, duration, price)
      `)
      .eq('barber_id', barberId)
      .eq('appointment_date', date);

    const isWorkingDay = workingHours?.is_available || false;
    const timeSlots: TimeSlot[] = [];

    if (isWorkingDay && workingHours) {
      // Gerar slots de 30 minutos
      const startTime = workingHours.start_time;
      const endTime = workingHours.end_time;
      const breakStart = workingHours.break_start;
      const breakEnd = workingHours.break_end;

      let currentTime = startTime;
      while (currentTime < endTime) {
        const isBreakTime = breakStart && breakEnd && currentTime >= breakStart && currentTime < breakEnd;
        const appointment = appointments?.find(apt => apt.start_time === currentTime);
        
        timeSlots.push({
          time: currentTime,
          available: !appointment && !isBreakTime,
          appointment: appointment ? {
            id: appointment.id,
            client_id: appointment.client_id,
            client_name: appointment.client?.name || '',
            client_phone: appointment.client?.phone || '',
            service_id: appointment.service_id,
            service_name: appointment.service?.name || '',
            service_duration: appointment.service?.duration || 0,
            service_price: appointment.service?.price || 0,
            appointment_date: appointment.appointment_date,
            start_time: appointment.start_time,
            end_time: appointment.end_time,
            status: appointment.status,
            notes: appointment.notes,
            created_at: appointment.created_at,
            updated_at: appointment.updated_at
          } : undefined,
          blocked: isBreakTime,
          block_reason: isBreakTime ? 'Intervalo' : undefined
        });

        // Incrementar 30 minutos
        const [hours, minutes] = currentTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + 30;
        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;
        currentTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
      }
    }

    const scheduleDay: BarberScheduleDay = {
      date,
      day_name: new Date(date).toLocaleDateString('pt-BR', { weekday: 'long' }),
      is_working_day: isWorkingDay,
      working_hours: workingHours ? {
        start: workingHours.start_time,
        end: workingHours.end_time,
        break_start: workingHours.break_start,
        break_end: workingHours.break_end
      } : undefined,
      time_slots: timeSlots,
      total_appointments: appointments?.length || 0,
      total_revenue: appointments?.reduce((sum, apt) => sum + (apt.service?.price || 0), 0) || 0
    };

    return { success: true, data: scheduleDay };
  } catch (err) {
    return { success: false, error: 'Erro inesperado ao gerar agenda do dia' };
  }
}

// Função para bloquear horário
export async function blockTimeSlot(barberId: string, blockData: BlockTimeSlotRequest) {
  try {
    const { data, error } = await supabase
      .from('blocked_times')
      .insert({
        barber_id: barberId,
        date: blockData.date,
        start_time: blockData.start_time,
        end_time: blockData.end_time,
        reason: blockData.reason || 'Bloqueado pelo barbeiro',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: 'Erro inesperado ao bloquear horário' };
  }
}