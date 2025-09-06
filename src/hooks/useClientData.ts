import { useState, useEffect, useCallback } from 'react';
import type {
  ClientProfile,
  ClientStats,
  ClientAppointment,
  ClientAppointmentHistory,
  AvailableBarber,
  AvailableService,
  AvailableTimeSlot,
  BookingRequest,
  UpdateClientProfileRequest,
  CreateReviewRequest,
  AppointmentFilters,
  BookingFilters,
  ClientDashboardData
} from '../types/client';
import {
  getClientProfile,
  updateClientProfile,
  getClientAppointments,
  getClientAppointmentHistory,
  createClientAppointment,
  cancelClientAppointment,
  createReview,
  getClientStats,
  getAvailableBarbers,
  getAvailableServices,
  getAvailableTimeSlots,
  checkTimeSlotAvailability
} from '../lib/client';
import { useAuth } from './useAuth';

interface UseClientDataReturn {
  // Estado
  profile: ClientProfile | null;
  appointments: ClientAppointment[];
  appointmentHistory: ClientAppointmentHistory[];
  stats: ClientStats | null;
  availableBarbers: AvailableBarber[];
  availableServices: AvailableService[];
  availableTimeSlots: AvailableTimeSlot[];
  dashboardData: ClientDashboardData | null;
  
  // Estados de carregamento
  loading: {
    profile: boolean;
    appointments: boolean;
    history: boolean;
    stats: boolean;
    barbers: boolean;
    services: boolean;
    timeSlots: boolean;
    dashboard: boolean;
  };
  
  // Estados de erro
  error: {
    profile: string | null;
    appointments: string | null;
    history: string | null;
    stats: string | null;
    barbers: string | null;
    services: string | null;
    timeSlots: string | null;
    dashboard: string | null;
  };
  
  // Ações
  actions: {
    // Perfil
    loadProfile: () => Promise<void>;
    updateProfile: (updates: UpdateClientProfileRequest) => Promise<boolean>;
    
    // Agendamentos
    loadAppointments: (filters?: AppointmentFilters) => Promise<void>;
    loadAppointmentHistory: (filters?: AppointmentFilters) => Promise<void>;
    createAppointment: (booking: BookingRequest) => Promise<string | null>;
    cancelAppointment: (appointmentId: string) => Promise<boolean>;
    
    // Avaliações
    submitReview: (review: CreateReviewRequest) => Promise<boolean>;
    
    // Estatísticas
    loadStats: () => Promise<void>;
    
    // Dados para agendamento
    loadAvailableBarbers: (filters?: BookingFilters) => Promise<void>;
    loadAvailableServices: (barberId?: string) => Promise<void>;
    loadAvailableTimeSlots: (barberId: string, date: string) => Promise<void>;
    checkTimeAvailability: (barberId: string, date: string, time: string) => Promise<boolean>;
    
    // Dashboard completo
    loadDashboardData: () => Promise<void>;
    
    // Refresh
    refreshAll: () => Promise<void>;
  };
}

export function useClientData(): UseClientDataReturn {
  const { user } = useAuth();
  const clientId = user?.id;
  
  // Estados principais
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [appointmentHistory, setAppointmentHistory] = useState<ClientAppointmentHistory[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [availableBarbers, setAvailableBarbers] = useState<AvailableBarber[]>([]);
  const [availableServices, setAvailableServices] = useState<AvailableService[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<AvailableTimeSlot[]>([]);
  const [dashboardData, setDashboardData] = useState<ClientDashboardData | null>(null);
  
  // Estados de carregamento
  const [loading, setLoading] = useState({
    profile: false,
    appointments: false,
    history: false,
    stats: false,
    barbers: false,
    services: false,
    timeSlots: false,
    dashboard: false
  });
  
  // Estados de erro
  const [error, setError] = useState({
    profile: null as string | null,
    appointments: null as string | null,
    history: null as string | null,
    stats: null as string | null,
    barbers: null as string | null,
    services: null as string | null,
    timeSlots: null as string | null,
    dashboard: null as string | null
  });
  
  // Função auxiliar para atualizar loading
  const setLoadingState = useCallback((key: keyof typeof loading, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);
  
  // Função auxiliar para atualizar erro
  const setErrorState = useCallback((key: keyof typeof error, value: string | null) => {
    setError(prev => ({ ...prev, [key]: value }));
  }, []);
  
  // Carregar perfil
  const loadProfile = useCallback(async () => {
    if (!clientId) return;
    
    setLoadingState('profile', true);
    setErrorState('profile', null);
    
    try {
      const profileData = await getClientProfile(clientId);
      setProfile(profileData);
    } catch (err) {
      setErrorState('profile', 'Erro ao carregar perfil');
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setLoadingState('profile', false);
    }
  }, [clientId, setLoadingState, setErrorState]);
  
  // Atualizar perfil
  const updateProfileAction = useCallback(async (updates: UpdateClientProfileRequest): Promise<boolean> => {
    if (!clientId) return false;
    
    try {
      const success = await updateClientProfile(clientId, updates);
      if (success) {
        await loadProfile(); // Recarregar perfil após atualização
      }
      return success;
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      return false;
    }
  }, [clientId, loadProfile]);
  
  // Carregar agendamentos
  const loadAppointments = useCallback(async (filters?: AppointmentFilters) => {
    if (!clientId) return;
    
    setLoadingState('appointments', true);
    setErrorState('appointments', null);
    
    try {
      const appointmentsData = await getClientAppointments(clientId, {
        ...filters,
        status: filters?.status || 'scheduled'
      });
      setAppointments(appointmentsData);
    } catch (err) {
      setErrorState('appointments', 'Erro ao carregar agendamentos');
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setLoadingState('appointments', false);
    }
  }, [clientId, setLoadingState, setErrorState]);
  
  // Carregar histórico
  const loadAppointmentHistory = useCallback(async (filters?: AppointmentFilters) => {
    if (!clientId) return;
    
    setLoadingState('history', true);
    setErrorState('history', null);
    
    try {
      const historyData = await getClientAppointmentHistory(clientId, filters);
      setAppointmentHistory(historyData);
    } catch (err) {
      setErrorState('history', 'Erro ao carregar histórico');
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoadingState('history', false);
    }
  }, [clientId, setLoadingState, setErrorState]);
  
  // Criar agendamento
  const createAppointment = useCallback(async (booking: BookingRequest): Promise<string | null> => {
    if (!clientId) return null;
    
    try {
      const appointmentId = await createClientAppointment(clientId, booking);
      if (appointmentId) {
        // Recarregar agendamentos após criação
        await loadAppointments();
      }
      return appointmentId;
    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      return null;
    }
  }, [clientId, loadAppointments]);
  
  // Cancelar agendamento
  const cancelAppointment = useCallback(async (appointmentId: string): Promise<boolean> => {
    if (!clientId) return false;
    
    try {
      const success = await cancelClientAppointment(appointmentId, clientId);
      if (success) {
        // Recarregar agendamentos após cancelamento
        await loadAppointments();
        await loadAppointmentHistory();
      }
      return success;
    } catch (err) {
      console.error('Erro ao cancelar agendamento:', err);
      return false;
    }
  }, [clientId, loadAppointments, loadAppointmentHistory]);
  
  // Submeter avaliação
  const submitReview = useCallback(async (review: CreateReviewRequest): Promise<boolean> => {
    if (!clientId) return false;
    
    try {
      const success = await createReview(clientId, review);
      if (success) {
        // Recarregar histórico após avaliação
        await loadAppointmentHistory();
        await loadStats();
      }
      return success;
    } catch (err) {
      console.error('Erro ao submeter avaliação:', err);
      return false;
    }
  }, [clientId, loadAppointmentHistory]);
  
  // Carregar estatísticas
  const loadStats = useCallback(async () => {
    if (!clientId) return;
    
    setLoadingState('stats', true);
    setErrorState('stats', null);
    
    try {
      const statsData = await getClientStats(clientId);
      setStats(statsData);
    } catch (err) {
      setErrorState('stats', 'Erro ao carregar estatísticas');
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoadingState('stats', false);
    }
  }, [clientId, setLoadingState, setErrorState]);
  
  // Carregar barbeiros disponíveis
  const loadAvailableBarbers = useCallback(async (filters?: BookingFilters) => {
    setLoadingState('barbers', true);
    setErrorState('barbers', null);
    
    try {
      const barbersData = await getAvailableBarbers(filters);
      setAvailableBarbers(barbersData);
    } catch (err) {
      setErrorState('barbers', 'Erro ao carregar barbeiros');
      console.error('Erro ao carregar barbeiros:', err);
    } finally {
      setLoadingState('barbers', false);
    }
  }, [setLoadingState, setErrorState]);
  
  // Carregar serviços disponíveis
  const loadAvailableServices = useCallback(async (barberId?: string) => {
    setLoadingState('services', true);
    setErrorState('services', null);
    
    try {
      const servicesData = await getAvailableServices(barberId);
      setAvailableServices(servicesData);
    } catch (err) {
      setErrorState('services', 'Erro ao carregar serviços');
      console.error('Erro ao carregar serviços:', err);
    } finally {
      setLoadingState('services', false);
    }
  }, [setLoadingState, setErrorState]);
  
  // Carregar horários disponíveis
  const loadAvailableTimeSlots = useCallback(async (barberId: string, date: string) => {
    setLoadingState('timeSlots', true);
    setErrorState('timeSlots', null);
    
    try {
      const timeSlotsData = await getAvailableTimeSlots(barberId, date);
      setAvailableTimeSlots(timeSlotsData);
    } catch (err) {
      setErrorState('timeSlots', 'Erro ao carregar horários');
      console.error('Erro ao carregar horários:', err);
    } finally {
      setLoadingState('timeSlots', false);
    }
  }, [setLoadingState, setErrorState]);
  
  // Verificar disponibilidade de horário
  const checkTimeAvailability = useCallback(async (
    barberId: string,
    date: string,
    time: string
  ): Promise<boolean> => {
    try {
      return await checkTimeSlotAvailability(barberId, date, time);
    } catch (err) {
      console.error('Erro ao verificar disponibilidade:', err);
      return false;
    }
  }, []);
  
  // Carregar dados completos do dashboard
  const loadDashboardData = useCallback(async () => {
    if (!clientId) return;
    
    setLoadingState('dashboard', true);
    setErrorState('dashboard', null);
    
    try {
      // Carregar dados em paralelo
      const [profileData, appointmentsData, historyData, statsData] = await Promise.all([
        getClientProfile(clientId),
        getClientAppointments(clientId, { status: 'scheduled', limit: 5 }),
        getClientAppointmentHistory(clientId, { limit: 5 }),
        getClientStats(clientId)
      ]);
      
      const dashboardInfo: ClientDashboardData = {
        profile: profileData!,
        stats: statsData!,
        upcoming_appointments: appointmentsData || [],
        recent_appointments: historyData || [],
        available_barbers: [],
        available_services: []
      };
      
      setDashboardData(dashboardInfo);
      setProfile(profileData);
      setAppointments(appointmentsData);
      setAppointmentHistory(historyData);
      setStats(statsData);
    } catch (err) {
      setErrorState('dashboard', 'Erro ao carregar dados do dashboard');
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoadingState('dashboard', false);
    }
  }, [clientId, setLoadingState, setErrorState]);
  
  // Refresh completo
  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadProfile(),
      loadAppointments(),
      loadAppointmentHistory(),
      loadStats()
    ]);
  }, [loadProfile, loadAppointments, loadAppointmentHistory, loadStats]);
  
  // Carregar dados iniciais
  useEffect(() => {
    if (clientId) {
      loadDashboardData();
    }
  }, [clientId, loadDashboardData]);
  
  return {
    // Estado
    profile,
    appointments,
    appointmentHistory,
    stats,
    availableBarbers,
    availableServices,
    availableTimeSlots,
    dashboardData,
    
    // Estados de carregamento
    loading,
    
    // Estados de erro
    error,
    
    // Ações
    actions: {
      loadProfile,
      updateProfile: updateProfileAction,
      loadAppointments,
      loadAppointmentHistory,
      createAppointment,
      cancelAppointment,
      submitReview,
      loadStats,
      loadAvailableBarbers,
      loadAvailableServices,
      loadAvailableTimeSlots,
      checkTimeAvailability,
      loadDashboardData,
      refreshAll
    }
  };
}