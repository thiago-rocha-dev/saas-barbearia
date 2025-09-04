import { supabase } from './supabase';
import type {
  User,
  UserRole,
  UserFilters,
  UserResponse,
  UsersListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserStats
} from '../types/users';

// Mapear dados do Supabase para o tipo User
function mapProfileToUser(profile: any): User {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.full_name || '',
    phone: profile.phone || '',
    role: profile.role as UserRole,
    status: profile.is_active ? 'active' : 'inactive',
    avatar_url: profile.avatar_url,
    created_at: profile.created_at,
    updated_at: profile.created_at // Supabase não tem updated_at na tabela profiles
  };
}

// Buscar todos os usuários com filtros
export async function getUsers(filters?: UserFilters): Promise<UsersListResponse> {
  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    if (filters?.status) {
      const isActive = filters.status === 'active';
      query = query.eq('is_active', isActive);
    }

    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return {
        success: false,
        error: error.message
      };
    }

    const users = data?.map(mapProfileToUser) || [];

    return {
      success: true,
      data: users,
      count: count || users.length
    };
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return {
      success: false,
      error: 'Erro interno do servidor'
    };
  }
}

// Buscar usuário por ID
export async function getUserById(id: string): Promise<UserResponse> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: mapProfileToUser(data)
    };
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return {
      success: false,
      error: 'Erro interno do servidor'
    };
  }
}

// Criar novo usuário
export async function createUser(userData: CreateUserRequest): Promise<UserResponse> {
  try {
    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.name,
        phone: userData.phone
      }
    });

    if (authError) {
      console.error('Erro ao criar usuário no Auth:', authError);
      return {
        success: false,
        error: authError.message
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Falha ao criar usuário'
      };
    }

    // 2. Atualizar perfil com role específico
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: userData.name,
        phone: userData.phone,
        role: userData.role
      })
      .eq('id', authData.user.id)
      .select()
      .single();

    if (profileError) {
      console.error('Erro ao atualizar perfil:', profileError);
      // Tentar deletar o usuário criado no Auth se falhar
      await supabase.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        error: profileError.message
      };
    }

    return {
      success: true,
      data: mapProfileToUser(profileData)
    };
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return {
      success: false,
      error: 'Erro interno do servidor'
    };
  }
}

// Atualizar usuário
export async function updateUser(id: string, updates: UpdateUserRequest): Promise<UserResponse> {
  try {
    const updateData: any = {};

    if (updates.name) updateData.full_name = updates.name;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.avatar_url) updateData.avatar_url = updates.avatar_url;
    if (updates.status !== undefined) {
      updateData.is_active = updates.status === 'active';
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: mapProfileToUser(data)
    };
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return {
      success: false,
      error: 'Erro interno do servidor'
    };
  }
}

// Deletar usuário
export async function deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Deletar do Auth (isso também deletará o perfil devido ao CASCADE)
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      console.error('Erro ao deletar usuário:', authError);
      return {
        success: false,
        error: authError.message
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return {
      success: false,
      error: 'Erro interno do servidor'
    };
  }
}

// Obter estatísticas de usuários
export async function getUserStats(): Promise<{ success: boolean; data?: UserStats; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, is_active');

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        success: false,
        error: error.message
      };
    }

    const stats: UserStats = {
      total: data.length,
      active: data.filter(p => p.is_active).length,
      inactive: data.filter(p => !p.is_active).length,
      pending: 0, // Não temos status pending na estrutura atual
      barbers: data.filter(p => p.role === 'barber').length,
      customers: data.filter(p => p.role === 'customer').length
    };

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      success: false,
      error: 'Erro interno do servidor'
    };
  }
}

// Verificar se email já existe
export async function checkEmailExists(email: string): Promise<{ exists: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao verificar email:', error);
      return {
        exists: false,
        error: error.message
      };
    }

    return {
      exists: !!data
    };
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return {
      exists: false,
      error: 'Erro interno do servidor'
    };
  }
}