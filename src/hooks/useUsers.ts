import { useState, useEffect, useCallback } from 'react';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  checkEmailExists
} from '../lib/users';
import type {
  User,
  UserFilters,
  CreateUserRequest,
  UpdateUserRequest,
  UserStats
} from '../types/users';
import { useToast } from './useToast';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  stats: UserStats | null;
  
  // Actions
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  fetchUserById: (id: string) => Promise<User | null>;
  createNewUser: (userData: CreateUserRequest) => Promise<boolean>;
  updateExistingUser: (id: string, updates: UpdateUserRequest) => Promise<boolean>;
  removeUser: (id: string) => Promise<boolean>;
  fetchStats: () => Promise<void>;
  validateEmail: (email: string) => Promise<boolean>;
  
  // Filters
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;
  clearFilters: () => void;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [filters, setFilters] = useState<UserFilters>({});
  
  const { showToast } = useToast();

  // Buscar usuários
  const fetchUsers = useCallback(async (customFilters?: UserFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const filtersToUse = customFilters || filters;
      const response = await getUsers(filtersToUse);
      
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.error || 'Erro ao carregar usuários');
        showToast(
          response.error || 'Erro ao carregar usuários',
          'error',
          'Erro'
        );
      }
    } catch (err) {
      const errorMessage = 'Erro inesperado ao carregar usuários';
      setError(errorMessage);
      showToast(
        errorMessage,
        'error',
        'Erro'
      );
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  // Buscar usuário por ID
  const fetchUserById = useCallback(async (id: string): Promise<User | null> => {
    try {
      const response = await getUserById(id);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        showToast(
          response.error || 'Erro ao carregar usuário',
          'error',
          'Erro'
        );
        return null;
      }
    } catch (err) {
      showToast(
        'Erro inesperado ao carregar usuário',
        'error',
        'Erro'
      );
      return null;
    }
  }, [showToast]);

  // Criar novo usuário
  const createNewUser = useCallback(async (userData: CreateUserRequest): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await createUser(userData);
      
      if (response.success) {
        showToast(`${userData.role === 'barber' ? 'Barbeiro' : 'Cliente'} criado com sucesso!`, 'success', 'Sucesso');
        
        // Atualizar lista de usuários
        await fetchUsers();
        return true;
      } else {
        showToast(
          response.error || 'Erro ao criar usuário',
          'error',
          'Erro'
        );
        return false;
      }
    } catch (err) {
      showToast(
        'Erro inesperado ao criar usuário',
        'error',
        'Erro'
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, showToast]);

  // Atualizar usuário
  const updateExistingUser = useCallback(async (id: string, updates: UpdateUserRequest): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await updateUser(id, updates);
      
      if (response.success) {
        showToast('Usuário atualizado com sucesso!', 'success', 'Sucesso');
        
        // Atualizar lista de usuários
        await fetchUsers();
        return true;
      } else {
        showToast(
          response.error || 'Erro ao atualizar usuário',
          'error',
          'Erro'
        );
        return false;
      }
    } catch (err) {
      showToast(
        'Erro inesperado ao atualizar usuário',
        'error',
        'Erro'
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, showToast]);

  // Remover usuário
  const removeUser = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await deleteUser(id);
      
      if (response.success) {
        showToast('Usuário removido com sucesso!', 'success', 'Sucesso');
        
        // Atualizar lista de usuários
        await fetchUsers();
        return true;
      } else {
        showToast(
          response.error || 'Erro ao remover usuário',
          'error',
          'Erro'
        );
        return false;
      }
    } catch (err) {
      showToast(
        'Erro inesperado ao remover usuário',
        'error',
        'Erro'
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, showToast]);

  // Buscar estatísticas
  const fetchStats = useCallback(async () => {
    try {
      const response = await getUserStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        console.error('Erro ao carregar estatísticas:', response.error);
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar estatísticas:', err);
    }
  }, []);

  // Validar email
  const validateEmail = useCallback(async (email: string): Promise<boolean> => {
    try {
      const response = await checkEmailExists(email);
      
      if (response.error) {
        showToast(
          response.error,
          'error',
          'Erro'
        );
        return false;
      }
      
      if (response.exists) {
        showToast(
          'Este email já está cadastrado no sistema',
          'error',
          'Email já existe'
        );
        return false;
      }
      
      return true;
    } catch (err) {
      showToast(
        'Erro ao validar email',
        'error',
        'Erro'
      );
      return false;
    }
  }, [showToast]);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Carregar usuários quando os filtros mudarem
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Carregar estatísticas na inicialização
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    users,
    loading,
    error,
    stats,
    fetchUsers,
    fetchUserById,
    createNewUser,
    updateExistingUser,
    removeUser,
    fetchStats,
    validateEmail,
    filters,
    setFilters,
    clearFilters
  };
}