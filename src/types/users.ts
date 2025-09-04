export type UserRole = 'admin' | 'barber' | 'customer';

export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserFormData {
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  password?: string;
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export interface UserResponse {
  success: boolean;
  data?: User;
  error?: string;
}

export interface UsersListResponse {
  success: boolean;
  data?: User[];
  error?: string;
  count?: number;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  status?: UserStatus;
  avatar_url?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  barbers: number;
  customers: number;
}