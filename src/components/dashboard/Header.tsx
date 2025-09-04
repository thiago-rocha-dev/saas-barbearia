import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types/dashboard';

interface HeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  showNotifications?: boolean;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  actions?: React.ReactNode;
  role?: UserRole;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  className,
  showNotifications = true,
  showSearch = false,
  onSearch,
  actions
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          primary: 'text-gold-400',
          bg: 'from-gold-500/10 to-transparent',
          accent: 'bg-gold-500/20 border-gold-500/30'
        };
      case 'barber':
        return {
          primary: 'text-cyan-400',
          bg: 'from-cyan-500/10 to-transparent',
          accent: 'bg-cyan-500/20 border-cyan-500/30'
        };
      case 'customer':
        return {
          primary: 'text-purple-400',
          bg: 'from-purple-500/10 to-transparent',
          accent: 'bg-purple-500/20 border-purple-500/30'
        };
      default:
        return {
          primary: 'text-gray-400',
          bg: 'from-gray-500/10 to-transparent',
          accent: 'bg-gray-500/20 border-gray-500/30'
        };
    }
  };

  const roleColor = user ? getRoleColor(user.role) : getRoleColor('customer');

  // Mock notifications
  const notifications = [
    {
      id: '1',
      title: 'Novo agendamento',
      message: 'João Silva agendou um corte para hoje às 14:00',
      time: '5 min atrás',
      type: 'appointment',
      unread: true
    },
    {
      id: '2',
      title: 'Pagamento recebido',
      message: 'Pagamento de R$ 45,00 foi confirmado',
      time: '1 hora atrás',
      type: 'payment',
      unread: true
    },
    {
      id: '3',
      title: 'Avaliação recebida',
      message: 'Maria deu 5 estrelas para seu atendimento',
      time: '2 horas atrás',
      type: 'review',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment': return '📅';
      case 'payment': return '💰';
      case 'review': return '⭐';
      default: return '🔔';
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className={cn(
      'glass-card backdrop-blur-lg bg-gradient-to-r border-b border-white/10',
      roleColor.bg,
      'p-6 sticky top-0 z-30',
      className
    )}>
      <div className="flex items-center justify-between">
        {/* Left Section - Title */}
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {subtitle && (
                <p className="text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>
            
            {/* Live Time */}
            <div className={cn(
              'hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg border',
              roleColor.accent
            )}>
              <span className="text-lg">🕐</span>
              <div className="text-sm">
                <p className="text-white font-medium">{getCurrentTime()}</p>
                <p className="text-gray-400 text-xs">{getCurrentDate()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        {showSearch && (
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                🔍
              </div>
            </div>
          </div>
        )}

        {/* Right Section - Actions & Notifications */}
        <div className="flex items-center space-x-4">
          {/* Custom Actions */}
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}

          {/* Notifications */}
          {showNotifications && (
            <div className="relative">
              <button
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                className={cn(
                  'relative p-2 rounded-lg border transition-all hover:scale-105',
                  roleColor.accent,
                  showNotificationPanel && 'bg-white/20'
                )}
              >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {showNotificationPanel && (
                <div className="absolute right-0 top-12 w-80 glass-card backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg shadow-xl z-50">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-white font-semibold">Notificações</h3>
                    <p className="text-xs text-gray-400">{unreadCount} não lidas</p>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer',
                          notification.unread && 'bg-white/5'
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm">
                              {notification.title}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              {notification.message}
                            </p>
                            <p className="text-gray-500 text-xs mt-2">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 border-t border-white/10">
                    <button className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                      Ver todas as notificações
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Avatar */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-white font-medium text-sm">{user.name}</p>
                <p className={cn('text-xs capitalize', roleColor.primary)}>
                  {user.role}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;