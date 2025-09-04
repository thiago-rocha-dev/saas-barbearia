import React, { useState } from 'react';
import KPICard from '../../components/dashboard/KPICard';
import DataTable from '../../components/dashboard/DataTable';
import QuickActions from '../../components/dashboard/QuickActions';
import { useDashboardData } from '../../hooks/useDashboardData';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { DataTableColumn } from '../../types/dashboard';

const DashboardCustomer: React.FC = () => {
  const { kpis, appointments, quickActions, loading, refreshData } = useDashboardData('customer');
  const [showOnboarding, setShowOnboarding] = useState(appointments.length === 0);

  // Calculate next appointment
  const nextAppointment = appointments
    .filter(apt => apt.status === 'confirmed' && new Date(apt.datetime) > new Date())
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())[0];

  // Calculate time until next appointment
  const getTimeUntilAppointment = () => {
    if (!nextAppointment) return null;
    
    const now = new Date();
    const appointmentDate = new Date(nextAppointment.datetime);
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
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all duration-200 border border-purple-500/30 hover:border-purple-500/50"
        >
          Atualizar
        </button>
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
                  {nextAppointment.service} • Carlos Mendes
                </p>
                <p className="text-gray-400">
                  {new Date(nextAppointment.datetime).toLocaleDateString('pt-BR')} às {' '}
                  {new Date(nextAppointment.datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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

      {/* Appointment History */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Histórico de Atendimentos
          </h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-md text-sm">
              Todos
            </button>
            <button className="px-3 py-1 text-gray-400 hover:text-white rounded-md text-sm">
              Concluídos
            </button>
            <button className="px-3 py-1 text-gray-400 hover:text-white rounded-md text-sm">
              Cancelados
            </button>
          </div>
        </div>
        {loading.appointments ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <DataTable
            data={appointments.slice().reverse()}
            columns={historyColumns}
            searchable={true}
            pagination={true}
            pageSize={5}
            className="max-h-96"
          />
        )}
      </div>
    </div>
  );
};

export default DashboardCustomer;