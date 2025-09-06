import React, { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAppointments } from '../../hooks/useAppointments';
import { useToast } from '../../hooks/useToast';
import type { Appointment, AppointmentStatus } from '../../types/appointments';
import type { UserRole } from '../../types/dashboard';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onCancel?: (appointmentId: string) => void;
  showActions?: boolean;
  compact?: boolean;
  role?: UserRole;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onEdit,
  onCancel,
  showActions = true,
  compact = false,
  role
}) => {
  const { user } = useAuth();
  const { cancelAppointment, updateAppointment } = useAppointments();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  // Format date for display
  const formatDate = useCallback((date: string): string => {
    return new Date(date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Format time for display
  const formatTime = useCallback((time: string): string => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }, []);

  // Format price for display
  const formatPrice = useCallback((price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }, []);

  // Get status color and text
  const getStatusInfo = useCallback((status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          text: 'Confirmado'
        };
      case 'pending':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30',
          text: 'Pendente'
        };
      case 'cancelled':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          text: 'Cancelado'
        };
      case 'completed':
        return {
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          text: 'Concluído'
        };
      case 'no_show':
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30',
          text: 'Não compareceu'
        };
      default:
        return {
          color: 'text-white/60',
          bgColor: 'bg-white/10',
          borderColor: 'border-white/20',
          text: status
        };
    }
  }, []);

  // Check if user can edit appointment
  const canEdit = useCallback((): boolean => {
    if (!user) return false;
    
    // Admin can edit any appointment
    if (role === 'admin') return true;
    
    // Barber can edit their own appointments
    if (role === 'barber' && appointment.barber_id === user.id) return true;
    
    // Customer can edit their own appointments (with time restrictions)
    if (role === 'customer' && appointment.client_id === user.id) {
      const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
      const now = new Date();
      const timeDiff = appointmentDateTime.getTime() - now.getTime();
      const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);
      
      // Can edit if appointment is more than 2 hours away
      return hoursUntilAppointment > 2 && appointment.status !== 'cancelled';
    }
    
    return false;
  }, [user, role, appointment]);

  // Check if user can cancel appointment
  const canCancel = useCallback((): boolean => {
    if (!user || appointment.status === 'cancelled') return false;
    
    // Admin can cancel any appointment
    if (role === 'admin') return true;
    
    // Barber can cancel their own appointments
    if (role === 'barber' && appointment.barber_id === user.id) return true;
    
    // Customer can cancel their own appointments (with time restrictions)
    if (role === 'customer' && appointment.client_id === user.id) {
      const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
      const now = new Date();
      const timeDiff = appointmentDateTime.getTime() - now.getTime();
      const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);
      
      // Can cancel if appointment is more than 2 hours away
      return hoursUntilAppointment > 2;
    }
    
    return false;
  }, [user, role, appointment]);

  // Handle appointment cancellation
  const handleCancel = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const result = await cancelAppointment(appointment.id);
      
      if (result) {
        setShowConfirmCancel(false);
        if (onCancel) {
          onCancel(appointment.id);
        }
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setIsLoading(false);
    }
  }, [appointment.id, cancelAppointment, onCancel]);

  // Handle status change (for barbers and admins)
  const handleStatusChange = useCallback(async (newStatus: AppointmentStatus) => {
    setIsLoading(true);
    
    try {
      const result = await updateAppointment(appointment.id, { status: newStatus } as any);
      
      if (result.success) {
        showToast(`Status alterado para ${getStatusInfo(newStatus).text}`, 'success');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [appointment.id, updateAppointment, showToast, getStatusInfo]);

  const statusInfo = getStatusInfo(appointment.status);
  const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
  const isPastAppointment = appointmentDateTime < new Date();

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden ${
      compact ? 'p-4' : 'p-6'
    } hover:bg-white/15 transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Service Name */}
          <h3 className={`font-semibold text-white ${
            compact ? 'text-lg' : 'text-xl'
          }`}>
            {appointment.service_name}
          </h3>
          
          {/* Date and Time */}
          <div className="flex items-center gap-2 mt-1 text-white/70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={compact ? 'text-sm' : 'text-base'}>
              {formatDate(appointment.appointment_date)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mt-1 text-white/70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={compact ? 'text-sm' : 'text-base'}>
              {formatTime(appointment.appointment_time)}
            </span>
            {appointment.duration_minutes && (
              <span className="text-white/50">({appointment.duration_minutes}min)</span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
          statusInfo.bgColor
        } ${statusInfo.borderColor} ${statusInfo.color}`}>
          {statusInfo.text}
        </div>
      </div>

      {/* Details */}
      {!compact && (
        <div className="space-y-3 mb-4">
          {/* Client Info (for barbers and admins) */}
          {(role === 'barber' || role === 'admin') && appointment.client_name && (
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Cliente: {appointment.client_name}</span>
            </div>
          )}

          {/* Barber Info (for customers and admins) */}
          {(role === 'customer' || role === 'admin') && appointment.barber_name && (
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Barbeiro: {appointment.barber_name}</span>
            </div>
          )}

          {/* Price */}
          {appointment.price && (
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>{formatPrice(appointment.price)}</span>
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.901-6.06 2.377M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-white/80 text-sm">{appointment.notes}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (canEdit() || canCancel() || (role === 'barber' || role === 'admin')) && (
        <div className="flex items-center gap-2 pt-4 border-t border-white/10">
          {/* Edit Button */}
          {canEdit() && onEdit && (
            <button
              onClick={() => onEdit(appointment)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm">Editar</span>
            </button>
          )}

          {/* Cancel Button */}
          {canCancel() && (
            <button
              onClick={() => setShowConfirmCancel(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm">Cancelar</span>
            </button>
          )}

          {/* Status Actions (for barbers and admins) */}
          {(role === 'barber' || role === 'admin') && !isPastAppointment && appointment.status !== 'cancelled' && (
            <div className="flex items-center gap-2 ml-auto">
              {appointment.status === 'pending' && (
                <button
                  onClick={() => handleStatusChange('confirmed')}
                  disabled={isLoading}
                  className="flex items-center gap-1 px-3 py-2 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Confirmar</span>
                </button>
              )}
              
              {appointment.status === 'confirmed' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  disabled={isLoading}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Concluir</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showConfirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirmCancel(false)} />
          <div className="relative bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Confirmar Cancelamento</h3>
            <p className="text-white/80 mb-6">
              Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Manter
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Cancelando...' : 'Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;