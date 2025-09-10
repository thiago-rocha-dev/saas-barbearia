import React, { useState } from 'react';
import { ClientProfile } from '../../components/client/ClientProfile';
import { ClientBooking } from '../../components/client/ClientBooking';
import { ClientHistory } from '../../components/client/ClientHistory';
import { ClientAppointments } from '../../components/client/ClientAppointments';
import { useClientData } from '../../hooks/useClientData';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/Button';

import {
  Calendar,
  Clock,
  History,
  Plus,
  Star,
  TrendingUp,
  LogOut
} from 'lucide-react';


const DashboardCustomer: React.FC = () => {
  const { profile, appointments, stats, loading, actions } = useClientData();
  const { signOut } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(appointments.length === 0);
  const [activeTab, setActiveTab] = useState<'profile' | 'appointments' | 'history' | 'booking'>('profile');
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleCreateAppointment = () => {
    setActiveTab('booking');
  };

  const handleRefresh = () => {
    actions.loadProfile();
    actions.loadAppointments();
    actions.loadStats();
  };

  // TRAE_FIX: Implementação do logout com confirmação e feedback visual
  const handleSignOut = async () => {
    if (window.confirm('Tem certeza que deseja sair da sua conta?')) {
      setIsSigningOut(true);
      try {
        await signOut();
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      } finally {
        setIsSigningOut(false);
      }
    }
  };



  // Removed unused handleAppointmentSubmit function

  // Calculate next appointment
  const nextAppointment = appointments
    .filter(apt => ['scheduled', 'confirmed'].includes(apt.status) && new Date(`${apt.appointment_date}T${apt.start_time}`) > new Date())
    .sort((a, b) => new Date(`${a.appointment_date}T${a.start_time}`).getTime() - new Date(`${b.appointment_date}T${b.start_time}`).getTime())[0];

  // Calculate time until next appointment
  const getTimeUntilAppointment = () => {
    if (!nextAppointment) return null;
    
    const now = new Date();
    const appointmentDate = new Date(`${nextAppointment.appointment_date}T${nextAppointment.start_time}`);
    const diff = appointmentDate.getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading.profile && loading.appointments && loading.stats) {
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
            onClick={handleRefresh}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all duration-200 border border-purple-500/30 hover:border-purple-500/50"
          >
            Atualizar
          </button>
          {/* TRAE_FIX: Botão de logout com confirmação e feedback visual */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30 hover:border-red-500/50 rounded-lg transition-all duration-200 flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>{isSigningOut ? 'Saindo...' : 'Sair'}</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm rounded-lg p-1">
        {[
          { id: 'profile', label: 'Perfil', icon: 'user' },
          { id: 'appointments', label: 'Agendamentos', icon: 'calendar' },
          { id: 'history', label: 'Histórico', icon: 'clock' },
          { id: 'booking', label: 'Novo Agendamento', icon: 'plus' }
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
              {tab.icon === 'user' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              )}
              {tab.icon === 'calendar' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              )}
              {tab.icon === 'clock' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
              {tab.icon === 'plus' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
                  {new Date(`${nextAppointment.appointment_date}T${nextAppointment.start_time}`).toLocaleDateString('pt-BR')} às {' '}
                  {new Date(`${nextAppointment.appointment_date}T${nextAppointment.start_time}`).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {getTimeUntilAppointment()}
              </div>
              <div className="text-sm text-gray-400 mb-3">restantes</div>
              {/* TRAE_FIX: Implementação dos botões Reagendar e Cancelar com funcionalidade real */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('booking')}
                  className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/30 hover:border-purple-500/50 rounded text-sm transition-colors"
                >
                  Reagendar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (nextAppointment && actions.cancelAppointment) {
                      // TRAE_FIX: Implementação do cancelamento com confirmação
                      if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
                        actions.cancelAppointment(nextAppointment.id).then((success) => {
                          if (success) {
                            handleRefresh();
                          }
                        });
                      }
                    }
                  }}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30 hover:border-red-500/50 rounded text-sm transition-colors"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading.stats ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 bg-white/5 rounded-xl animate-pulse" />
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total de Agendamentos</p>
                    <p className="text-2xl font-bold text-white">{stats?.total_appointments || 0}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Agendamentos Concluídos</p>
                    <p className="text-2xl font-bold text-white">{stats?.completed_appointments || 0}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Avaliação Média</p>
                    <p className="text-2xl font-bold text-white">{stats?.average_rating_given?.toFixed(1) || '0.0'}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Valor Total Gasto</p>
                    <p className="text-2xl font-bold text-white">R$ {stats?.total_spent?.toFixed(2) || '0.00'}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </>
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
            <div className="space-y-3">
              <Button 
                onClick={() => setActiveTab('booking')}
                className="w-full h-16 flex items-center justify-start gap-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 hover:border-purple-500/50"
              >
                <Plus className="h-5 w-5" />
                <span>Novo Agendamento</span>
              </Button>
              <Button 
                onClick={() => setActiveTab('appointments')}
                className="w-full h-16 flex items-center justify-start gap-3 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-white/20"
              >
                <Calendar className="h-5 w-5" />
                <span>Meus Agendamentos</span>
              </Button>
              <Button 
                onClick={() => setActiveTab('history')}
                className="w-full h-16 flex items-center justify-start gap-3 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-white/20"
              >
                <History className="h-5 w-5" />
                <span>Histórico</span>
              </Button>
            </div>
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
      {activeTab === 'profile' && (
        <ClientProfile
          profile={profile}
          loading={loading.profile}
          onUpdate={actions.updateProfile}
        />
      )}

      {activeTab === 'appointments' && (
          <ClientAppointments 
            appointments={appointments}
            loading={loading.appointments}
            onCancel={actions.cancelAppointment}
          />
        )}
        {activeTab === 'history' && (
          <ClientHistory 
            appointmentHistory={appointments.filter(apt => apt.status === 'completed')}
            loading={loading.appointments}
          />
        )}
        {activeTab === 'booking' && (
          <ClientBooking 
            onBookingComplete={() => {
              setActiveTab('appointments');
              handleRefresh();
            }}
          />
        )}
    </div>
  );
};

export default DashboardCustomer;