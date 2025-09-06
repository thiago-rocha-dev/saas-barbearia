import React, { useState } from 'react';
import KPICard from '../../components/dashboard/KPICard';
import Timeline from '../../components/dashboard/Timeline';
import DataTable from '../../components/dashboard/DataTable';
import QuickActions from '../../components/dashboard/QuickActions';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useAppointments } from '../../hooks/useAppointments';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import AppointmentCalendar from '../../components/appointments/AppointmentCalendar';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import { BarberProfile } from '../../components/barber/BarberProfile';
import { BarberStats } from '../../components/barber/BarberStats';
import { BarberSchedule } from '../../components/barber/BarberSchedule';
import { BarberServices } from '../../components/barber/BarberServices';
import type { DataTableColumn } from '../../types/dashboard';
import type { Appointment } from '../../types/appointments';

const DashboardBarber: React.FC = () => {
  const { kpis, appointments, timeline, quickActions, loading, refreshData } = useDashboardData('barber');

  const {
    appointments: realAppointments,
    loading: appointmentsLoading
  } = useAppointments();

  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'appointments' | 'profile' | 'services' | 'stats' | 'schedule'>('overview');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setShowAppointmentForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentForm(true);
  };



  // Removed unused handleAppointmentSubmit function

  // Define columns for upcoming appointments table
  const upcomingColumns: DataTableColumn[] = [
    {
      key: 'clientName',
      header: 'Cliente',
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-white">{value}</span>
          <span className="text-sm text-gray-400">{row.customerPhone}</span>
        </div>
      )
    },
    {
      key: 'service',
      header: 'Serviço',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-md text-sm">
          {value}
        </span>
      )
    },
    {
      key: 'datetime',
      header: 'Horário',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        return (
          <div className="flex flex-col">
            <span className="text-white font-medium">
              {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-sm text-gray-400">
              {date.toLocaleDateString('pt-BR')}
            </span>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => {
        const statusColors = {
          pending: 'bg-yellow-500/20 text-yellow-300',
          confirmed: 'bg-cyan-500/20 text-cyan-300',
          completed: 'bg-green-500/20 text-green-300',
          cancelled: 'bg-red-500/20 text-red-300'
        };
        const statusLabels = {
          pending: 'Pendente',
          confirmed: 'Confirmado',
          completed: 'Concluído',
          cancelled: 'Cancelado'
        };
        return (
          <span className={`px-2 py-1 rounded-md text-sm ${statusColors[value as keyof typeof statusColors]}`}>
            {statusLabels[value as keyof typeof statusLabels]}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Ações',
      sortable: false,
      render: (_, row) => (
        <div className="flex space-x-2">
          {row.status === 'confirmed' && (
            <button className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded text-xs transition-colors">
              Check-in
            </button>
          )}
          {row.status === 'pending' && (
            <button className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded text-xs transition-colors">
              Confirmar
            </button>
          )}
          <button className="px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded text-xs transition-colors">
            Reagendar
          </button>
        </div>
      )
    }
  ];

  // Define columns for recent appointments
  const recentColumns: DataTableColumn[] = [
    {
      key: 'clientName',
      header: 'Cliente',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-white">{value}</span>
      )
    },
    {
      key: 'service',
      header: 'Serviço',
      sortable: true,
      render: (value) => (
        <span className="text-gray-300">{value}</span>
      )
    },
    {
      key: 'datetime',
      header: 'Data',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        return (
          <span className="text-gray-400">
            {date.toLocaleDateString('pt-BR')}
          </span>
        );
      }
    },
    {
      key: 'price',
      header: 'Valor',
      sortable: true,
      render: (value) => (
        <span className="text-green-400 font-medium">
          R$ {value.toFixed(2)}
        </span>
      )
    },
    {
      key: 'rating',
      header: 'Avaliação',
      sortable: true,
      render: (value) => (
        value ? (
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">★</span>
            <span className="text-white">{value}</span>
          </div>
        ) : (
          <span className="text-gray-500">-</span>
        )
      )
    }
  ];

  if (loading.kpis && loading.appointments && loading.timeline) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Carregando dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 glass-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Olá, Carlos! 👋
          </h1>
          <p className="text-gray-400">
            Você tem {appointments.filter(apt => apt.status === 'confirmed').length} atendimentos confirmados hoje
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCreateAppointment}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-all duration-200 border border-cyan-500/30 hover:border-cyan-500/50 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Novo Agendamento</span>
          </button>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-all duration-200 border border-cyan-500/30 hover:border-cyan-500/50"
          >
            Atualizar
          </button>
          <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-all duration-200 border border-green-500/30 hover:border-green-500/50">
            Marcar Disponibilidade
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white/5 backdrop-blur-sm rounded-lg p-1 overflow-x-auto">
        {[
          { id: 'overview', label: 'Visão Geral', icon: 'chart-bar' },
          { id: 'calendar', label: 'Calendário', icon: 'calendar' },
          { id: 'appointments', label: 'Agendamentos', icon: 'clock' },
          { id: 'schedule', label: 'Agenda', icon: 'schedule' },
          { id: 'stats', label: 'Estatísticas', icon: 'stats' },
          { id: 'services', label: 'Serviços', icon: 'services' },
          { id: 'profile', label: 'Perfil', icon: 'user' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-shrink-0 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {tab.icon === 'chart-bar' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              )}
              {tab.icon === 'calendar' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              )}
              {tab.icon === 'clock' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
              {tab.icon === 'schedule' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              )}
              {tab.icon === 'stats' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              )}
              {tab.icon === 'services' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              )}
              {tab.icon === 'user' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              )}
            </svg>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading.kpis ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-32 bg-white/5 rounded-xl animate-pulse" />
              ))
            ) : (
              kpis.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'calendar' && (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <AppointmentCalendar
            onSelectEvent={(event) => {
              if (event.resource) {
                handleEditAppointment(event.resource);
              }
            }}
            onSelectSlot={() => {
              handleCreateAppointment();
            }}
            role="barber"
          />
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Todos os Agendamentos
            </h2>
            <button
              onClick={handleCreateAppointment}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-colors"
            >
              Novo Agendamento
            </button>
          </div>
          {appointmentsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-16 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <DataTable
              data={realAppointments}
              columns={upcomingColumns}
              searchable={true}
              pagination={true}
            />
          )}
        </div>
      )}

      {activeTab === 'schedule' && (
        <BarberSchedule />
      )}

      {activeTab === 'stats' && (
        <BarberStats />
      )}

      {activeTab === 'services' && (
        <BarberServices />
      )}

      {activeTab === 'profile' && (
        <BarberProfile />
      )}

      {activeTab === 'overview' && (
        <>
          {/* KPI Cards - Already rendered above */}

      {/* Timeline and Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Timeline do Dia
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-green-400">Ao vivo</span>
              </div>
            </div>
            {loading.timeline ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <Timeline events={timeline} variant="default" />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Ações Rápidas
            </h2>
            {loading.quickActions ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <QuickActions actions={quickActions} variant="compact" />
            )}
          </div>
        </div>
      </div>

      {/* Appointments Tables Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Próximos Clientes
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {appointments.filter(apt => apt.status !== 'completed').length} pendentes
              </span>
            </div>
          </div>
          {loading.appointments ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <DataTable
              data={appointments.filter(apt => apt.status !== 'completed')}
              columns={upcomingColumns}
              searchable={false}
              pagination={false}
              className="max-h-80"
            />
          )}
        </div>

        {/* Recent Completed */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Atendimentos Recentes
            </h2>
            <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
              Ver histórico
            </button>
          </div>
          {loading.appointments ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <DataTable
              data={appointments.filter(apt => apt.status === 'completed').slice(0, 5)}
              columns={recentColumns}
              searchable={false}
              pagination={false}
              className="max-h-80"
            />
          )}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">
          Resumo de Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-2">8</div>
            <div className="text-gray-400 text-sm">Atendimentos Hoje</div>
            <div className="text-green-400 text-xs mt-1">+2 vs ontem</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">R$ 320</div>
            <div className="text-gray-400 text-sm">Receita do Dia</div>
            <div className="text-green-400 text-xs mt-1">+15% vs ontem</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">4.9</div>
            <div className="text-gray-400 text-sm">Avaliação Média</div>
            <div className="text-green-400 text-xs mt-1">+0.1 vs semana</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">95%</div>
            <div className="text-gray-400 text-sm">Taxa de Ocupação</div>
            <div className="text-green-400 text-xs mt-1">+5% vs semana</div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900/95 backdrop-blur-lg rounded-xl border border-white/10 p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {selectedAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h3>
              <button
                onClick={() => setShowAppointmentForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AppointmentForm
              isOpen={showAppointmentForm}
              onClose={() => setShowAppointmentForm(false)}
              appointment={selectedAppointment}
              role="barber"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBarber;