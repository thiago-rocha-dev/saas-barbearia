import React from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import type { QuickAction, UserRole } from '../../types/dashboard';

type QuickActionsVariant = 'default' | 'compact' | 'grid';
type ActionColor = 'gold' | 'cyan' | 'purple' | 'green' | 'red';

interface QuickActionsProps {
  className?: string;
  variant?: QuickActionsVariant;
  customActions?: QuickAction[];
  actions?: QuickAction[];
}

interface ColorClasses {
  bg: string;
  border: string;
  text: string;
  glow: string;
  hover: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  className,
  variant = 'default',
  customActions,
  actions
}) => {
  const { user } = useAuth();

  const getDefaultActions = (role: UserRole): QuickAction[] => {
    switch (role) {
      case 'admin':
        return [
          {
            id: 'new-barber',
            label: 'Novo Barbeiro',
            icon: '👨‍💼',
            color: 'gold',
            action: () => console.log('Novo barbeiro'),
            description: 'Cadastrar novo barbeiro'
          },
          {
            id: 'view-reports',
            label: 'Ver Relatórios',
            icon: '📊',
            color: 'cyan',
            action: () => console.log('Ver relatórios'),
            description: 'Acessar relatórios detalhados'
          },
          {
            id: 'settings',
            label: 'Configurações',
            icon: '⚙️',
            color: 'purple',
            action: () => console.log('Configurações'),
            description: 'Gerenciar configurações'
          },
          {
            id: 'backup',
            label: 'Backup',
            icon: '💾',
            color: 'green',
            action: () => console.log('Backup'),
            description: 'Fazer backup dos dados'
          }
        ];
      
      case 'barber':
        return [
          {
            id: 'check-in',
            label: 'Check-in Cliente',
            icon: '✅',
            color: 'green',
            action: () => console.log('Check-in'),
            description: 'Confirmar chegada do cliente'
          },
          {
            id: 'reschedule',
            label: 'Reagendar',
            icon: '📅',
            color: 'cyan',
            action: () => console.log('Reagendar'),
            description: 'Reagendar atendimento'
          },
          {
            id: 'finish-service',
            label: 'Finalizar Serviço',
            icon: '🏁',
            color: 'gold',
            action: () => console.log('Finalizar'),
            description: 'Concluir atendimento'
          },
          {
            id: 'break',
            label: 'Pausar',
            icon: '⏸️',
            color: 'purple',
            action: () => console.log('Pausar'),
            description: 'Fazer uma pausa'
          }
        ];
      
      case 'customer':
        return [
          {
            id: 'new-appointment',
            label: 'Novo Agendamento',
            icon: '📅',
            color: 'gold',
            action: () => console.log('Novo agendamento'),
            description: 'Agendar novo corte',
            featured: true
          },
          {
            id: 'reschedule',
            label: 'Reagendar',
            icon: '🔄',
            color: 'cyan',
            action: () => console.log('Reagendar'),
            description: 'Alterar agendamento'
          },
          {
            id: 'favorite-barber',
            label: 'Barbeiro Favorito',
            icon: '⭐',
            color: 'purple',
            action: () => console.log('Favorito'),
            description: 'Agendar com favorito'
          },
          {
            id: 'support',
            label: 'Suporte',
            icon: '💬',
            color: 'green',
            action: () => console.log('Suporte'),
            description: 'Falar com suporte'
          }
        ];
      
      default:
        return [];
    }
  };

  const actionsToRender: QuickAction[] = actions || customActions || (user ? getDefaultActions(user.role) : []);

  const getColorClasses = (color: ActionColor): ColorClasses => {
    switch (color) {
      case 'gold':
        return {
          bg: 'from-gold-500/20 to-yellow-600/20',
          border: 'border-gold-500/30',
          text: 'text-gold-400',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
          hover: 'hover:from-gold-500/30 hover:to-yellow-600/30'
        };
      case 'cyan':
        return {
          bg: 'from-cyan-500/20 to-blue-600/20',
          border: 'border-cyan-500/30',
          text: 'text-cyan-400',
          glow: 'shadow-[0_0_20px_rgba(0,245,255,0.3)]',
          hover: 'hover:from-cyan-500/30 hover:to-blue-600/30'
        };
      case 'purple':
        return {
          bg: 'from-purple-500/20 to-pink-600/20',
          border: 'border-purple-500/30',
          text: 'text-purple-400',
          glow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]',
          hover: 'hover:from-purple-500/30 hover:to-pink-600/30'
        };
      case 'green':
        return {
          bg: 'from-green-500/20 to-emerald-600/20',
          border: 'border-green-500/30',
          text: 'text-green-400',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
          hover: 'hover:from-green-500/30 hover:to-emerald-600/30'
        };
      default:
        return {
          bg: 'from-gray-500/20 to-gray-600/20',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          glow: 'shadow-[0_0_20px_rgba(156,163,175,0.3)]',
          hover: 'hover:from-gray-500/30 hover:to-gray-600/30'
        };
    }
  };

  if (variant === 'compact') {
    return (
      <div className={cn(
        'glass-card backdrop-blur-lg bg-white/5 border border-white/10 p-4',
        className
      )}>
        <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-2">
          {actionsToRender.map((action: QuickAction) => {
            const colorClasses: ColorClasses = getColorClasses(action.color);
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-300',
                  'hover:scale-105 group bg-gradient-to-r',
                  colorClasses.bg,
                  colorClasses.border,
                  colorClasses.hover
                )}
              >
                <span className="text-lg">{action.icon}</span>
                <span className="text-white text-sm font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn(
        'grid grid-cols-2 md:grid-cols-4 gap-4',
        className
      )}>
        {actionsToRender.map((action: QuickAction) => {
          const colorClasses: ColorClasses = getColorClasses(action.color);
          return (
            <button
              key={action.id}
              onClick={action.action}
              className={cn(
                'glass-card backdrop-blur-lg bg-gradient-to-br border transition-all duration-300',
                'hover:scale-105 group p-4 text-center',
                colorClasses.bg,
                colorClasses.border,
                colorClasses.glow,
                colorClasses.hover,
                action.featured && 'ring-2 ring-gold-500/50'
              )}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <h4 className="text-white font-semibold text-sm mb-1">{action.label}</h4>
              <p className="text-gray-400 text-xs">{action.description}</p>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn(
      'glass-card backdrop-blur-lg bg-white/5 border border-white/10 p-6',
      className
    )}>
      <h3 className="text-lg font-semibold text-white mb-6">Ações Rápidas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actionsToRender.map((action: QuickAction) => {
          const colorClasses: ColorClasses = getColorClasses(action.color);
          return (
            <button
              key={action.id}
              onClick={action.action}
              className={cn(
                'glass-card backdrop-blur-lg bg-gradient-to-br border transition-all duration-300',
                'hover:scale-105 group p-4 text-left',
                colorClasses.bg,
                colorClasses.border,
                colorClasses.glow,
                colorClasses.hover,
                action.featured && 'ring-2 ring-gold-500/50 relative overflow-hidden'
              )}
            >
              {action.featured && (
                <div className="absolute top-2 right-2">
                  <span className="bg-gold-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                    DESTAQUE
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <div className={cn(
                  'w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center',
                  'group-hover:bg-white/20 transition-colors'
                )}>
                  <span className="text-2xl">{action.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{action.label}</h4>
                  <p className="text-gray-400 text-sm">{action.description}</p>
                </div>
                <div className={cn(
                  'text-xl opacity-50 group-hover:opacity-100 transition-opacity',
                  colorClasses.text
                )}>
                  →
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;