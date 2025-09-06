import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

import type {
  Appointment,
  AppointmentFormData,
  AppointmentFilters,
  AppointmentResponse,
  Service,
  TimeSlot,
  CalendarEvent
} from '../types/appointments';

export const useAppointments = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch appointments based on user role and filters
  const fetchAppointments = useCallback(async (filters?: AppointmentFilters) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          customer:customer_id(id, email, full_name),
          barber_profile:barber_id(id, profile_id),
          service:service_id(id, name, duration_minutes, price)
        `);

      // Apply role-based filtering
      if (user.role === 'barber') {
        // For barbers, we need to find their barber record first
        const { data: barberData } = await supabase
          .from('barbers')
          .select('id')
          .eq('profile_id', user.id)
          .single();
        
        if (barberData) {
          query = query.eq('barber_id', barberData.id);
        }
      } else if (user.role === 'customer') {
        query = query.eq('customer_id', user.id);
      }
      // Admin can see all appointments

      // Apply additional filters
      if (filters) {
        if (filters.barberId) query = query.eq('barber_id', filters.barberId);
        if (filters.customerId) query = query.eq('customer_id', filters.customerId);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.startDate) query = query.gte('appointment_date', filters.startDate);
        if (filters.endDate) query = query.lte('appointment_date', filters.endDate);
      }

      query = query.order('appointment_date', { ascending: true })
                   .order('appointment_time', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to include datetime field
      const transformedAppointments: Appointment[] = (data || []).map(apt => ({
        ...apt,
        datetime: new Date(`${apt.appointment_date}T${apt.appointment_time}`)
      }));

      setAppointments(transformedAppointments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar agendamentos';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  // Fetch services
  const fetchServices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar serviços';
      setError(errorMessage);
    }
  }, []);

  // Create appointment
  const createAppointment = useCallback(async (appointmentData: AppointmentFormData): Promise<AppointmentResponse> => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado', appointments: [], total: 0 };
    }

    setLoading(true);

    try {
      // Check for conflicts
      const conflicts = await checkAppointmentConflicts(
        appointmentData.barber_id,
        appointmentData.appointment_date,
        appointmentData.appointment_time,
        appointmentData.service_id
      );

      if (conflicts.length > 0) {
        return {
          success: false,
          error: 'Conflito de horário detectado',
          appointments: [],
          total: 0,
          conflicts
        };
      }

      // Get service details
      const service = services.find(s => s.id === appointmentData.service_id);
      if (!service) {
        return { success: false, error: 'Serviço não encontrado', appointments: [], total: 0 };
      }

      const newAppointment = {
        ...appointmentData,
        client_id: appointmentData.client_id || user.id,
        service_name: service.name,
        duration_minutes: service.duration_minutes,
        price: service.price,
        status: 'confirmed' as const
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert([newAppointment])
        .select()
        .single();

      if (error) throw error;

      const appointment: Appointment = {
        ...data,
        datetime: new Date(`${data.appointment_date}T${data.appointment_time}`)
      };

      setAppointments(prev => [...prev, appointment]);
      showToast('Agendamento criado com sucesso!', 'success');

      return { success: true, appointments: [appointment], total: 1 };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar agendamento';
      showToast(errorMessage, 'error');
      return { success: false, error: errorMessage, appointments: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, [user, services, showToast]);

  // Update appointment
  const updateAppointment = useCallback(async (id: string, updates: Partial<AppointmentFormData>): Promise<AppointmentResponse> => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedAppointment: Appointment = {
        ...data,
        datetime: new Date(`${data.appointment_date}T${data.appointment_time}`)
      };

      setAppointments(prev => prev.map(apt => apt.id === id ? updatedAppointment : apt));
      showToast('Agendamento atualizado com sucesso!', 'success');

      return { success: true, appointments: [updatedAppointment], total: 1 };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar agendamento';
      showToast(errorMessage, 'error');
      return { success: false, error: errorMessage, appointments: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Cancel appointment
  const cancelAppointment = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, status: 'cancelled' } : apt
      ));
      showToast('Agendamento cancelado com sucesso!', 'success');

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cancelar agendamento';
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Check appointment conflicts
  const checkAppointmentConflicts = useCallback(async (
    barberId: string,
    date: string,
    time: string,
    serviceId: string,
    excludeId?: string
  ): Promise<Appointment[]> => {
    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) return [];

      const appointmentStart = new Date(`${date}T${time}`);
      const appointmentEnd = new Date(appointmentStart.getTime() + service.duration_minutes * 60000);

      let query = supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId)
        .eq('appointment_date', date)
        .neq('status', 'cancelled');

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const conflicts = (data || []).filter(apt => {
        const existingStart = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
        const existingEnd = new Date(existingStart.getTime() + apt.duration_minutes * 60000);

        return (
          (appointmentStart >= existingStart && appointmentStart < existingEnd) ||
          (appointmentEnd > existingStart && appointmentEnd <= existingEnd) ||
          (appointmentStart <= existingStart && appointmentEnd >= existingEnd)
        );
      });

      return conflicts.map(apt => ({
        ...apt,
        datetime: new Date(`${apt.appointment_date}T${apt.appointment_time}`)
      }));
    } catch (err) {
      console.error('Error checking conflicts:', err);
      return [];
    }
  }, [services]);

  // Generate time slots for a specific date and barber
  const generateTimeSlots = useCallback(async (
    date: string,
    barberId: string,
    serviceDuration: number = 30
  ): Promise<TimeSlot[]> => {
    try {
      // Get existing appointments for the date
      const existingAppointments = await checkAppointmentConflicts(
        barberId,
        date,
        '00:00',
        '0'
      );

      const slots: TimeSlot[] = [];
      const startHour = 9; // 9 AM
      const endHour = 18; // 6 PM
      const slotDuration = 30; // 30 minutes slots

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          // Check if slot conflicts with existing appointments
          const slotStart = new Date(`${date}T${timeString}:00`);
          const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
          
          const hasConflict = existingAppointments.some(apt => {
            const aptStart = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
            const aptEnd = new Date(aptStart.getTime() + (apt.duration_minutes || 30) * 60000);

            return (
              (slotStart >= aptStart && slotStart < aptEnd) ||
              (slotEnd > aptStart && slotEnd <= aptEnd) ||
              (slotStart <= aptStart && slotEnd >= aptEnd)
            );
          });

          // Check if there's enough time for the service
          const endOfDay = new Date(`${date}T${endHour.toString().padStart(2, '0')}:00:00`);
          const hasEnoughTime = slotEnd <= endOfDay;

          slots.push({
            time: timeString,
            available: !hasConflict && hasEnoughTime,
            appointment_id: hasConflict ? existingAppointments.find(apt => {
              const aptStart = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
              const aptEnd = new Date(aptStart.getTime() + (apt.duration_minutes || 30) * 60000);

              return (
                (slotStart >= aptStart && slotStart < aptEnd) ||
                (slotEnd > aptStart && slotEnd <= aptEnd) ||
                (slotStart <= aptStart && slotEnd >= aptEnd)
              );
            })?.id : undefined,
            duration_minutes: serviceDuration
          });
        }
      }

      return slots;
    } catch (error) {
      console.error('Error generating time slots:', error);
      return [];
    }
  }, [checkAppointmentConflicts]);

  // Convert appointments to calendar events
  const getCalendarEvents = useCallback((): CalendarEvent[] => {
    return appointments.map(appointment => {
      const startDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
      return {
        id: appointment.id,
        title: `${appointment.service_name}`,
        start: startDateTime,
        end: new Date(startDateTime.getTime() + (appointment.duration_minutes || 30) * 60000),
        resource: appointment
      };
    });
  }, [appointments]);

  // Initialize data on mount
  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchServices();
    }
  }, [user, fetchAppointments, fetchServices]);

  return {
    // State
    appointments,
    services,
    loading,
    error,
    
    // Actions
    fetchAppointments,
    fetchServices,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    checkAppointmentConflicts,
    generateTimeSlots,
    getCalendarEvents,
    
    // Computed
    calendarEvents: getCalendarEvents()
  };
};

export default useAppointments;