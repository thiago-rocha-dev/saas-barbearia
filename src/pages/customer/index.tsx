import React, { useState } from 'react';
import KPICard from '../../components/dashboard/KPICard';
import DataTable from '../../components/dashboard/DataTable';
import Chart from '../../components/dashboard/Chart';
import QuickActions from '../../components/dashboard/QuickActions';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useAppointments } from '../../hooks/useAppointments';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import AppointmentCalendar from '../../components/appointments/AppointmentCalendar';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import type { DataTableColumn } from '../../types/dashboard';
import type { Appointment } from '../../types/appointments';

const DashboardCustomer: React.FC = () => {
  const { kpis, appointments: dashboardAppointments, chartData, quickActions, loading, refreshData } = useDashboardData('customer');
  const [showOnboarding, setShowOnboarding] = useState(dashboardAppointments.length === 0);

  const {
    appointments,
    loading: appointmentsLoading
  } = useAppointments();

  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'appointments'>('overview');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setShowAppointmentForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    // Clientes só podem editar agendamentos até 2h antes
    const appointmentDate = new Date(`${appointment.appointment_date} ${appointment.appointment_time}`);
    const now = new Date();
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    if (hoursDiff < 2) {
      alert('Não é possível editar agendamentos com menos de 2 horas de antecedência.');
      return;
    }
    
    setSelectedAppointment(appointment);
    setShowAppointmentForm(true);
  };



  // Removed unused handleAppointmentSubmit function

  // Calculate next appointment
  const nextAppointment = appointments
    .filter(apt => apt.status === 'confirmed' && new Date(`${apt.appointment_date}T${apt.appointment_time}`) > new Date())
    .sort((a, b) => new Date(`${a.appointment_date}T${a.appointment_time}`).getTime() - new Date(`${b.appointment_date}T${b.appointment_time}`).getTime())[0];

  // Calculate time until next appointment
  const getTimeUntilAppointment = () => {
    if (!nextAppointment) return null;
    
    const now = new Date();
    const appointmentDate = new Date(`${nextAppointment.appointment_date}T${nextAppointment.appointment_time}`);
    const diff = appointmentDate.getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Define columns for appointment history
  const historyColumns: DataTableColumn[] = [
    {
      key: 'datetime',
      header: 'Data',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        return (
          <div className="flex flex-col">
            <span className="text-white font-medium">
              {date.toLocaleDateString('pt-BR')}
            </span>
            <span className="text-sm text-gray-400">
              {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      }
    },
    {
      key: 'service',
      header: 'Serviço',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-sm">
          {value}
        </span>
      )
    },
    {
      key: 'barberId',
      header: 'Barbeiro',
      sortable: true,
      render: (value) => {
        const barberNames = {
          'barber-1': 'Carlos Mendes',
          'barber-2': 'Roberto Silva',
          'barber-3': 'Anderson Costa'
        };
        return (
          <span className="text-white">
            {barberNames[value as keyof typeof barberNames] || 'N/A'}
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
      render: (value, row) => (
        value ? (
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">★</span>
            <span className="text-white">{value}</span>
          </div>
        ) : (
          row.status === 'completed' ? (
            <button className="text-purple-400 hover:text-purple-300 text-sm">
              Avaliar
            </button>
          ) : (
            <span className="text-gray-500">-</span>
          )
        )
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => {
        const statusColors = {
          pending: 'bg-yellow-500/20 text-yellow-300',
          confirmed: 'bg-purple-500/20 text-purple-300',
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
    }
  ];

  if (loading.kpis && loading.appointments) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Carregando dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 glass-fade-in">
      {/* Onboarding Tooltip */}
      {showOnboarding && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6 relative">
          <button
            onClick={() => setShowOnboarding(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            ✕
          </button>
          <div className="flex items-center space-x-4">
            <div className="text-4xl">👋</div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Bem-vindo à nossa barbearia!
              </h3>
              <p className="text-gray-300 mb-4">
                Agende seu primeiro corte e descubra a experiência premium que preparamos para você.
              </p>
              <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
                Agendar Primeiro Corte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Olá, João! 👨‍💼
          </h1>
          <p className="text-gray-400">
            {nextAppointment 
              ? `Seu próximo atendimento é em ${getTimeUntilAppointment()}`
              : 'Que tal agendar seu próximo atendimento?'
            }
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleCreateAppointment}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all duration-200 border border-purple-500/30 hover:border-purple-500/50 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Agendar Serviço</span>
          </button>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all duration-200 border border-purple-500/30 hover:border-purple-500/50"
          >
            Atualizar
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm rounded-lg p-1">
        {[
          { id: 'overview', label: 'Visão Geral', icon: 'chart-bar' },
          { id: 'calendar', label: 'Calendário', icon: 'calendar' },
          { id: 'appointments', label: 'Meus Agendamentos', icon: 'clock' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-purple-500/20 text-purple-300'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
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
            </svg>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Next Appointment Highlight */}
      {nextAppointment && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">✂️</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  Próximo Agendamento
                </h3>
                <p className="text-purple-300 mb-1">
                  {nextAppointment.service_name} • {nextAppointment.barber_name}
                </p>
                <p className="text-gray-400">
                  {new Date(`${nextAppointment.appointment_date}T${nextAppointment.appointment_time}`).toLocaleDateString('pt-BR')} às {' '}
                  {new Date(`${nextAppointment.appointment_date}T${nextAppointment.appointment_time}`).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {getTimeUntilAppointment()}
              </div>
              <div className="text-sm text-gray-400 mb-3">restantes</div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded text-sm transition-colors">
                  Reagendar
                </button>
                <button className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-sm transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Main CTA and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main CTA */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-xl border border-purple-500/20 p-8 text-center">
            <div className="text-6xl mb-4">✂️</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Pronto para o próximo visual?
            </h2>
            <p className="text-gray-300 mb-6">
              Agende seu atendimento com nossos barbeiros especializados e transforme seu estilo.
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
              🗓️ Novo Agendamento
            </button>
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

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Favorite Barber */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">CM</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Barbeiro Favorito
              </h3>
              <p className="text-purple-300">Carlos Mendes</p>
              <div className="flex items-center space-x-1 mt-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm text-gray-400">4.9 • 12 atendimentos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loyalty Points */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎁</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Pontos Fidelidade
              </h3>
              <p className="text-yellow-300 font-bold text-xl">340 pontos</p>
              <p className="text-sm text-gray-400">160 pontos para desconto</p>
            </div>
          </div>
        </div>

        {/* Last Visit */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Última Visita
              </h3>
              <p className="text-green-300">10 de Janeiro</p>
              <p className="text-sm text-gray-400">Corte + Barba • ★ 5.0</p>
            </div>
          </div>
        </div>
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

            {/* Next Appointment Card */}
            {nextAppointment && (
              <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Próximo Agendamento
                    </h3>
                    <div className="space-y-1">
                      <p className="text-purple-300">
                        <span className="font-medium">{nextAppointment.service_name}</span> com {nextAppointment.barber_name}
                      </p>
                      <p className="text-purple-400 text-sm">
                        {nextAppointment.appointment_date} às {nextAppointment.appointment_time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-300 mb-1">
                      R$ {nextAppointment.price?.toFixed(2) || '0.00'}
                    </div>
                    <button className="px-4 py-2 bg-purple-500/30 hover:bg-purple-500/40 text-white rounded-lg text-sm transition-colors">
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Charts and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart */}
              <div className="lg:col-span-2">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      Gastos Mensais
                    </h2>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-md text-sm">
                        6 meses
                      </button>
                      <button className="px-3 py-1 text-gray-400 hover:text-white rounded-md text-sm">
                        1 ano
                      </button>
                    </div>
                  </div>
                  {loading.charts ? (
                    <div className="h-64 bg-white/5 rounded-lg animate-pulse" />
                  ) : (
                    <Chart
                      data={chartData}
                      type="bar"
                      height={300}
                      showGrid={true}
                      showTooltip={true}
                    />
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

            {/* Appointment History */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Histórico Recente
                </h2>
                <button 
                  onClick={() => setActiveTab('appointments')}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  Ver todos
                </button>
              </div>
              {loading.appointments ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <DataTable
                  data={appointments.slice(0, 5)}
                  columns={historyColumns}
                  searchable={false}
                  pagination={false}
                  className="max-h-80"
                />
              )}
            </div>
          </>
        )}

      {activeTab === 'calendar' && (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Calendário de Agendamentos</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Confirmado</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Pendente</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Concluído</span>
                </div>
              </div>
            </div>
            {appointmentsLoading ? (
              <div className="h-96 bg-white/5 rounded-lg animate-pulse" />
            ) : (
              <AppointmentCalendar
                onSelectEvent={(event) => {
                  if (event.resource) {
                    handleEditAppointment(event.resource);
                  }
                }}
                onSelectSlot={() => {
                  handleCreateAppointment();
                }}
                role="customer"
              />
            )}
          </div>
        )}

      {activeTab === 'appointments' && (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Meus Agendamentos
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">{appointments.length} total</span>
                <button 
                  onClick={handleCreateAppointment}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Novo Agendamento</span>
                </button>
              </div>
            </div>
            {appointmentsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <DataTable
                data={appointments}
                columns={historyColumns}
                searchable={true}
                pagination={true}
                pageSize={10}
                emptyMessage="Nenhum agendamento encontrado"
              />
            )}
          </div>
        )}

      {/* Appointment Form Modal */}
        {showAppointmentForm && (
          <AppointmentForm
            isOpen={showAppointmentForm}
            onClose={() => {
              setShowAppointmentForm(false);
              setSelectedAppointment(null);
            }}
            appointment={selectedAppointment}
            role="customer"
          />
        )}
    </div>
  );
};

export default DashboardCustomer;