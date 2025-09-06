// Tipos específicos para funcionalidades do cliente

export interface ClientProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  birth_date?: string;
  preferences?: ClientPreferences;
  created_at: string;
  updated_at: string;
}

export interface ClientPreferences {
  favorite_barber_id?: string;
  preferred_services?: string[];
  preferred_time_slots?: string[];
  notifications_enabled: boolean;
  reminder_time: number; // minutos antes do agendamento
}

export interface ClientAppointment {
  id: string;
  client_id: string;
  barber_id: string;
  barber_name: string;
  barber_avatar?: string;
  service_id: string;
  service_name: string;
  service_duration: number;
  service_price: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  client_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientAppointmentHistory extends ClientAppointment {
  review?: ClientReview;
  can_review: boolean;
  can_cancel: boolean;
}

export interface ClientReview {
  id: string;
  appointment_id: string;
  client_id: string;
  barber_id: string;
  rating: number; // 1-5
  comment?: string;
  service_quality: number;
  punctuality: number;
  cleanliness: number;
  overall_experience: number;
  would_recommend: boolean;
  created_at: string;
}

export interface ClientStats {
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  total_spent: number;
  average_rating_given: number;
  favorite_barber?: {
    id: string;
    name: string;
    avatar_url?: string;
    appointments_count: number;
  };
  favorite_service?: {
    id: string;
    name: string;
    times_booked: number;
  };
  most_frequent_time?: string;
  loyalty_points: number;
  member_since: string;
}

export interface AvailableBarber {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  rating: number;
  total_reviews: number;
  specialties: string[];
  is_available: boolean;
  next_available_slot?: string;
}

export interface AvailableService {
  id: string;
  barber_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  category: string;
  is_active: boolean;
}

export interface AvailableTimeSlot {
  time: string;
  available: boolean;
  barber_id: string;
  date: string;
}

export interface BookingRequest {
  barber_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  notes?: string;
}

export interface UpdateClientProfileRequest {
  name?: string;
  phone?: string;
  avatar_url?: string;
  birth_date?: string;
  preferences?: Partial<ClientPreferences>;
}

export interface CreateReviewRequest {
  appointment_id: string;
  rating: number;
  comment?: string;
  service_quality: number;
  punctuality: number;
  cleanliness: number;
  overall_experience: number;
  would_recommend: boolean;
}

export interface ClientDashboardData {
  profile: ClientProfile;
  stats: ClientStats;
  upcoming_appointments: ClientAppointment[];
  recent_appointments: ClientAppointmentHistory[];
  available_barbers: AvailableBarber[];
  available_services: AvailableService[];
}

export interface AppointmentFilters {
  status?: string;
  barber_id?: string;
  service_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface BookingFilters {
  barber_id?: string;
  service_category?: string;
  date?: string;
  time_preference?: 'morning' | 'afternoon' | 'evening';
}

// Constantes úteis
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

export const RATING_LABELS = {
  1: 'Muito Ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente'
};

export const TIME_PREFERENCES = [
  { value: 'morning', label: 'Manhã (08:00 - 12:00)' },
  { value: 'afternoon', label: 'Tarde (12:00 - 18:00)' },
  { value: 'evening', label: 'Noite (18:00 - 22:00)' }
];

export const REMINDER_OPTIONS = [
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 120, label: '2 horas antes' },
  { value: 1440, label: '1 dia antes' }
];