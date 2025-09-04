import React, { useState, useEffect, useCallback } from 'react';
import { useAppointments } from '../../hooks/useAppointments';
import type { TimeSlot } from '../../types/appointments';

interface TimeSlotPickerProps {
  date: string;
  barberId: string;
  serviceDuration: number;
  selectedTime?: string;
  onTimeSelect: (timeSlot: TimeSlot) => void;
  error?: string;
  excludeAppointmentId?: string; // Para edição, excluir o próprio agendamento
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  date,
  barberId,
  serviceDuration,
  selectedTime,
  onTimeSelect,
  error,
  excludeAppointmentId
}) => {
  const { generateTimeSlots } = useAppointments();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate and check availability for time slots
  const loadTimeSlots = useCallback(async () => {
    if (!date || !barberId || !serviceDuration) {
      setTimeSlots([]);
      return;
    }

    setLoading(true);

    try {
      // Generate time slots with availability check
      const generatedSlots = await generateTimeSlots(
        date,
        barberId,
        serviceDuration
      );
      setTimeSlots(generatedSlots);
    } catch (error) {
      console.error('Error loading time slots:', error);
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  }, [date, barberId, serviceDuration, excludeAppointmentId, generateTimeSlots]);

  // Load time slots when dependencies change
  useEffect(() => {
    loadTimeSlots();
  }, [loadTimeSlots]);

  // Handle time slot selection
  const handleSlotClick = useCallback((slot: TimeSlot) => {
    if (slot.available) {
      onTimeSelect(slot);
    }
  }, [onTimeSelect]);

  // Format time for display
  const formatTime = useCallback((time: string): string => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }, []);

  // Get slot style based on availability and selection
  const getSlotStyle = useCallback((slot: TimeSlot): string => {
    const baseStyle = 'px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border';
    
    if (!slot.available) {
      return `${baseStyle} bg-red-500/20 border-red-500/30 text-red-300 cursor-not-allowed opacity-50`;
    }
    
    if (selectedTime === slot.time) {
      return `${baseStyle} bg-purple-500/30 border-purple-400 text-purple-100 shadow-lg`;
    }
    
    return `${baseStyle} bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30`;
  }, [selectedTime]);

  // Group time slots by period
  const groupedSlots = React.useMemo(() => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    timeSlots.forEach(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  }, [timeSlots]);

  // Render time slot group
  const renderSlotGroup = useCallback((title: string, slots: TimeSlot[]) => {
    if (slots.length === 0) return null;

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white/80">{title}</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              onClick={() => handleSlotClick(slot)}
              disabled={!slot.available}
              className={getSlotStyle(slot)}
              title={slot.available ? 'Horário disponível' : 'Horário ocupado'}
            >
              {formatTime(slot.time)}
            </button>
          ))}
        </div>
      </div>
    );
  }, [handleSlotClick, getSlotStyle, formatTime]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-white/60">Carregando horários...</span>
        </div>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-white/60 mb-2">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">Nenhum horário disponível para esta data</p>
        </div>
      </div>
    );
  }

  const availableCount = timeSlots.filter(slot => slot.available).length;
  const totalCount = timeSlots.length;

  return (
    <div className="space-y-4">
      {/* Header with availability info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/60">
          {availableCount} de {totalCount} horários disponíveis
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-white/10 border border-white/20"></div>
            <span className="text-white/60">Disponível</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-purple-500/30 border border-purple-400"></div>
            <span className="text-white/60">Selecionado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30"></div>
            <span className="text-white/60">Ocupado</span>
          </div>
        </div>
      </div>

      {/* Time slots grouped by period */}
      <div className="space-y-6">
        {renderSlotGroup('Manhã', groupedSlots.morning)}
        {renderSlotGroup('Tarde', groupedSlots.afternoon)}
        {renderSlotGroup('Noite', groupedSlots.evening)}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      )}

      {/* Service duration info */}
      <div className="p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Duração do serviço: {serviceDuration} minutos</span>
        </div>
      </div>

      {/* Quick actions */}
      {availableCount > 0 && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const firstAvailable = timeSlots.find(slot => slot.available);
              if (firstAvailable) {
                handleSlotClick(firstAvailable);
              }
            }}
            className="px-3 py-2 text-xs bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            Primeiro disponível
          </button>
          <button
            type="button"
            onClick={() => {
              const morningSlots = groupedSlots.morning.filter(slot => slot.available);
              if (morningSlots.length > 0) {
                handleSlotClick(morningSlots[0]);
              }
            }}
            disabled={groupedSlots.morning.filter(slot => slot.available).length === 0}
            className="px-3 py-2 text-xs bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Manhã
          </button>
          <button
            type="button"
            onClick={() => {
              const afternoonSlots = groupedSlots.afternoon.filter(slot => slot.available);
              if (afternoonSlots.length > 0) {
                handleSlotClick(afternoonSlots[0]);
              }
            }}
            disabled={groupedSlots.afternoon.filter(slot => slot.available).length === 0}
            className="px-3 py-2 text-xs bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tarde
          </button>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;