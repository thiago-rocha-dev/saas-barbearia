import { supabase } from './supabase';
import type {
  ClientProfile,
  ClientStats,
  ClientAppointment,
  ClientAppointmentHistory,
  AvailableBarber,
  AvailableService,
  AvailableTimeSlot,
  BookingRequest,
  UpdateClientProfileRequest,
  CreateReviewRequest,
  AppointmentFilters,
  BookingFilters
} from '../types/client';

// Perfil do Cliente
export async function getClientProfile(userId: string): Promise<ClientProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        avatar_url,
        birth_date,
        preferences,
        created_at,
        updated_at
      `)
      .eq('id', userId)
      .eq('role', 'customer')
      .single();

    if (error) throw error;
    
    return {
      ...data,
      user_id: data.id
    };
  } catch (error) {
    console.error('Erro ao buscar perfil do cliente:', error);
    return null;
  }
}

export async function updateClientProfile(
  userId: string,
  updates: UpdateClientProfileRequest
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('role', 'customer');

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao atualizar perfil do cliente:', error);
    return false;
  }
}

// Agendamentos do Cliente
export async function getClientAppointments(
  clientId: string,
  filters: AppointmentFilters = {}
): Promise<ClientAppointment[]> {
  try {
    let query = supabase
      .from('appointments')
      .select(`
        id,
        client_id,
        barber_id,
        service_id,
        appointment_date,
        start_time,
        end_time,
        status,
        notes,
        client_notes,
        created_at,
        updated_at,
        barber:users!appointments_barber_id_fkey(
          name,
          avatar_url
        ),
        service:services(
          name,
          duration,
          price
        )
      `)
      .eq('client_id', clientId);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.barber_id) {
      query = query.eq('barber_id', filters.barber_id);
    }
    if (filters.date_from) {
      query = query.gte('appointment_date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('appointment_date', filters.date_to);
    }

    query = query.order('appointment_date', { ascending: false });

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(appointment => ({
      id: appointment.id,
      client_id: appointment.client_id,
      barber_id: appointment.barber_id,
      barber_name: Array.isArray(appointment.barber) ? (appointment.barber[0] as any)?.name || '' : (appointment.barber as any)?.name || '',
      barber_avatar: Array.isArray(appointment.barber) ? (appointment.barber[0] as any)?.avatar_url : (appointment.barber as any)?.avatar_url,
      service_id: appointment.service_id,
      service_name: Array.isArray(appointment.service) ? (appointment.service[0] as any)?.name || '' : (appointment.service as any)?.name || '',
      service_duration: Array.isArray(appointment.service) ? (appointment.service[0] as any)?.duration || 0 : (appointment.service as any)?.duration || 0,
      service_price: Array.isArray(appointment.service) ? (appointment.service[0] as any)?.price || 0 : (appointment.service as any)?.price || 0,
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      status: appointment.status,
      notes: appointment.notes,
      client_notes: appointment.client_notes,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at
    }));
  } catch (error) {
    console.error('Erro ao buscar agendamentos do cliente:', error);
    return [];
  }
}

export async function getClientAppointmentHistory(
  clientId: string,
  filters: AppointmentFilters = {}
): Promise<ClientAppointmentHistory[]> {
  try {
    const appointments = await getClientAppointments(clientId, {
      ...filters,
      status: filters.status || 'completed'
    });

    // Buscar avaliações para os agendamentos
    const appointmentIds = appointments.map(apt => apt.id);
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .in('appointment_id', appointmentIds);

    return appointments.map(appointment => {
      const review = reviews?.find(r => r.appointment_id === appointment.id);
      const now = new Date();
      const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
      const canCancel = appointment.status === 'scheduled' && appointmentDate > now;
      const canReview = appointment.status === 'completed' && !review;

      return {
        ...appointment,
        review,
        can_review: canReview,
        can_cancel: canCancel
      };
    });
  } catch (error) {
    console.error('Erro ao buscar histórico do cliente:', error);
    return [];
  }
}

// Criar Agendamento
export async function createClientAppointment(
  clientId: string,
  booking: BookingRequest
): Promise<string | null> {
  try {
    // Verificar se o horário está disponível
    const isAvailable = await checkTimeSlotAvailability(
      booking.barber_id,
      booking.appointment_date,
      booking.start_time
    );

    if (!isAvailable) {
      throw new Error('Horário não disponível');
    }

    // Buscar informações do serviço
    const { data: service } = await supabase
      .from('services')
      .select('duration')
      .eq('id', booking.service_id)
      .single();

    if (!service) {
      throw new Error('Serviço não encontrado');
    }

    // Calcular horário de término
    const startTime = new Date(`${booking.appointment_date}T${booking.start_time}`);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);
    const endTimeString = endTime.toTimeString().slice(0, 5);

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId,
        barber_id: booking.barber_id,
        service_id: booking.service_id,
        appointment_date: booking.appointment_date,
        start_time: booking.start_time,
        end_time: endTimeString,
        status: 'scheduled',
        client_notes: booking.notes
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return null;
  }
}

// Cancelar Agendamento
export async function cancelClientAppointment(
  appointmentId: string,
  clientId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .eq('client_id', clientId)
      .in('status', ['scheduled', 'confirmed']);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    return false;
  }
}

// Avaliações
export async function createReview(
  clientId: string,
  review: CreateReviewRequest
): Promise<boolean> {
  try {
    // Verificar se o agendamento pertence ao cliente e está concluído
    const { data: appointment } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('id', review.appointment_id)
      .eq('client_id', clientId)
      .eq('status', 'completed')
      .single();

    if (!appointment) {
      throw new Error('Agendamento não encontrado ou não pode ser avaliado');
    }

    // Verificar se já existe uma avaliação
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('appointment_id', review.appointment_id)
      .single();

    if (existingReview) {
      throw new Error('Agendamento já foi avaliado');
    }

    const { error } = await supabase
      .from('reviews')
      .insert({
        appointment_id: review.appointment_id,
        client_id: clientId,
        rating: review.rating,
        comment: review.comment,
        service_quality: review.service_quality,
        punctuality: review.punctuality,
        cleanliness: review.cleanliness,
        overall_experience: review.overall_experience,
        would_recommend: review.would_recommend
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    return false;
  }
}

// Estatísticas do Cliente
export async function getClientStats(clientId: string): Promise<ClientStats | null> {
  try {
    // Buscar estatísticas básicas
    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        id,
        status,
        barber_id,
        service_id,
        appointment_date,
        start_time,
        barber:users!appointments_barber_id_fkey(name, avatar_url),
        service:services(name, price)
      `)
      .eq('client_id', clientId);

    if (!appointments) {
      throw new Error('Erro ao buscar agendamentos');
    }

    // Buscar avaliações do cliente
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('client_id', clientId);

    // Calcular estatísticas
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;
    const totalSpent = appointments
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + (Array.isArray(apt.service) ? (apt.service[0] as any)?.price || 0 : (apt.service as any)?.price || 0), 0);

    const averageRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    // Barbeiro favorito
    const barberCounts = appointments.reduce((acc, apt) => {
      if (apt.barber_id) {
        acc[apt.barber_id] = (acc[apt.barber_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const favoriteBarberEntry = Object.entries(barberCounts)
      .sort(([,a], [,b]) => b - a)[0];

    const favoriteBarber = favoriteBarberEntry ? {
      id: favoriteBarberEntry[0],
      name: (() => {
         const apt = appointments.find(apt => apt.barber_id === favoriteBarberEntry[0]);
         return Array.isArray(apt?.barber) ? (apt.barber[0] as any)?.name || '' : (apt?.barber as any)?.name || '';
       })(),
       avatar_url: (() => {
         const apt = appointments.find(apt => apt.barber_id === favoriteBarberEntry[0]);
         return Array.isArray(apt?.barber) ? (apt.barber[0] as any)?.avatar_url : (apt?.barber as any)?.avatar_url;
       })(),
      appointments_count: favoriteBarberEntry[1]
    } : undefined;

    // Serviço favorito
    const serviceCounts = appointments.reduce((acc, apt) => {
      if (apt.service_id) {
        acc[apt.service_id] = (acc[apt.service_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const favoriteServiceEntry = Object.entries(serviceCounts)
      .sort(([,a], [,b]) => b - a)[0];

    const favoriteService = favoriteServiceEntry ? {
      id: favoriteServiceEntry[0],
      name: (() => {
         const apt = appointments.find(apt => apt.service_id === favoriteServiceEntry[0]);
         return Array.isArray(apt?.service) ? (apt.service[0] as any)?.name || '' : (apt?.service as any)?.name || '';
       })(),
      times_booked: favoriteServiceEntry[1]
    } : undefined;

    // Horário mais frequente
    const timeCounts = appointments.reduce((acc, apt) => {
      if (apt.start_time) {
        const hour = apt.start_time.slice(0, 2);
        acc[hour] = (acc[hour] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentTimeEntry = Object.entries(timeCounts)
      .sort(([,a], [,b]) => b - a)[0];

    const mostFrequentTime = mostFrequentTimeEntry ? `${mostFrequentTimeEntry[0]}:00` : undefined;

    // Buscar data de criação do usuário
    const { data: user } = await supabase
      .from('users')
      .select('created_at')
      .eq('id', clientId)
      .single();

    return {
      total_appointments: totalAppointments,
      completed_appointments: completedAppointments,
      cancelled_appointments: cancelledAppointments,
      total_spent: totalSpent,
      average_rating_given: averageRating,
      favorite_barber: favoriteBarber,
      favorite_service: favoriteService,
      most_frequent_time: mostFrequentTime,
      loyalty_points: Math.floor(totalSpent / 10), // 1 ponto a cada R$ 10
      member_since: user?.created_at || ''
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas do cliente:', error);
    return null;
  }
}

// Barbeiros Disponíveis
export async function getAvailableBarbers(_filters: BookingFilters = {}): Promise<AvailableBarber[]> {
  try {
    let query = supabase
      .from('users')
      .select(`
        id,
        name,
        avatar_url,
        bio,
        specialties,
        is_active
      `)
      .eq('role', 'barber')
      .eq('is_active', true);

    const { data, error } = await query;

    if (error) throw error;

    // Para cada barbeiro, calcular rating e próximo slot disponível
    const barbersWithStats = await Promise.all(
      data.map(async (barber) => {
        // Buscar rating médio
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('barber_id', barber.id);

        const rating = reviews && reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : 0;

        return {
          id: barber.id,
          name: barber.name,
          avatar_url: barber.avatar_url,
          bio: barber.bio,
          rating: Math.round(rating * 10) / 10,
          total_reviews: reviews?.length || 0,
          specialties: barber.specialties || [],
          is_available: barber.is_active,
          next_available_slot: undefined // TODO: implementar lógica de próximo slot
        };
      })
    );

    return barbersWithStats;
  } catch (error) {
    console.error('Erro ao buscar barbeiros disponíveis:', error);
    return [];
  }
}

// Serviços Disponíveis
export async function getAvailableServices(barberId?: string): Promise<AvailableService[]> {
  try {
    let query = supabase
      .from('services')
      .select('*')
      .eq('is_active', true);

    if (barberId) {
      query = query.eq('barber_id', barberId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar serviços disponíveis:', error);
    return [];
  }
}

// Horários Disponíveis
export async function getAvailableTimeSlots(
  barberId: string,
  date: string
): Promise<AvailableTimeSlot[]> {
  try {
    // Buscar horários de trabalho do barbeiro
    const { data: workingHours } = await supabase
      .from('working_hours')
      .select('*')
      .eq('barber_id', barberId)
      .eq('day_of_week', new Date(date).getDay())
      .eq('is_available', true)
      .single();

    if (!workingHours) {
      return [];
    }

    // Buscar agendamentos existentes para o dia
    const { data: appointments } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('barber_id', barberId)
      .eq('appointment_date', date)
      .in('status', ['scheduled', 'confirmed', 'in_progress']);

    // Gerar slots de 30 em 30 minutos
    const slots: AvailableTimeSlot[] = [];
    const startTime = new Date(`${date}T${workingHours.start_time}`);
    const endTime = new Date(`${date}T${workingHours.end_time}`);
    const slotDuration = 30; // minutos

    for (let time = new Date(startTime); time < endTime; time.setMinutes(time.getMinutes() + slotDuration)) {
      const timeString = time.toTimeString().slice(0, 5);
      // const slotEndTime = new Date(time.getTime() + slotDuration * 60000);
      // const slotEndString = slotEndTime.toTimeString().slice(0, 5);

      // Verificar se o slot está ocupado
      const isOccupied = appointments?.some(apt => {
        return timeString >= apt.start_time && timeString < apt.end_time;
      }) || false;

      // Verificar se está no horário de pausa
      const isBreakTime = workingHours.break_start && workingHours.break_end &&
        timeString >= workingHours.break_start && timeString < workingHours.break_end;

      slots.push({
        time: timeString,
        available: !isOccupied && !isBreakTime,
        barber_id: barberId,
        date
      });
    }

    return slots;
  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error);
    return [];
  }
}

// Verificar disponibilidade de horário
export async function checkTimeSlotAvailability(
  barberId: string,
  date: string,
  time: string
): Promise<boolean> {
  try {
    const slots = await getAvailableTimeSlots(barberId, date);
    const slot = slots.find(s => s.time === time);
    return slot?.available || false;
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    return false;
  }
}