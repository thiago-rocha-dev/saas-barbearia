export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description?: string;
  category?: string;
  is_popular?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  barber_id: string;
  client_name: string;
  barber_name: string;
  service_id: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: AppointmentStatus;
  notes?: string;
  price?: number;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointment_id?: string;
  duration_minutes?: number;
}

export interface AppointmentFormData {
  client_id?: string;
  barber_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}

export interface AppointmentFilters {
  barberId?: string;
  clientId?: string;
  serviceId?: string;
  startDate?: string;
  endDate?: string;
  status?: AppointmentStatus;
  limit?: number;
  offset?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
  allDay?: boolean;
}

export interface WorkingHours {
  start: string;
  end: string;
  break_start?: string;
  break_end?: string;
}

export interface BarberSchedule {
  barber_id: string;
  date: string;
  working_hours: WorkingHours;
  blocked_slots: string[];
}

export interface AppointmentStats {
  total_appointments: number;
  confirmed_appointments: number;
  cancelled_appointments: number;
  completed_appointments: number;
  revenue: number;
  average_duration: number;
}

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export interface AppointmentResponse {
  success: boolean;
  appointments: Appointment[];
  total: number;
  error?: string;
  conflicts?: Appointment[];
}

export interface TimeSlotOptions {
  date: string;
  barber_id: string;
  service_duration: number;
  working_hours: WorkingHours;
  existing_appointments: Appointment[];
  blocked_slots: string[];
}