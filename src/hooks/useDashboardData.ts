import { useState, useEffect } from 'react';
import { useAppointments } from './useAppointments';
import type {
  DashboardKPI,
  Appointment,
  Barber,
  Customer,
  LegacyChartData,
  TimelineEvent,
  QuickAction,
  AdminStats,
  BarberStats,
  CustomerStats,
  UserRole,
  LoadingState
} from '../types/dashboard';

// Mock data generators
const generateMockKPIs = (role: UserRole): DashboardKPI[] => {
  const baseKPIs = {
    admin: [
      {
        id: 'total-appointments',
        title: 'Total Agendamentos',
        value: 156,
        change: 12.5,
        changeType: 'increase' as const,
        icon: 'calendar',
        color: 'gold' as const,
        format: 'number' as const
      },
      {
        id: 'revenue',
        title: 'Receita Mensal',
        value: 12450,
        change: 8.3,
        changeType: 'increase' as const,
        icon: 'currency-dollar',
        color: 'gold' as const,
        format: 'currency' as const
      },
      {
        id: 'active-barbers',
        title: 'Barbeiros Ativos',
        value: 8,
        change: 0,
        changeType: 'neutral' as const,
        icon: 'users',
        color: 'cyan' as const,
        format: 'number' as const
      },
      {
        id: 'satisfaction',
        title: 'Taxa Satisfação',
        value: 4.8,
        change: 2.1,
        changeType: 'increase' as const,
        icon: 'star',
        color: 'purple' as const,
        format: 'number' as const
      }
    ],
    barber: [
      {
        id: 'today-appointments',
        title: 'Atendimentos Hoje',
        value: 8,
        change: 14.3,
        changeType: 'increase' as const,
        icon: 'calendar-days',
        color: 'cyan' as const,
        format: 'number' as const
      },
      {
        id: 'personal-revenue',
        title: 'Receita Pessoal',
        value: 1850,
        change: 6.7,
        changeType: 'increase' as const,
        icon: 'banknotes',
        color: 'cyan' as const,
        format: 'currency' as const
      },
      {
        id: 'average-rating',
        title: 'Avaliação Média',
        value: 4.9,
        change: 1.2,
        changeType: 'increase' as const,
        icon: 'star',
        color: 'purple' as const,
        format: 'number' as const
      },
      {
        id: 'completed-services',
        title: 'Serviços Concluídos',
        value: 142,
        change: 9.8,
        changeType: 'increase' as const,
        icon: 'check-circle',
        color: 'cyan' as const,
        format: 'number' as const
      }
    ],
    customer: [
      {
        id: 'total-visits',
        title: 'Total de Visitas',
        value: 23,
        change: 4.3,
        changeType: 'increase' as const,
        icon: 'calendar',
        color: 'purple' as const,
        format: 'number' as const
      },
      {
        id: 'loyalty-points',
        title: 'Pontos Fidelidade',
        value: 340,
        change: 15.2,
        changeType: 'increase' as const,
        icon: 'gift',
        color: 'purple' as const,
        format: 'number' as const
      },
      {
        id: 'favorite-barber',
        title: 'Barbeiro Favorito',
        value: 1,
        change: 0,
        changeType: 'neutral' as const,
        icon: 'heart',
        color: 'purple' as const,
        format: 'number' as const
      },
      {
        id: 'next-appointment',
        title: 'Próximo Agendamento',
        value: 2,
        change: 0,
        changeType: 'neutral' as const,
        icon: 'clock',
        color: 'purple' as const,
        format: 'number' as const
      }
    ]
  };

  return baseKPIs[role] || [];
};


const generateMockBarbers = (): Barber[] => [
  {
    id: 'barber-1',
    name: 'Carlos Mendes',
    email: 'carlos@barbearia.com',
    phone: '(11) 99999-0001',
    specialties: ['Corte Clássico', 'Barba', 'Bigode'],
    rating: 4.9,
    isActive: true,
    totalAppointments: 142,
    workingHours: {
      monday: { start: '08:00', end: '18:00' },
      tuesday: { start: '08:00', end: '18:00' },
      wednesday: { start: '08:00', end: '18:00' },
      thursday: { start: '08:00', end: '18:00' },
      friday: { start: '08:00', end: '18:00' },
      saturday: { start: '08:00', end: '16:00' }
    },
    createdAt: new Date('2023-01-15')
  },
  {
    id: 'barber-2',
    name: 'Roberto Silva',
    email: 'roberto@barbearia.com',
    phone: '(11) 99999-0002',
    specialties: ['Corte Moderno', 'Degradê', 'Sobrancelha'],
    rating: 4.7,
    isActive: true,
    totalAppointments: 98,
    workingHours: {
      monday: { start: '09:00', end: '19:00' },
      tuesday: { start: '09:00', end: '19:00' },
      wednesday: { start: '09:00', end: '19:00' },
      thursday: { start: '09:00', end: '19:00' },
      friday: { start: '09:00', end: '19:00' },
      saturday: { start: '09:00', end: '17:00' }
    },
    createdAt: new Date('2023-02-20')
  },
  {
    id: 'barber-3',
    name: 'Anderson Costa',
    email: 'anderson@barbearia.com',
    phone: '(11) 99999-0003',
    specialties: ['Corte Infantil', 'Barba', 'Tratamentos'],
    rating: 4.8,
    isActive: false,
    totalAppointments: 76,
    workingHours: {
      monday: { start: '10:00', end: '18:00' },
      tuesday: { start: '10:00', end: '18:00' },
      wednesday: { start: '10:00', end: '18:00' },
      thursday: { start: '10:00', end: '18:00' },
      friday: { start: '10:00', end: '18:00' }
    },
    createdAt: new Date('2023-03-10')
  }
];

const generateMockCustomers = (): Customer[] => [
  {
    id: 'customer-1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-1111',
    totalAppointments: 23,
    totalSpent: 1150,
    loyaltyPoints: 340,
    preferredBarber: 'barber-1',
    lastVisit: new Date('2024-01-10T10:00:00'),
    isActive: true,
    createdAt: new Date('2023-06-15')
  },
  {
    id: 'customer-2',
    name: 'Pedro Santos',
    email: 'pedro@email.com',
    phone: '(11) 99999-2222',
    totalAppointments: 15,
    totalSpent: 750,
    loyaltyPoints: 180,
    preferredBarber: 'barber-2',
    lastVisit: new Date('2024-01-08T14:30:00'),
    isActive: true,
    createdAt: new Date('2023-08-20')
  }
];

const generateMockChartData = (role: UserRole): LegacyChartData => {
  const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  
  const datasets = {
    admin: [
      {
        label: 'Agendamentos',
        data: [120, 135, 148, 142, 156, 168],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)'
      },
      {
        label: 'Receita (R$)',
        data: [8500, 9200, 10100, 9800, 12450, 13200],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)'
      }
    ],
    barber: [
      {
        label: 'Meus Atendimentos',
        data: [28, 32, 35, 31, 38, 42],
        borderColor: '#00F5FF',
        backgroundColor: 'rgba(0, 245, 255, 0.1)'
      },
      {
        label: 'Receita Pessoal (R$)',
        data: [1200, 1350, 1480, 1320, 1850, 2100],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)'
      }
    ],
    customer: [
      {
        label: 'Minhas Visitas',
        data: [2, 3, 4, 3, 5, 6],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)'
      },
      {
        label: 'Pontos Ganhos',
        data: [20, 35, 45, 30, 60, 75],
        borderColor: '#EC4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)'
      }
    ]
  };

  return {
    labels,
    datasets: datasets[role] || []
  };
};

const generateMockTimeline = (role: UserRole): TimelineEvent[] => {
  const events = {
    admin: [
      {
        id: '1',
        title: 'Novo barbeiro contratado',
        description: 'Anderson Costa foi adicionado à equipe',
        date: new Date('2024-01-15T09:00:00'),
        time: '09:00',
        datetime: new Date('2024-01-15T09:00:00'),
        status: 'completed' as const,
        type: 'other' as const
      },
      {
        id: '2',
        title: 'Relatório mensal gerado',
        description: 'Relatório de dezembro disponível',
        date: new Date('2024-01-15T10:30:00'),
        time: '10:30',
        datetime: new Date('2024-01-15T10:30:00'),
        status: 'completed' as const,
        type: 'other' as const
      }
    ],
    barber: [
      {
        id: '1',
        title: 'João Silva - Corte + Barba',
        description: 'Cliente preferencial, corte baixo nas laterais',
        date: new Date('2024-01-15T10:00:00'),
        time: '10:00',
        datetime: new Date('2024-01-15T10:00:00'),
        status: 'confirmed' as const,
        type: 'appointment' as const
      },
      {
        id: '2',
        title: 'Carlos Oliveira - Barba',
        description: 'Barba completa com finalização',
        date: new Date('2024-01-15T14:00:00'),
        time: '14:00',
        datetime: new Date('2024-01-15T14:00:00'),
        status: 'pending' as const,
        type: 'appointment' as const
      }
    ],
    customer: [
      {
        id: '1',
        title: 'Próximo agendamento',
        description: 'Corte + Barba com Carlos Mendes',
        date: new Date('2024-01-20T10:00:00'),
        time: '10:00',
        datetime: new Date('2024-01-20T10:00:00'),
        status: 'confirmed' as const,
        type: 'appointment' as const
      },
      {
        id: '2',
        title: 'Último atendimento',
        description: 'Corte simples - Avaliação: 5 estrelas',
        date: new Date('2024-01-10T10:00:00'),
        time: '10:00',
        datetime: new Date('2024-01-10T10:00:00'),
        status: 'completed' as const,
        type: 'appointment' as const
      }
    ]
  };

  return events[role] || [];
};

const generateMockQuickActions = (role: UserRole): QuickAction[] => {
  const actions = {
    admin: [
      {
        id: 'new-barber',
        label: 'Novo Barbeiro',
        description: 'Adicionar barbeiro à equipe',
        icon: 'user-plus',
        color: 'gold' as const,
        action: () => console.log('Novo barbeiro')
      },
      {
        id: 'view-reports',
        label: 'Ver Relatórios',
        description: 'Acessar relatórios detalhados',
        icon: 'chart-bar',
        color: 'cyan' as const,
        action: () => console.log('Ver relatórios')
      },
      {
        id: 'settings',
        label: 'Configurações',
        description: 'Gerenciar configurações do sistema',
        icon: 'cog-6-tooth',
        color: 'purple' as const,
        action: () => console.log('Configurações')
      }
    ],
    barber: [
      {
        id: 'check-in',
        label: 'Check-in Cliente',
        description: 'Confirmar chegada do cliente',
        icon: 'check-circle',
        color: 'cyan' as const,
        action: () => console.log('Check-in')
      },
      {
        id: 'reschedule',
        label: 'Reagendar',
        description: 'Reagendar atendimento',
        icon: 'calendar',
        color: 'cyan' as const,
        action: () => console.log('Reagendar')
      },
      {
        id: 'finish-service',
        label: 'Finalizar Serviço',
        description: 'Concluir atendimento atual',
        icon: 'check-badge',
        color: 'purple' as const,
        action: () => console.log('Finalizar')
      }
    ],
    customer: [
      {
        id: 'new-appointment',
        label: 'Novo Agendamento',
        description: 'Agendar próximo atendimento',
        icon: 'plus-circle',
        color: 'purple' as const,
        action: () => console.log('Novo agendamento')
      },
      {
        id: 'view-history',
        label: 'Ver Histórico',
        description: 'Consultar atendimentos anteriores',
        icon: 'clock',
        color: 'purple' as const,
        action: () => console.log('Ver histórico')
      },
      {
        id: 'rate-service',
        label: 'Avaliar Serviço',
        description: 'Avaliar último atendimento',
        icon: 'star',
        color: 'purple' as const,
        action: () => console.log('Avaliar')
      }
    ]
  };

  return actions[role] || [];
};

// Dashboard data return type
interface DashboardData {
  kpis: DashboardKPI[];
  appointments: Appointment[];
  barbers: Barber[];
  customers: Customer[];
  chartData: LegacyChartData;
  timeline: TimelineEvent[];
  quickActions: QuickAction[];
  stats: AdminStats | BarberStats | CustomerStats | null;
  loading: LoadingState;
  refreshData: () => void;
}

// Main hook
export const useDashboardData = (role: UserRole): DashboardData => {
  const { appointments: realAppointments, loading: appointmentsLoading, fetchAppointments } = useAppointments();
  
  const [loading, setLoading] = useState<LoadingState>({
    kpis: true,
    appointments: appointmentsLoading,
    charts: true,
    timeline: true,
    quickActions: true
  });

  const [data, setData] = useState<{
    kpis: DashboardKPI[];
    appointments: Appointment[];
    barbers: Barber[];
    customers: Customer[];
    chartData: LegacyChartData;
    timeline: TimelineEvent[];
    quickActions: QuickAction[];
  }>({
    kpis: [],
    appointments: [],
    barbers: [],
    customers: [],
    chartData: { labels: [], datasets: [] } as LegacyChartData,
    timeline: [],
    quickActions: []
  });

  const [stats, setStats] = useState<AdminStats | BarberStats | CustomerStats | null>(null);

  useEffect(() => {
    // Load real appointments data and simulate API loading with realistic delays
    const loadData = async () => {
      // Load real appointments data
      await fetchAppointments();
      
      // Load KPIs
      setTimeout(() => {
        setData(prev => ({ ...prev, kpis: generateMockKPIs(role) }));
        setLoading(prev => ({ ...prev, kpis: false }));
      }, 800);

      // Load appointments with real data
      setTimeout(() => {
        const mappedAppointments = realAppointments.map(apt => ({
          id: apt.id,
          customer_id: apt.customer_id || '',
          client_id: apt.customer_id || '',
          barber_id: apt.barber_id || '',
          customer_name: apt.customer_name,
          customer_email: apt.customer_email || '',
          client_name: apt.customer_name,
          barber_name: apt.barber_name || 'Barbeiro não encontrado',
          service_id: apt.service_id || '',
          service_name: apt.service?.name || 'Serviço não encontrado',
          appointment_date: apt.appointment_date,
          appointment_time: apt.appointment_time,
          duration_minutes: apt.service?.duration_minutes || 30,
          status: apt.status,
          total_price: apt.total_price,
          notes: apt.notes || '',
          price: apt.total_price,
          created_at: apt.created_at || new Date().toISOString(),
          updated_at: apt.updated_at || new Date().toISOString()
        }));
        setData(prev => ({ ...prev, appointments: mappedAppointments }));
        setLoading(prev => ({ ...prev, appointments: false }));
      }, 1200);

      // Load charts
      setTimeout(() => {
        setData(prev => ({ ...prev, chartData: generateMockChartData(role) }));
        setLoading(prev => ({ ...prev, charts: false }));
      }, 1500);

      // Load timeline
      setTimeout(() => {
        setData(prev => ({ ...prev, timeline: generateMockTimeline(role) }));
        setLoading(prev => ({ ...prev, timeline: false }));
      }, 1000);

      // Load quick actions
      setTimeout(() => {
        setData(prev => ({ ...prev, quickActions: generateMockQuickActions(role) }));
        setLoading(prev => ({ ...prev, quickActions: false }));
      }, 600);

      // Load additional data based on role
      if (role === 'admin') {
        setTimeout(() => {
          setData(prev => ({ ...prev, barbers: generateMockBarbers() }));
          setStats({
            totalRevenue: realAppointments.reduce((sum, apt) => sum + apt.total_price, 0),
            totalAppointments: realAppointments.length,
            activeBarbers: 8,
            averageRating: 4.8,
            monthlyGrowth: 12.5
          } as AdminStats);
        }, 1800);
      } else if (role === 'barber') {
        setTimeout(() => {
          setStats({
            todayAppointments: 8,
            personalRevenue: 1850,
            averageRating: 4.9,
            completedServices: 142,
            monthlyGrowth: 14.3
          } as BarberStats);
        }, 1400);
      } else if (role === 'customer') {
        setTimeout(() => {
          setData(prev => ({ ...prev, customers: generateMockCustomers() }));
          setStats({
            totalVisits: 23,
            loyaltyPoints: 340,
            favoriteBarber: 'Carlos Mendes',
            nextAppointment: new Date('2024-01-20T10:00:00'),
            averageRating: 4.9
          } as CustomerStats);
        }, 1600);
      }
    };

    loadData();
  }, [role, realAppointments, fetchAppointments]);

  const refreshData = async (): Promise<void> => {
    setLoading({
      kpis: true,
      appointments: true,
      charts: true,
      timeline: true,
      quickActions: true
    });
    
    // Reload real appointments data
    await fetchAppointments();
    
    // Reload other data
    setTimeout(() => {
      const mappedAppointments = realAppointments.map(apt => ({
        id: apt.id,
        customer_id: apt.customer_id || '',
        client_id: apt.customer_id || '',
        barber_id: apt.barber_id || '',
        customer_name: apt.customer_name,
        customer_email: apt.customer_email || '',
        client_name: apt.customer_name,
        barber_name: apt.barber_name || 'Barbeiro não encontrado',
        service_id: apt.service_id || '',
        service_name: apt.service?.name || 'Serviço não encontrado',
        appointment_date: apt.appointment_date,
        appointment_time: apt.appointment_time,
        duration_minutes: apt.service?.duration_minutes || 30,
        status: apt.status,
        total_price: apt.total_price,
        notes: apt.notes || '',
        price: apt.total_price,
        created_at: apt.created_at || new Date().toISOString(),
        updated_at: apt.updated_at || new Date().toISOString()
      }));
      
      setData({
        kpis: generateMockKPIs(role),
        appointments: mappedAppointments,
        barbers: generateMockBarbers(),
        customers: generateMockCustomers(),
        chartData: generateMockChartData(role),
        timeline: generateMockTimeline(role),
        quickActions: generateMockQuickActions(role)
      });
      
      setLoading({
        kpis: false,
        appointments: false,
        charts: false,
        timeline: false,
        quickActions: false
      });
    }, 1000);
  };

  return {
    ...data,
    stats,
    loading,
    refreshData
  };
};

export default useDashboardData;

// TODO: Replace with real API calls when backend is ready
// TODO: Add error handling and retry logic
// TODO: Implement caching strategy for better performance
// TODO: Add real-time updates via WebSocket