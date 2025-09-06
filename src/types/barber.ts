// Tipos específicos para funcionalidades do barbeiro

export interface BarberProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  bio?: string;
  experience_years?: number;
  specialties?: string[];
  rating?: number;
  total_reviews?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkingHours {
  id?: string;
  barber_id: string;
  day_of_week: number; // 0 = domingo, 1 = segunda, etc.
  start_time: string; // formato HH:mm
  end_time: string; // formato HH:mm
  is_available: boolean;
  break_start?: string; // horário de pausa
  break_end?: string; // fim da pausa
}

export interface BarberService {
  id?: string;
  barber_id: string;
  name: string;
  description?: string;
  duration_minutes: number; // em minutos
  price: number;
  is_active: boolean;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BarberStats {
  today: {
    appointments: number;
    revenue: number;
    clients_served: number;
    completion_rate: number;
  };
  week: {
    appointments: number;
    revenue: number;
    clients_served: number;
    completion_rate: number;
    growth_percentage: number;
  };
  month: {
    appointments: number;
    revenue: number;
    clients_served: number;
    completion_rate: number;
    growth_percentage: number;
  };
  ratings: {
    average: number;
    total_reviews: number;
    recent_reviews: Review[];
  };
}

export interface Review {
  id: string;
  client_name: string;
  rating: number;
  comment?: string;
  service_name: string;
  created_at: string;
}

export interface BarberAppointment {
  id: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  service_id: string;
  service_name: string;
  service_duration: number;
  service_price: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: BarberAppointment;
  blocked?: boolean;
  block_reason?: string;
}

export interface BarberScheduleDay {
  date: string;
  day_name: string;
  is_working_day: boolean;
  working_hours?: {
    start: string;
    end: string;
    break_start?: string;
    break_end?: string;
  };
  time_slots: TimeSlot[];
  total_appointments: number;
  total_revenue: number;
}

export interface UpdateBarberProfileRequest {
  name?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  experience_years?: number;
  specialties?: string[];
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  category?: string;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  duration_minutes?: number;
  price?: number;
  category?: string;
  is_active?: boolean;
}

export interface BlockTimeSlotRequest {
  date: string;
  start_time: string;
  end_time: string;
  reason?: string;
}

export interface UpdateWorkingHoursRequest {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  break_start?: string;
  break_end?: string;
}

export interface BarberFilters {
  date_from?: string;
  date_to?: string;
  status?: BarberAppointment['status'][];
  service_id?: string;
}

export interface BarberDashboardData {
  profile: BarberProfile;
  stats: BarberStats;
  todayAppointments: BarberAppointment[];
  services: BarberService[];
  workingHours: WorkingHours[];
  upcomingAppointments: BarberAppointment[];
}

// Tipos para componentes
export interface BarberProfileFormData {
  name: string;
  phone: string;
  bio: string;
  experience_years: number;
  specialties: string[];
}

export interface ServiceFormData {
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  category: string;
}

export interface WorkingHoursFormData {
  [key: number]: {
    is_available: boolean;
    start_time: string;
    end_time: string;
    break_start: string;
    break_end: string;
  };
}

// Constantes úteis
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Segunda-feira', short: 'Seg' },
  { value: 2, label: 'Terça-feira', short: 'Ter' },
  { value: 3, label: 'Quarta-feira', short: 'Qua' },
  { value: 4, label: 'Quinta-feira', short: 'Qui' },
  { value: 5, label: 'Sexta-feira', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' }
];

export const SERVICE_CATEGORIES = [
  { value: 'corte', label: 'Corte de Cabelo' },
  { value: 'barba', label: 'Barba' },
  { value: 'bigode', label: 'Bigode' },
  { value: 'sobrancelha', label: 'Sobrancelha' },
  { value: 'tratamento', label: 'Tratamentos' },
  { value: 'combo', label: 'Combo' },
  { value: 'outros', label: 'Outros' }
];

export const APPOINTMENT_STATUS_LABELS = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Não Compareceu'
};

export const APPOINTMENT_STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-orange-100 text-orange-800'
};