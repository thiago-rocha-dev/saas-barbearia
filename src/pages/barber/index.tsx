import React from 'react';
import KPICard from '../../components/dashboard/KPICard';
import Timeline from '../../components/dashboard/Timeline';
import DataTable from '../../components/dashboard/DataTable';
import QuickActions from '../../components/dashboard/QuickActions';
import { useDashboardData } from '../../hooks/useDashboardData';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { DataTableColumn } from '../../types/dashboard';

const DashboardBarber: React.FC = () => {
  const { kpis, appointments, timeline, quickActions, loading, refreshData } = useDashboardData('barber');

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
    </div>
  );
};

export default DashboardBarber;