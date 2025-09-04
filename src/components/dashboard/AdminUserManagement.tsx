import React, { useState } from 'react';
import { Users, UserPlus, UserCheck } from 'lucide-react';
import UsersList from '../forms/UsersList';
import UserForm from '../forms/UserForm';
import { Button } from '../ui/Button';

const AdminUserManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUserType, setCreateUserType] = useState<'barber' | 'customer'>('barber');

  const handleCreateUser = (type: 'barber' | 'customer') => {
    setCreateUserType(type);
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Gestão de Usuários</h1>
            <p className="text-white/60">Gerencie barbeiros e clientes da barbearia</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => handleCreateUser('customer')}
            className="flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Novo Cliente
          </Button>
          
          <Button
            variant="primary"
            onClick={() => handleCreateUser('barber')}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Novo Barbeiro
          </Button>
        </div>
      </div>

      {/* Descrição */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Users className="w-5 h-5 text-blue-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-medium">Central de Usuários</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Aqui você pode gerenciar todos os usuários da sua barbearia. Cadastre novos barbeiros 
              para que possam acessar o sistema e gerenciar seus agendamentos, ou adicione clientes 
              para facilitar o processo de agendamento.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-white/60 mt-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Barbeiros podem gerenciar agendamentos</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Clientes podem fazer agendamentos</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span>Todos recebem acesso ao sistema</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Usuários */}
      <UsersList onCreateUser={() => handleCreateUser('barber')} />

      {/* Modal de Criação */}
      <UserForm
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        mode="create"
        defaultRole={createUserType}
      />
    </div>
  );
};

export default AdminUserManagement;