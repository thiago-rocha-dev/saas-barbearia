import React from 'react';
import { cn } from '../../lib/utils';
import type { TimelineEvent } from '../../types/dashboard';

type TimelineVariant = 'default' | 'compact';
type EventStatus = 'completed' | 'pending' | 'confirmed' | 'cancelled' | 'upcoming' | 'current';

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
  variant?: TimelineVariant;
  showTime?: boolean;
  maxHeight?: number;
}

interface StatusColorConfig {
  bg: string;
  border: string;
  text: string;
  dot: string;
}

const Timeline: React.FC<TimelineProps> = ({
  events,
  className,
  variant = 'default',
  showTime = true,
  maxHeight
}) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getStatusColor = (status: EventStatus): StatusColorConfig => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/30',
          text: 'text-green-400',
          dot: 'bg-green-400'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          dot: 'bg-yellow-400'
        };
      case 'confirmed':
        return {
          bg: 'bg-cyan-500/20',
          border: 'border-cyan-500/30',
          text: 'text-cyan-400',
          dot: 'bg-cyan-400'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          text: 'text-red-400',
          dot: 'bg-red-400'
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          dot: 'bg-gray-400'
        };
    }
  };

  const getStatusLabel = (status: EventStatus): string => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'cancelled': return 'Cancelado';
      case 'upcoming': return 'Próximo';
      case 'current': return 'Atual';
      default: return status;
    }
  };

  const isEventToday = (date: Date): boolean => {
    const today: Date = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isEventUpcoming = (date: Date): boolean => {
    return date > new Date();
  };

  if (variant === 'compact') {
    return (
      <div className={cn(
        'glass-card backdrop-blur-lg bg-white/5 border border-white/10 p-4',
        className
      )}>
        <h3 className="text-lg font-semibold text-white mb-4">Próximos Agendamentos</h3>
        <div 
          className="space-y-3 overflow-y-auto"
          style={maxHeight ? { maxHeight: `${maxHeight}px` } : {}}
        >
          {events.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Nenhum agendamento hoje</p>
          ) : (
            events.map((event: TimelineEvent, index: number) => {
              const statusColor: StatusColorConfig = getStatusColor(event.status);
              return (
                <div
                  key={event.id}
                  className={cn(
                    'flex items-center space-x-3 p-3 rounded-lg border transition-all hover:scale-105',
                    statusColor.bg,
                    statusColor.border
                  )}
                >
                  <div className={cn(
                    'w-3 h-3 rounded-full flex-shrink-0',
                    statusColor.dot
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium truncate">{event.title}</p>
                      {showTime && (
                        <span className="text-xs text-gray-400 ml-2">
                          {formatTime(event.date)}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-400 truncate">{event.description}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'glass-card backdrop-blur-lg bg-white/5 border border-white/10 p-6',
      className
    )}>
      <h3 className="text-lg font-semibold text-white mb-6">Timeline do Dia</h3>
      
      <div 
        className="relative overflow-y-auto"
        style={maxHeight ? { maxHeight: `${maxHeight}px` } : {}}
      >
        {events.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-gray-400">Nenhum agendamento hoje</p>
            <p className="text-sm text-gray-500 mt-2">Aproveite para descansar!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event: TimelineEvent, index: number) => {
              const statusColor: StatusColorConfig = getStatusColor(event.status);
              const isLast: boolean = index === events.length - 1;
              const isToday: boolean = isEventToday(event.date);
              const isUpcoming: boolean = isEventUpcoming(event.date);
              
              return (
                <div key={event.id} className="relative">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-6 top-12 w-0.5 h-6 bg-gradient-to-b from-white/20 to-transparent" />
                  )}
                  
                  <div className="flex items-start space-x-4">
                    {/* Timeline dot */}
                    <div className="relative flex-shrink-0">
                      <div className={cn(
                        'w-12 h-12 rounded-full border-2 flex items-center justify-center',
                        statusColor.border,
                        statusColor.bg,
                        isUpcoming && 'animate-pulse'
                      )}>
                        <div className={cn(
                          'w-6 h-6 rounded-full',
                          statusColor.dot
                        )} />
                      </div>
                      {isToday && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center">
                          <span className="text-xs">!</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Event content */}
                    <div className={cn(
                      'flex-1 p-4 rounded-lg border transition-all hover:scale-105',
                      statusColor.bg,
                      statusColor.border
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold">{event.title}</h4>
                        <div className="flex items-center space-x-2">
                          {showTime && (
                            <span className="text-sm text-gray-300">
                              {formatTime(event.date)}
                            </span>
                          )}
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            statusColor.bg,
                            statusColor.text
                          )}>
                            {getStatusLabel(event.status)}
                          </span>
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                      )}
                      
                      {/* Event metadata */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(event.date)}</span>
                        {event.type && (
                          <span className="capitalize">{event.type}</span>
                        )}
                      </div>
                      
                      {/* Action buttons for upcoming events */}
                      {isUpcoming && event.status === 'confirmed' && (
                        <div className="flex items-center space-x-2 mt-3">
                          <button className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors">
                            Check-in
                          </button>
                          <button className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded text-xs hover:bg-yellow-500/30 transition-colors">
                            Reagendar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;