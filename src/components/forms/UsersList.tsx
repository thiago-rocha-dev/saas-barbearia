import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, User, Mail, Phone, Users, UserCheck } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import type { User as UserType, UserFilters, UserRole } from '../../types/users';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import UserForm from './UserForm';

interface UsersListProps {
  onCreateUser?: () => void;
}

const UsersList: React.FC<UsersListProps> = ({ onCreateUser }) => {
  const {
    users,
    loading,
    error,
    stats,
    removeUser,
    setFilters,
    clearFilters
  } = useUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | ''>('');
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Aplicar filtros
  const handleApplyFilters = () => {
    const newFilters: UserFilters = {};
    
    if (searchTerm.trim()) {
      newFilters.search = searchTerm.trim();
    }
    
    if (selectedRole) {
      newFilters.role = selectedRole;
    }
    
    if (selectedStatus) {
      newFilters.status = selectedStatus;
    }
    
    setFilters(newFilters);
  };

  // Limpar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
    setSelectedStatus('');
    clearFilters();
  };

  // Editar usuário
  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  // Deletar usuário
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setDeletingUserId(userId);
    
    try {
      await removeUser(userId);
    } finally {
      setDeletingUserId(null);
    }
  };

  // Fechar modal de edição
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  // Obter cor do badge do role
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'barber':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'customer':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Obter texto do role
  const getRoleText = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'barber':
        return 'Barbeiro';
      case 'customer':
        return 'Cliente';
      default:
        return role;
    }
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-500/20 text-green-300 border-green-500/30'
      : 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Total</p>
                <p className="text-white text-xl font-semibold">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-300" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Ativos</p>
                <p className="text-white text-xl font-semibold">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <User className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Barbeiros</p>
                <p className="text-white text-xl font-semibold">{stats.barbers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="w-5 h-5 text-green-300" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Clientes</p>
                <p className="text-white text-xl font-semibold">{stats.customers}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-white/60" />
          <h3 className="text-white font-medium">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          
          {/* Filtro por Role */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole | '')}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="" className="bg-gray-800 text-white">Todos os tipos</option>
            <option value="barber" className="bg-gray-800 text-white">Barbeiros</option>
            <option value="customer" className="bg-gray-800 text-white">Clientes</option>
          </select>
          
          {/* Filtro por Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'active' | 'inactive' | '')}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="" className="bg-gray-800 text-white">Todos os status</option>
            <option value="active" className="bg-gray-800 text-white">Ativos</option>
            <option value="inactive" className="bg-gray-800 text-white">Inativos</option>
          </select>
          
          {/* Botões */}
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyFilters}
              className="flex-1"
            >
              Aplicar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearFilters}
              className="flex-1"
            >
              Limpar
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuários ({users.length})
            </h3>
            {onCreateUser && (
              <Button variant="primary" size="sm" onClick={onCreateUser}>
                Novo Usuário
              </Button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {users.map((user) => (
              <div key={user.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-white font-medium">{user.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getRoleBadgeColor(user.role)}`}>
                          {getRoleText(user.role)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(user.status)}`}>
                          {user.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      className="p-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deletingUserId === user.id}
                      className="p-2"
                    >
                      {deletingUserId === user.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      <UserForm
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        user={editingUser}
        mode="edit"
      />
    </div>
  );
};

export default UsersList;