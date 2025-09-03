export interface Database {
  public: {
    Tables: {
      barbershops: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          logo_url: string | null
          theme_color: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          theme_color?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          theme_color?: string
          is_active?: boolean
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'admin' | 'barber' | 'customer'
          barbershop_id: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'admin' | 'barber' | 'customer'
          barbershop_id?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'admin' | 'barber' | 'customer'
          barbershop_id?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      barbers: {
        Row: {
          id: string
          profile_id: string
          barbershop_id: string
          specialty: string | null
          experience_years: number
          rating: number
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          barbershop_id: string
          specialty?: string | null
          experience_years?: number
          rating?: number
          is_available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          barbershop_id?: string
          specialty?: string | null
          experience_years?: number
          rating?: number
          is_available?: boolean
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          barbershop_id: string
          name: string
          description: string | null
          price: number
          duration_minutes: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          barbershop_id: string
          name: string
          description?: string | null
          price: number
          duration_minutes: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          barbershop_id?: string
          name?: string
          description?: string | null
          price?: number
          duration_minutes?: number
          is_active?: boolean
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          barbershop_id: string
          barber_id: string
          service_id: string | null
          customer_id: string | null
          customer_name: string
          customer_email: string
          customer_phone: string | null
          appointment_date: string
          appointment_time: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          barbershop_id: string
          barber_id: string
          service_id?: string | null
          customer_id?: string | null
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          appointment_date: string
          appointment_time: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          barbershop_id?: string
          barber_id?: string
          service_id?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          appointment_date?: string
          appointment_time?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          total_price?: number
          created_at?: string
        }
      }
    }
  }
}