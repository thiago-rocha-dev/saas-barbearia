// Dashboard Types - Role-Based Access Control & Data Structures

// User Roles
export type UserRole = 'admin' | 'barber' | 'customer';

// User interface with role
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  isActive: boolean;
}

// Dashboard KPI Card
export interface DashboardKPI {
  id: string;
  title: string;
  value: number | string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: 'gold' | 'cyan' | 'purple' | 'green' | 'red';
  format: 'currency' | 'number' | 'percentage';
}

// Appointment Status
export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

// Services
export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  description?: string;
}

// Appointment
export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  clientAvatar?: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  date: Date;
  datetime: Date;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Barber
export interface Barber {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  specialties: string[];
  rating: number;
  totalAppointments: number;
  isActive: boolean;
  workingHours: {
    [key: string]: { start: string; end: string; };
  };
  createdAt: Date;
}

// Customer
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  totalAppointments: number;
  totalSpent: number;
  loyaltyPoints: number;
  preferredBarber?: string;
  lastVisit?: Date;
  isActive: boolean;
  createdAt: Date;
}

// Chart Data Point
export interface ChartDataPoint {
  date: Date;
  value: number;
  label?: string;
}

// Chart Data
export interface ChartData {
  title: string;
  dataPoints: ChartDataPoint[];
}

// Legacy Chart Data (for compatibility)
export interface LegacyChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// Timeline Event
export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  datetime: Date;
  time: string;
  type: 'appointment' | 'break' | 'meeting' | 'other';
  status: 'upcoming' | 'current' | 'completed' | 'cancelled' | 'pending' | 'confirmed';
  duration?: number;
  clientName?: string;
  serviceName?: string;
}

// Quick Action
export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: 'gold' | 'cyan' | 'purple' | 'green' | 'red';
  action: () => void;
  disabled?: boolean;
  featured?: boolean;
}

// Data Table Column
export interface DataTableColumn<T = any> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

// Data Table Props
export interface DataTableProps<T = any> {
  data: T[];
  columns: DataTableColumn<T>[];
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  sortable?: boolean;
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  loading?: boolean;
}

// Sidebar Menu Item
export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string | null;
  children?: SidebarMenuItem[];
  roles?: UserRole[];
}

// Dashboard Stats (for different roles)
export interface AdminStats {
  totalRevenue: number;
  totalAppointments: number;
  activeBarbers: number;
  averageRating: number;
  monthlyGrowth: number;
}

export interface BarberStats {
  todayAppointments: number;
  personalRevenue: number;
  averageRating: number;
  completedServices: number;
  monthlyGrowth: number;
}

export interface CustomerStats {
  totalVisits: number;
  loyaltyPoints: number;
  favoriteBarber: string;
  nextAppointment: Date;
  averageRating: number;
}

// Loading State
export interface LoadingState {
  kpis: boolean;
  appointments: boolean;
  charts: boolean;
  timeline: boolean;
  quickActions: boolean;
}

// Dashboard Data
export interface DashboardData {
  kpis: DashboardKPI[];
  appointments: Appointment[];
  chartData: LegacyChartData;
  timelineEvents: TimelineEvent[];
  quickActions: QuickAction[];
  stats: AdminStats | BarberStats | CustomerStats;
  loading: LoadingState;
}

// Filter Options
export interface FilterOptions {
  dateRange: {
    start: Date;
    end: Date;
  };
  status?: AppointmentStatus[];
  barberId?: string;
  serviceId?: string;
}

// Permission system
export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  roles: UserRole[];
}

export type RolePermissions = {
  [K in UserRole]: Permission[];
};