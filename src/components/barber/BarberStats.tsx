import React from 'react';
import { Calendar, DollarSign, Users, TrendingUp, Star, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useBarberData } from '../../hooks/useBarberData';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

function StatCard({ title, value, icon, trend, subtitle, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-4 h-4 ${
              trend.isPositive ? '' : 'rotate-180'
            }`} />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface PeriodStatsProps {
  title: string;
  stats: {
    appointments: number;
    revenue: number;
    clients_served: number;
    completion_rate: number;
    growth_percentage?: number;
  };
}

function PeriodStats({ title, stats }: PeriodStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.appointments}</div>
          <div className="text-sm text-gray-600">Agendamentos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.revenue)}</div>
          <div className="text-sm text-gray-600">Receita</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.clients_served}</div>
          <div className="text-sm text-gray-600">Clientes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.completion_rate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Taxa de conclusão</div>
        </div>
      </div>
      {stats.growth_percentage !== undefined && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className={`flex items-center justify-center space-x-2 text-sm ${
            stats.growth_percentage >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-4 h-4 ${
              stats.growth_percentage >= 0 ? '' : 'rotate-180'
            }`} />
            <span>
              {stats.growth_percentage >= 0 ? '+' : ''}{stats.growth_percentage.toFixed(1)}% vs período anterior
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function BarberStats() {
  const { stats, loadingStats } = useBarberData();

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma estatística disponível</p>
          <p className="text-sm mt-2">Comece a atender clientes para ver suas estatísticas aqui.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Minhas Estatísticas</h2>
        <p className="text-gray-600">Acompanhe seu desempenho e crescimento</p>
      </div>

      {/* Estatísticas rápidas de hoje */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Agendamentos Hoje"
          value={stats.today.appointments}
          icon={<Calendar className="w-5 h-5" />}
          subtitle="Total do dia"
          color="blue"
        />
        <StatCard
          title="Receita Hoje"
          value={formatCurrency(stats.today.revenue)}
          icon={<DollarSign className="w-5 h-5" />}
          subtitle="Faturamento do dia"
          color="green"
        />
        <StatCard
          title="Clientes Atendidos"
          value={stats.today.clients_served}
          icon={<Users className="w-5 h-5" />}
          subtitle="Hoje"
          color="purple"
        />
        <StatCard
          title="Taxa de Conclusão"
          value={`${stats.today.completion_rate.toFixed(1)}%`}
          icon={<CheckCircle className="w-5 h-5" />}
          subtitle="Hoje"
          color="orange"
        />
      </div>

      {/* Estatísticas por período */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PeriodStats
          title="Esta Semana"
          stats={stats.week}
        />
        <PeriodStats
          title="Este Mês"
          stats={stats.month}
        />
      </div>

      {/* Avaliações */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Avaliações dos Clientes</h3>
        
        {stats.ratings.total_reviews > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-2xl font-bold text-gray-900">
                  {stats.ratings.average.toFixed(1)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Baseado em {stats.ratings.total_reviews} avaliações
              </div>
            </div>
            
            {stats.ratings.recent_reviews.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Avaliações Recentes</h4>
                {stats.ratings.recent_reviews.map((review, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{review.client_name}</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma avaliação ainda</p>
            <p className="text-sm mt-2">Suas avaliações aparecerão aqui quando os clientes avaliarem seus serviços.</p>
          </div>
        )}
      </div>

      {/* Resumo de desempenho */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Desempenho</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {stats.month.appointments}
            </div>
            <div className="text-sm text-gray-600">Agendamentos este mês</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {formatCurrency(stats.month.revenue)}
            </div>
            <div className="text-sm text-gray-600">Receita mensal</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {stats.ratings.average > 0 ? stats.ratings.average.toFixed(1) : '0.0'}
            </div>
            <div className="text-sm text-gray-600">Avaliação média</div>
          </div>
        </div>
      </div>
    </div>
  );
}