import React, { useState } from 'react';
import KPICard from '../../components/dashboard/KPICard';
import DataTable from '../../components/dashboard/DataTable';
import Chart from '../../components/dashboard/Chart';
import QuickActions from '../../components/dashboard/QuickActions';
import AppointmentCalendar from '../../components/appointments/AppointmentCalendar';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import AdminUserManagement from '../../components/dashboard/AdminUserManagement';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useAppointments } from '../../hooks/useAppointments';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { DataTableColumn } from '../../types/dashboard';
import type { Appointment } from '../../types/appointments';

const DashboardAdmin: React.FC = () => {
  const { kpis, appointments, barbers, chartData, quickActions, loading, refreshData } = useDashboardData('admin');
  const { 
    appointments: realAppointments, 
    loading: appointmentsLoading 
  } = useAppointments();
  
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'appointments' | 'users'>('overview');

  // Handle appointment actions
  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setShowAppointmentForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentForm(true);
  };



  // Removed unused handleAppointmentSubmit function

  // Define columns for appointments table
  const appointmentColumns: DataTableColumn[] = [
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
        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-sm">
          {value}
        </span>
      )
    },
    {
      key: 'datetime',
      header: 'Data/Hora',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        return (
          <div className="flex flex-col">
            <span className="text-white">{date.toLocaleDateString('pt-BR')}</span>
            <span className="text-sm text-gray-400">{date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
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
          confirmed: 'bg-blue-500/20 text-blue-300',
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
      key: 'price',
      header: 'Valor',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-green-400">
          R$ {value.toFixed(2)}
        </span>
      )
    }
  ];

  // Define columns for barbers table
  const barberColumns: DataTableColumn[] = [
    {
      key: 'name',
      header: 'Barbeiro',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">
              {value.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-white">{value}</span>
            <span className="text-sm text-gray-400">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'specialties',
      header: 'Especialidades',
      sortable: false,
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((specialty: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-md text-xs">
              {specialty}
            </span>
          ))}
          {value.length > 2 && (
            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-md text-xs">
              +{value.length - 2}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'rating',
      header: 'Avaliação',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <span className="text-yellow-400">★</span>
          <span className="text-white font-medium">{value.toFixed(1)}</span>
        </div>
      )
    },
    {
      key: 'totalAppointments',
      header: 'Atendimentos',
      sortable: true,
      render: (value) => (
        <span className="text-white font-medium">{value}</span>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className={value ? 'text-green-400' : 'text-red-400'}>
            {value ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      )
    }
  ];

  if (loading.kpis && loading.appointments && loading.charts) {
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
            Dashboard Administrativo
          </h1>
          <p className="text-gray-400">
            Visão geral completa da sua barbearia
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCreateAppointment}
            className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-all duration-200 border border-yellow-500/30 hover:border-yellow-500/50 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Novo Agendamento</span>
          </button>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-all duration-200 border border-yellow-500/30 hover:border-yellow-500/50"
          >
            Atualizar Dados
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white/5 backdrop-blur-lg rounded-lg p-1">
        {[
          { id: 'overview', label: 'Visão Geral', icon: 'chart-bar' },
          { id: 'calendar', label: 'Calendário', icon: 'calendar' },
          { id: 'appointments', label: 'Agendamentos', icon: 'clock' },
          { id: 'users', label: 'Usuários', icon: 'users' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-yellow-500/20 text-yellow-300'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
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
              {tab.icon === 'users' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
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

          {/* Charts and Quick Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Agendamentos & Receita
                  </h2>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-md text-sm">
                      30 dias
                    </button>
                    <button className="px-3 py-1 text-gray-400 hover:text-white rounded-md text-sm">
                      90 dias
                    </button>
                  </div>
                </div>
                {loading.charts ? (
                  <div className="h-64 bg-white/5 rounded-lg animate-pulse" />
                ) : (
                  <Chart
                    data={chartData}
                    type="line"
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

          {/* Data Tables Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Recent Appointments */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Últimos Agendamentos
                </h2>
                <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
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
                  columns={appointmentColumns}
                  searchable={false}
                  pagination={false}
                  className="max-h-80"
                />
              )}
            </div>

            {/* Barbers Management */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Equipe de Barbeiros
                </h2>
                <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
                  Gerenciar
                </button>
              </div>
              {loading.appointments ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-20 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <DataTable
                  data={barbers}
                  columns={barberColumns}
                  searchable={false}
                  pagination={false}
                  className="max-h-80"
                />
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Métricas de Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">94%</div>
                <div className="text-gray-400">Taxa de Ocupação</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">4.8</div>
                <div className="text-gray-400">Avaliação Média</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">12%</div>
                <div className="text-gray-400">Crescimento Mensal</div>
              </div>
            </div>
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
              role="admin"
            />
          )}
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Todos os Agendamentos</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">{realAppointments.length} total</span>
              <button 
                onClick={handleCreateAppointment}
                className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-md text-sm transition-colors"
              >
                Novo Agendamento
              </button>
            </div>
          </div>
          {appointmentsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="h-16 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <DataTable 
              data={realAppointments} 
              columns={appointmentColumns}
              searchable
              pagination
              pageSize={10}
              emptyMessage="Nenhum agendamento encontrado"
            />
          )}
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <AdminUserManagement />
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
          role="admin"
        />
      )}
    </div>
  );
};

export default DashboardAdmin;