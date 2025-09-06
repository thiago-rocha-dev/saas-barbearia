import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import {
  getBarberProfile,
  updateBarberProfile,
  getBarberServices,
  createBarberService,
  updateBarberService,
  deleteBarberService,
  getWorkingHours,
  updateWorkingHours,
  getBarberAppointments,
  updateAppointmentStatus,
  getBarberStats,
  getBarberScheduleDay,
  blockTimeSlot
} from '../lib/barber';
import type {
  BarberProfile,
  BarberStats,
  BarberService,
  WorkingHours,
  BarberAppointment,
  BarberScheduleDay,
  UpdateBarberProfileRequest,
  CreateServiceRequest,
  UpdateServiceRequest,
  UpdateWorkingHoursRequest,
  BlockTimeSlotRequest,
  BarberFilters
} from '../types/barber';

export function useBarberData() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Estados
  const [profile, setProfile] = useState<BarberProfile | null>(null);
  const [services, setServices] = useState<BarberService[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [appointments, setAppointments] = useState<BarberAppointment[]>([]);
  const [stats, setStats] = useState<BarberStats | null>(null);
  const [scheduleDay, setScheduleDay] = useState<BarberScheduleDay | null>(null);
  
  // Estados de loading
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingWorkingHours, setLoadingWorkingHours] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  
  // Estados de ação
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [managingService, setManagingService] = useState(false);
  const [updatingWorkingHours, setUpdatingWorkingHours] = useState(false);
  const [updatingAppointment, setUpdatingAppointment] = useState(false);
  const [blockingTime, setBlockingTime] = useState(false);

  const barberId = user?.id;

  // Função para carregar perfil
  const loadProfile = useCallback(async () => {
    if (!barberId) return;
    
    setLoadingProfile(true);
    try {
      const result = await getBarberProfile(barberId);
      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        showToast('Erro ao carregar perfil', 'error');
      }
    } catch (error) {
      showToast('Erro inesperado ao carregar perfil', 'error');
    } finally {
      setLoadingProfile(false);
    }
  }, [barberId, showToast]);

  // Função para atualizar perfil
  const updateProfile = useCallback(async (updates: UpdateBarberProfileRequest) => {
    if (!barberId) return false;
    
    setUpdatingProfile(true);
    try {
      const result = await updateBarberProfile(barberId, updates);
      if (result.success && result.data) {
        setProfile(result.data);
        showToast('Perfil atualizado com sucesso', 'success');
        return true;
      } else {
        showToast(result.error || 'Erro ao atualizar perfil', 'error');
        return false;
      }
    } catch (error) {
      showToast('Erro inesperado ao atualizar perfil', 'error');
      return false;
    } finally {
      setUpdatingProfile(false);
    }
  }, [barberId, showToast]);

  // Função para carregar serviços
  const loadServices = useCallback(async () => {
    if (!barberId) return;
    
    setLoadingServices(true);
    try {
      const result = await getBarberServices(barberId);
      if (result.success && result.data) {
        setServices(result.data);
      } else {
        showToast('Erro ao carregar serviços', 'error');
      }
    } catch (error) {
      showToast('Erro inesperado ao carregar serviços', 'error');
    } finally {
      setLoadingServices(false);
    }
  }, [barberId, showToast]);

  // Função para criar serviço
  const createService = useCallback(async (service: CreateServiceRequest) => {
    if (!barberId) return false;
    
    setManagingService(true);
    try {
      const result = await createBarberService(barberId, service);
      if (result.success && result.data) {
        setServices(prev => [...prev, result.data!]);
        showToast('Serviço criado com sucesso', 'success');
        return true;
      } else {
        showToast(result.error || 'Erro ao criar serviço', 'error');
        return false;
      }
    } catch (error) {
      showToast('Erro inesperado ao criar serviço', 'error');
      return false;
    } finally {
      setManagingService(false);
    }
  }, [barberId, showToast]);

  // Função para atualizar serviço
  const updateService = useCallback(async (serviceId: string, updates: UpdateServiceRequest) => {
    setManagingService(true);
    try {
      const result = await updateBarberService(serviceId, updates);
      if (result.success && result.data) {
        setServices(prev => prev.map(service => 
          service.id === serviceId ? result.data! : service
        ));
        showToast('Serviço atualizado com sucesso', 'success');
        return true;
      } else {
        showToast(result.error || 'Erro ao atualizar serviço', 'error');
        return false;
      }
    } catch (error) {
      showToast('Erro inesperado ao atualizar serviço', 'error');
      return false;
    } finally {
      setManagingService(false);
    }
  }, [showToast]);

  // Função para deletar serviço
  const deleteService = useCallback(async (serviceId: string) => {
    setManagingService(true);
    try {
      const result = await deleteBarberService(serviceId);
      if (result.success) {
        setServices(prev => prev.filter(service => service.id !== serviceId));
        showToast('Serviço removido com sucesso', 'success');
        return true;
      } else {
        showToast(result.error || 'Erro ao remover serviço', 'error');
        return false;
      }
    } catch (error) {
      showToast('Erro inesperado ao remover serviço', 'error');
      return false;
    } finally {
      setManagingService(false);
    }
  }, [showToast]);

  // Função para carregar horários de trabalho
  const loadWorkingHours = useCallback(async () => {
    if (!barberId) return;
    
    setLoadingWorkingHours(true);
    try {
      const result = await getWorkingHours(barberId);
      if (result.success && result.data) {
        setWorkingHours(result.data);
      } else {
        showToast('Erro ao carregar horários de trabalho', 'error');
      }
    } catch (error) {
      showToast('Erro inesperado ao carregar horários', 'error');
    } finally {
      setLoadingWorkingHours(false);
    }
  }, [barberId, showToast]);

  // Função para atualizar horários de trabalho
  const updateWorkingHoursData = useCallback(async (hours: UpdateWorkingHoursRequest[]) => {
    if (!barberId) return false;
    
    setUpdatingWorkingHours(true);
    try {
      const result = await updateWorkingHours(barberId, hours);
      if (result.success && result.data) {
        setWorkingHours(result.data);
        showToast('Horários de trabalho atualizados', 'success');
        return true;
      } else {
        showToast(result.error || 'Erro ao atualizar horários', 'error');
        return false;
      }
    } catch (error) {
      showToast('Erro inesperado ao atualizar horários', 'error');
      return false;
    } finally {
      setUpdatingWorkingHours(false);
    }
  }, [barberId, showToast]);

  // Função para carregar agendamentos
  const loadAppointments = useCallback(async (filters?: BarberFilters) => {
    if (!barberId) return;
    
    setLoadingAppointments(true);
    try {
      const result = await getBarberAppointments(barberId, filters);
      if (result.success && result.data) {
        setAppointments(result.data);
      } else {
        showToast('Erro ao carregar agendamentos', 'error');
      }
    } catch (error) {
      showToast('Erro inesperado ao carregar agendamentos', 'error');
    } finally {
      setLoadingAppointments(false);
    }
  }, [barberId, showToast]);

  // Função para atualizar status do agendamento
  const updateAppointmentStatusData = useCallback(async (appointmentId: string, status: BarberAppointment['status']) => {
    setUpdatingAppointment(true);
    try {
      const result = await updateAppointmentStatus(appointmentId, status);
      if (result.success) {
        setAppointments(prev => prev.map(appointment => 
          appointment.id === appointmentId ? { ...appointment, status } : appointment
        ));
        showToast('Status do agendamento atualizado', 'success');
        return true;
      } else {
        showToast(result.error || 'Erro ao atualizar agendamento', 'error');
        return false;
      }
    } catch (error) {
      showToast('Erro inesperado ao atualizar agendamento', 'error');
      return false;
    } finally {
      setUpdatingAppointment(false);
    }
  }, [showToast]);

  // Função para carregar estatísticas
  const loadStats = useCallback(async () => {
    if (!barberId) return;
    
    setLoadingStats(true);
    try {
      const result = await getBarberStats(barberId);
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        showToast('Erro ao carregar estatísticas', 'error');
      }
    } catch (error) {
      showToast('Erro inesperado ao carregar estatísticas', 'error');
    } finally {
      setLoadingStats(false);
    }
  }, [barberId, showToast]);

  // Função para carregar agenda do dia
  const loadScheduleDay = useCallback(async (date: string) => {
    if (!barberId) return;
    
    setLoadingSchedule(true);
    try {
      const result = await getBarberScheduleDay(barberId, date);
      if (result.success && result.data) {
        setScheduleDay(result.data);
      } else {
        showToast('Erro ao carregar agenda do dia', 'error');
      }
    } catch (error) {
      showToast('Erro inesperado ao carregar agenda', 'error');
    } finally {
      setLoadingSchedule(false);
    }
  }, [barberId, showToast]);

  // Função para bloquear horário
  const blockTime = useCallback(async (blockData: BlockTimeSlotRequest) => {
    if (!barberId) return false;
    
    setBlockingTime(true);
    try {
      const result = await blockTimeSlot(barberId, blockData);
      if (result.success) {
        showToast('Horário bloqueado com sucesso', 'success');
        // Recarregar agenda do dia se estiver carregada
        if (scheduleDay && scheduleDay.date === blockData.date) {
          await loadScheduleDay(blockData.date);
        }
        return true;
      } else {
        showToast(result.error || 'Erro ao bloquear horário', 'error');
        return false;
      }
    } catch (error) {
      showToast('Erro inesperado ao bloquear horário', 'error');
      return false;
    } finally {
      setBlockingTime(false);
    }
  }, [barberId, showToast, scheduleDay, loadScheduleDay]);

  // Função para recarregar todos os dados
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      loadProfile(),
      loadServices(),
      loadWorkingHours(),
      loadAppointments(),
      loadStats()
    ]);
  }, [loadProfile, loadServices, loadWorkingHours, loadAppointments, loadStats]);

  // Carregar dados iniciais
  useEffect(() => {
    if (barberId) {
      refreshAllData();
    }
  }, [barberId, refreshAllData]);

  return {
    // Estados
    profile,
    services,
    workingHours,
    appointments,
    stats,
    scheduleDay,
    
    // Estados de loading
    loadingProfile,
    loadingServices,
    loadingWorkingHours,
    loadingAppointments,
    loadingStats,
    loadingSchedule,
    
    // Estados de ação
    updatingProfile,
    managingService,
    updatingWorkingHours,
    updatingAppointment,
    blockingTime,
    
    // Funções
    loadProfile,
    updateProfile,
    loadServices,
    createService,
    updateService,
    deleteService,
    loadWorkingHours,
    updateWorkingHours: updateWorkingHoursData,
    loadAppointments,
    updateAppointmentStatus: updateAppointmentStatusData,
    loadStats,
    loadScheduleDay,
    blockTime,
    refreshAllData
  };
}