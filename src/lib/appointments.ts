import { supabase } from './supabase';
import type {
  Appointment,
  AppointmentFormData,
  AppointmentFilters,
  AppointmentResponse,
  Service,
  TimeSlot,
  AppointmentStats,
  WorkingHours,
  CalendarEvent
} from '../types/appointments';
import type { UserRole } from '../types/dashboard';

// ============================================================================
// APPOINTMENT CRUD OPERATIONS
// ============================================================================

/**
 * Fetch appointments with filters and role-based access control
 */
export async function fetchAppointments(
  filters: AppointmentFilters = {},
  userRole?: UserRole,
  userId?: string
): Promise<AppointmentResponse> {
  try {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        services:service_id (
          id,
          name,
          duration_minutes,
          price,
          category
        ),
        client:client_id (
          id,
          email,
          raw_user_meta_data
        ),
        barber:barber_id (
          id,
          email,
          raw_user_meta_data
        )
      `);

    // Apply role-based filtering
    if (userRole === 'customer' && userId) {
      query = query.eq('client_id', userId);
    } else if (userRole === 'barber' && userId) {
      query = query.eq('barber_id', userId);
    }
    // Admin can see all appointments (no additional filter)

    // Apply date filters
    if (filters.startDate) {
      query = query.gte('appointment_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('appointment_date', filters.endDate);
    }

    // Apply other filters
    if (filters.barberId) {
      query = query.eq('barber_id', filters.barberId);
    }
    if (filters.customerId) {
      query = query.eq('client_id', filters.customerId);
    }
    if (filters.serviceId) {
      query = query.eq('service_id', filters.serviceId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Apply sorting
    query = query.order('appointment_date', { ascending: true })
                 .order('appointment_time', { ascending: true });

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching appointments:', error);
      return {
        success: false,
        error: error.message,
        appointments: [],
        total: 0
      };
    }

    // Transform data to include computed fields
    const appointments: Appointment[] = (data || []).map(item => ({
      id: item.id,
      customer_id: item.client_id || item.customer_id,
      client_id: item.client_id,
      barber_id: item.barber_id,
      service_id: item.service_id,
      service_name: item.services?.name || 'Serviço não encontrado',
      appointment_date: item.appointment_date,
      appointment_time: item.appointment_time,
      duration_minutes: item.duration_minutes || item.services?.duration_minutes || 30,
      status: item.status,
      total_price: item.price || item.services?.price || 0,
      price: item.price || item.services?.price || 0,
      notes: item.notes,
      created_at: item.created_at,
      updated_at: item.updated_at,
      customer_name: item.client?.raw_user_meta_data?.name || item.client?.email || 'Cliente',
      customer_email: item.client?.email || '',
      client_name: item.client?.raw_user_meta_data?.name || item.client?.email || 'Cliente',
      barber_name: item.barber?.raw_user_meta_data?.name || item.barber?.email || 'Barbeiro'
    }));

    return {
      success: true,
      appointments,
      total: count || appointments.length
    };
  } catch (error) {
    console.error('Error in fetchAppointments:', error);
    return {
      success: false,
      error: 'Erro interno do servidor',
      appointments: [],
      total: 0
    };
  }
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  appointmentData: AppointmentFormData
): Promise<AppointmentResponse> {
  try {
    // First, check for conflicts
    const conflicts = await checkAppointmentConflicts(
      appointmentData.barber_id,
      appointmentData.appointment_date,
      appointmentData.appointment_time,
      60 // Default duration, will be updated with service duration
    );

    if (conflicts.length > 0) {
      return {
        success: false,
        error: 'Conflito de horário detectado',
        appointments: [],
        conflicts,
        total: 0
      };
    }

    // Get service details for duration and price
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration_minutes, price')
      .eq('id', appointmentData.service_id)
      .single();

    if (serviceError || !service) {
      return {
        success: false,
        error: 'Serviço não encontrado',
        appointments: [],
        total: 0
      };
    }

    // Create the appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        client_id: appointmentData.client_id,
        barber_id: appointmentData.barber_id,
        service_id: appointmentData.service_id,
        appointment_date: appointmentData.appointment_date,
        appointment_time: appointmentData.appointment_time,
        duration_minutes: service.duration_minutes,
        price: service.price,
        notes: appointmentData.notes,
        status: 'pending'
      })
      .select(`
        *,
        services:service_id (
          name,
          duration_minutes,
          price
        ),
        client:client_id (
          raw_user_meta_data
        ),
        barber:barber_id (
          raw_user_meta_data
        )
      `)
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      return {
        success: false,
        error: error.message,
        appointments: [],
        total: 0
      };
    }

    const appointment: Appointment = {
      id: data.id,
      customer_id: data.client_id || data.customer_id,
      client_id: data.client_id,
      barber_id: data.barber_id,
      service_id: data.service_id,
      service_name: data.services?.name || 'Serviço',
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      duration_minutes: data.duration_minutes || data.services?.duration_minutes || 30,
      status: data.status,
      total_price: data.price || data.services?.price || 0,
      price: data.price,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
      customer_name: data.client?.raw_user_meta_data?.name || data.client?.email || 'Cliente',
      customer_email: data.client?.email || '',
      client_name: data.client?.raw_user_meta_data?.name || data.client?.email || 'Cliente',
      barber_name: data.barber?.raw_user_meta_data?.name || 'Barbeiro'
    };

    return {
      success: true,
      appointments: [appointment],
      total: 1
    };
  } catch (error) {
    console.error('Error in createAppointment:', error);
    return {
      success: false,
      error: 'Erro interno do servidor',
      appointments: [],
      total: 0
    };
  }
}

/**
 * Update an existing appointment
 */
export async function updateAppointment(
  appointmentId: string,
  updates: Partial<AppointmentFormData> & { status?: string }
): Promise<AppointmentResponse> {
  try {
    // If updating time/date, check for conflicts
    if (updates.appointment_date || updates.appointment_time) {
      const { data: currentAppointment } = await supabase
        .from('appointments')
        .select('barber_id, appointment_date, appointment_time, duration_minutes')
        .eq('id', appointmentId)
        .single();

      if (currentAppointment) {
        const conflicts = await checkAppointmentConflicts(
          updates.barber_id || currentAppointment.barber_id,
          updates.appointment_date || currentAppointment.appointment_date,
          updates.appointment_time || currentAppointment.appointment_time,
          currentAppointment.duration_minutes,
          appointmentId // Exclude current appointment from conflict check
        );

        if (conflicts.length > 0) {
          return {
            success: false,
            error: 'Conflito de horário detectado',
            appointments: [],
            conflicts,
            total: 0
          };
        }
      }
    }

    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', appointmentId)
      .select(`
        *,
        services:service_id (
          name,
          duration_minutes,
          price
        ),
        client:client_id (
          raw_user_meta_data
        ),
        barber:barber_id (
          raw_user_meta_data
        )
      `)
      .single();

    if (error) {
      console.error('Error updating appointment:', error);
      return {
        success: false,
        error: error.message,
        appointments: [],
        total: 0
      };
    }

    const appointment: Appointment = {
      id: data.id,
      customer_id: data.client_id || data.customer_id,
      client_id: data.client_id,
      barber_id: data.barber_id,
      service_id: data.service_id,
      service_name: data.services?.name || 'Serviço',
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      duration_minutes: data.duration_minutes || data.services?.duration_minutes || 30,
      status: data.status,
      total_price: data.price || data.services?.price || 0,
      price: data.price,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
      customer_name: data.client?.raw_user_meta_data?.name || data.client?.email || 'Cliente',
      customer_email: data.client?.email || '',
      client_name: data.client?.raw_user_meta_data?.name || data.client?.email || 'Cliente',
      barber_name: data.barber?.raw_user_meta_data?.name || 'Barbeiro'
    };

    return {
      success: true,
      appointments: [appointment],
      total: 1
    };
  } catch (error) {
    console.error('Error in updateAppointment:', error);
    return {
      success: false,
      error: 'Erro interno do servidor',
      appointments: [],
      total: 0
    };
  }
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(appointmentId: string): Promise<AppointmentResponse> {
  return updateAppointment(appointmentId, { status: 'cancelled' });
}

/**
 * Delete an appointment (admin only)
 */
export async function deleteAppointment(appointmentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);

    if (error) {
      console.error('Error deleting appointment:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteAppointment:', error);
    return {
      success: false,
      error: 'Erro interno do servidor'
    };
  }
}

// ============================================================================
// SERVICE OPERATIONS
// ============================================================================

/**
 * Fetch all active services
 */
export async function fetchServices(): Promise<Service[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('is_popular', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching services:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchServices:', error);
    return [];
  }
}

/**
 * Create a new service (admin only)
 */
export async function createService(serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; service?: Service; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single();

    if (error) {
      console.error('Error creating service:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      service: data
    };
  } catch (error) {
    console.error('Error in createService:', error);
    return {
      success: false,
      error: 'Erro interno do servidor'
    };
  }
}

// ============================================================================
// TIME SLOT OPERATIONS
// ============================================================================

/**
 * Generate available time slots for a specific date and barber
 */
export async function generateTimeSlots(
  date: string,
  barberId: string,
  serviceDuration: number = 30
): Promise<TimeSlot[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_available_time_slots', {
        p_barber_id: barberId,
        p_date: date,
        p_duration_minutes: serviceDuration
      });

    if (error) {
      console.error('Error generating time slots:', error);
      return [];
    }

    return (data || []).map((slot: any) => ({
      time: slot.time_slot,
      available: slot.is_available
    }));
  } catch (error) {
    console.error('Error in generateTimeSlots:', error);
    // Fallback: generate basic time slots
    return generateBasicTimeSlots();
  }
}

/**
 * Fallback function to generate basic time slots
 */
function generateBasicTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startHour = 9; // 9 AM
  const endHour = 18; // 6 PM
  const intervalMinutes = 30;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
      slots.push({
        time,
        available: true // Will be checked separately
      });
    }
  }

  return slots;
}

/**
 * Check for appointment conflicts
 */
export async function checkAppointmentConflicts(
  barberId: string,
  date: string,
  time: string,
  durationMinutes: number,
  excludeAppointmentId?: string
): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .rpc('check_appointment_conflicts', {
        p_barber_id: barberId,
        p_date: date,
        p_time: time,
        p_duration_minutes: durationMinutes,
        p_exclude_appointment_id: excludeAppointmentId || null
      });

    if (error) {
      console.error('Error checking conflicts:', error);
      return [];
    }

    return (data || []).map((conflict: any) => ({
      id: conflict.conflict_id,
      appointment_time: conflict.conflict_time,
      service_name: conflict.conflict_service,
      // Add other required fields with defaults
      client_id: '',
      barber_id: barberId,
      service_id: '',
      appointment_date: date,
      duration_minutes: durationMinutes,
      status: 'confirmed',
      price: 0,
      created_at: '',
      updated_at: ''
    }));
  } catch (error) {
    console.error('Error in checkAppointmentConflicts:', error);
    return [];
  }
}

// ============================================================================
// CALENDAR OPERATIONS
// ============================================================================

/**
 * Get calendar events for a specific date range
 */
export async function getCalendarEvents(
  startDate: string,
  endDate: string,
  barberId?: string,
  userRole?: UserRole,
  userId?: string
): Promise<CalendarEvent[]> {
  try {
    const filters: AppointmentFilters = {
      startDate,
      endDate,
      barberId
    };

    const response = await fetchAppointments(filters, userRole, userId);
    
    if (!response.success) {
      return [];
    }

    return response.appointments.map(appointment => ({
      id: appointment.id,
      title: `${appointment.service_name} - ${appointment.client_name}`,
      start: new Date(`${appointment.appointment_date}T${appointment.appointment_time}`),
      end: new Date(
        new Date(`${appointment.appointment_date}T${appointment.appointment_time}`).getTime() +
        (appointment.duration_minutes || 30) * 60000
      ),
      resource: appointment
    }));
  } catch (error) {
    console.error('Error in getCalendarEvents:', error);
    return [];
  }
}

// ============================================================================
// STATISTICS OPERATIONS
// ============================================================================

/**
 * Get appointment statistics
 */
export async function getAppointmentStats(
  startDate: string,
  endDate: string,
  barberId?: string
): Promise<AppointmentStats> {
  try {
    let query = supabase
      .from('appointments')
      .select('status, price, appointment_date')
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate);

    if (barberId) {
      query = query.eq('barber_id', barberId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching appointment stats:', error);
      return {
        total_appointments: 0,
        confirmed_appointments: 0,
        cancelled_appointments: 0,
        completed_appointments: 0,
        revenue: 0,
        average_duration: 0
      };
    }

    const appointments = data || [];
    const stats = appointments.reduce(
      (acc, appointment) => {
        acc.total_appointments++;
        
        switch (appointment.status) {
          case 'confirmed':
            acc.confirmed_appointments++;
            break;
          case 'cancelled':
            acc.cancelled_appointments++;
            break;
          case 'completed':
            acc.completed_appointments++;
            break;
        }
        
        if (appointment.status === 'completed' && appointment.price) {
          acc.revenue += appointment.price;
        }
        
        return acc;
      },
      {
        total_appointments: 0,
        confirmed_appointments: 0,
        cancelled_appointments: 0,
        completed_appointments: 0,
        revenue: 0,
        average_duration: 0
      }
    );

    return stats;
  } catch (error) {
    console.error('Error in getAppointmentStats:', error);
    return {
      total_appointments: 0,
      confirmed_appointments: 0,
      cancelled_appointments: 0,
      completed_appointments: 0,
      revenue: 0,
      average_duration: 0
    };
  }
}

// ============================================================================
// WORKING HOURS OPERATIONS
// ============================================================================

/**
 * Get working hours for a barber
 */
export async function getWorkingHours(barberId: string): Promise<WorkingHours[]> {
  try {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('barber_id', barberId)
      .order('day_of_week');

    if (error) {
      console.error('Error fetching working hours:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWorkingHours:', error);
    return [];
  }
}

/**
 * Update working hours for a barber
 */
export async function updateWorkingHours(
  barberId: string,
  workingHours: Omit<WorkingHours, 'id' | 'barber_id' | 'created_at' | 'updated_at'>[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete existing working hours
    await supabase
      .from('working_hours')
      .delete()
      .eq('barber_id', barberId);

    // Insert new working hours
    const { error } = await supabase
      .from('working_hours')
      .insert(
        workingHours.map(wh => ({
          ...wh,
          barber_id: barberId
        }))
      );

    if (error) {
      console.error('Error updating working hours:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateWorkingHours:', error);
    return {
      success: false,
      error: 'Erro interno do servidor'
    };
  }
}