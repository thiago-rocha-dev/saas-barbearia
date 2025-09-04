import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import type { SidebarMenuItem, UserRole } from '../../types/dashboard';

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
  role?: UserRole;
}

interface RoleColorConfig {
  primary: string;
  bg: string;
  border: string;
  glow: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  className,
  collapsed = false,
  onToggle
}) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(collapsed);

  const handleToggle = (): void => {
    setIsCollapsed(!isCollapsed);
    onToggle?.();
  };

  // Menu items based on user role
  const getMenuItems = (role: UserRole): SidebarMenuItem[] => {
    switch (role) {
      case 'admin':
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '📊',
            path: '/admin',
            badge: null
          },
          {
            id: 'barbers',
            label: 'Gerenciar Barbeiros',
            icon: '✂️',
            path: '/admin/barbers',
            badge: null
          },
          {
            id: 'schedules',
            label: 'Horários',
            icon: '🕐',
            path: '/admin/schedules',
            badge: null
          },
          {
            id: 'reports',
            label: 'Relatórios',
            icon: '📈',
            path: '/admin/reports',
            badge: null
          },
          {
            id: 'settings',
            label: 'Configurações',
            icon: '⚙️',
            path: '/admin/settings',
            badge: null
          }
        ];
      
      case 'barber':
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '📊',
            path: '/barber',
            badge: null
          },
          {
            id: 'schedule',
            label: 'Minha Agenda',
            icon: '📅',
            path: '/barber/schedule',
            badge: '3' // Mock badge for pending appointments
          },
          {
            id: 'clients',
            label: 'Clientes',
            icon: '👥',
            path: '/barber/clients',
            badge: null
          },
          {
            id: 'profile',
            label: 'Perfil',
            icon: '👤',
            path: '/barber/profile',
            badge: null
          },
          {
            id: 'availability',
            label: 'Disponibilidade',
            icon: '🕒',
            path: '/barber/availability',
            badge: null
          }
        ];
      
      case 'customer':
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '🏠',
            path: '/customer',
            badge: null
          },
          {
            id: 'appointments',
            label: 'Meus Agendamentos',
            icon: '📅',
            path: '/customer/appointments',
            badge: '1' // Mock badge for upcoming appointment
          },
          {
            id: 'history',
            label: 'Histórico',
            icon: '📋',
            path: '/customer/history',
            badge: null
          },
          {
            id: 'profile',
            label: 'Perfil',
            icon: '👤',
            path: '/customer/profile',
            badge: null
          },
          {
            id: 'favorites',
            label: 'Favoritos',
            icon: '⭐',
            path: '/customer/favorites',
            badge: null
          }
        ];
      
      default:
        return [];
    }
  };

  const menuItems: SidebarMenuItem[] = user ? getMenuItems(user.role) : [];

  const getRoleColor = (role: UserRole): RoleColorConfig => {
    switch (role) {
      case 'admin':
        return {
          primary: 'text-gold-400',
          bg: 'from-gold-500/20 to-yellow-600/20',
          border: 'border-gold-500/30',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]'
        };
      case 'barber':
        return {
          primary: 'text-cyan-400',
          bg: 'from-cyan-500/20 to-blue-600/20',
          border: 'border-cyan-500/30',
          glow: 'shadow-[0_0_20px_rgba(0,245,255,0.3)]'
        };
      case 'customer':
        return {
          primary: 'text-purple-400',
          bg: 'from-purple-500/20 to-pink-600/20',
          border: 'border-purple-500/30',
          glow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]'
        };
      default:
        return {
          primary: 'text-gray-400',
          bg: 'from-gray-500/20 to-gray-600/20',
          border: 'border-gray-500/30',
          glow: 'shadow-[0_0_20px_rgba(156,163,175,0.3)]'
        };
    }
  };

  const roleColor: RoleColorConfig = user ? getRoleColor(user.role) : getRoleColor('customer');

  const handleSignOut = async (): Promise<void> => {
    await signOut();
  };

  return (
    <div className={cn(
      'fixed left-0 top-0 h-full z-40 transition-all duration-300',
      'glass-card backdrop-blur-lg bg-gradient-to-b',
      roleColor.bg,
      roleColor.border,
      roleColor.glow,
      'border-r',
      isCollapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-white/20 to-white/10 rounded-lg flex items-center justify-center">
                <span className="text-lg">✂️</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">BarberPro</h2>
                <p className={cn('text-xs capitalize', roleColor.primary)}>
                  {user?.role || 'Dashboard'}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleToggle}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* User Profile */}
      {!isCollapsed && user && (
        <div className="p-4 border-b border-white/10">
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
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item: SidebarMenuItem) => {
            const isActive: boolean = location.pathname === item.path;
            
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200',
                    'hover:bg-white/10 group',
                    isActive && 'bg-white/20 border border-white/20',
                    isCollapsed && 'justify-center'
                  )}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="text-white font-medium flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-bold',
                          'bg-red-500 text-white min-w-[20px] text-center'
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className={cn(
            'flex items-center space-x-3 w-full px-3 py-2 rounded-lg',
            'hover:bg-red-500/20 transition-colors text-red-400',
            isCollapsed && 'justify-center'
          )}
        >
          <span className="text-xl">🚪</span>
          {!isCollapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;