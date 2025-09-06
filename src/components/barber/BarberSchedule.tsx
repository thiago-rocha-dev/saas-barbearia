import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, AlertCircle, Minus } from 'lucide-react';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useBarberData } from '../../hooks/useBarberData';
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS } from '../../types/barber';
import type { BarberAppointment, TimeSlot } from '../../types/barber';

interface AppointmentCardProps {
  appointment: BarberAppointment;
  onStatusUpdate: (appointmentId: string, status: BarberAppointment['status']) => void;
  isUpdating: boolean;
}

function AppointmentCard({ appointment, onStatusUpdate, isUpdating }: AppointmentCardProps) {
  const statusColor = APPOINTMENT_STATUS_COLORS[appointment.status];
  const statusLabel = APPOINTMENT_STATUS_LABELS[appointment.status];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Remove segundos se houver
  };

  const getStatusIcon = (status: BarberAppointment['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'no_show':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold text-gray-900">{appointment.service_name}</h4>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
              {getStatusIcon(appointment.status)}
              <span className="ml-1">{statusLabel}</span>
            </span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{appointment.client_name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>{appointment.client_phone || 'Não informado'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
              <span className="text-gray-400">({appointment.service_duration} min)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-green-600">{formatCurrency(appointment.service_price)}</span>
            </div>
          </div>
          {appointment.notes && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
              <strong>Observações:</strong> {appointment.notes}
            </div>
          )}
        </div>
      </div>

      {appointment.status === 'scheduled' && (
        <div className="flex space-x-2 mt-3">
          <Button
            size="sm"
            onClick={() => onStatusUpdate(appointment.id, 'confirmed')}
            disabled={isUpdating}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Confirmar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusUpdate(appointment.id, 'cancelled')}
            disabled={isUpdating}
            className="flex-1"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
        </div>
      )}

      {appointment.status === 'confirmed' && (
        <div className="flex space-x-2 mt-3">
          <Button
            size="sm"
            onClick={() => onStatusUpdate(appointment.id, 'completed')}
            disabled={isUpdating}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Concluir
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusUpdate(appointment.id, 'no_show')}
            disabled={isUpdating}
            className="flex-1"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            Não compareceu
          </Button>
        </div>
      )}
    </div>
  );
}

interface TimeSlotCardProps {
  slot: TimeSlot;
  onBlock: (time: string, reason: string) => void;
  isBlocking: boolean;
}

function TimeSlotCard({ slot, onBlock, isBlocking }: TimeSlotCardProps) {
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  const handleBlock = () => {
    if (blockReason.trim()) {
      onBlock(slot.time, blockReason);
      setBlockReason('');
      setShowBlockForm(false);
    }
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  if (slot.appointment) {
    return null; // Agendamentos são mostrados separadamente
  }

  if (slot.blocked) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="font-medium text-red-900">{formatTime(slot.time)}</span>
          </div>
          <span className="text-sm text-red-600">{slot.block_reason}</span>
        </div>
      </div>
    );
  }

  if (!slot.available) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-500">{formatTime(slot.time)}</span>
          <span className="text-sm text-gray-400">Indisponível</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-green-600" />
          <span className="font-medium text-green-900">{formatTime(slot.time)}</span>
          <span className="text-sm text-green-600">Disponível</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowBlockForm(true)}
          disabled={isBlocking}
        >
          <Minus className="w-3 h-3" />
        </Button>
      </div>
      
      {showBlockForm && (
        <div className="mt-3 space-y-2">
          <input
            type="text"
            placeholder="Motivo do bloqueio"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleBlock}
              disabled={!blockReason.trim() || isBlocking}
              className="flex-1"
            >
              {isBlocking ? <LoadingSpinner size="sm" /> : 'Bloquear'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowBlockForm(false);
                setBlockReason('');
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BarberSchedule() {
  const {
    scheduleDay,
    appointments,
    loadingSchedule,
    loadingAppointments,
    updatingAppointment,
    blockingTime,
    loadScheduleDay,
    loadAppointments,
    updateAppointmentStatus,
    blockTime
  } = useBarberData();

  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [viewMode, setViewMode] = useState<'appointments' | 'schedule'>('appointments');

  // Carregar dados quando a data mudar
  useEffect(() => {
    loadScheduleDay(selectedDate);
    loadAppointments({
      date_from: selectedDate,
      date_to: selectedDate
    });
  }, [selectedDate, loadScheduleDay, loadAppointments]);

  const handleStatusUpdate = async (appointmentId: string, status: BarberAppointment['status']) => {
    await updateAppointmentStatus(appointmentId, status);
  };

  const handleBlockTime = async (time: string, reason: string) => {
    await blockTime({
      date: selectedDate,
      start_time: time,
      end_time: time, // Bloquear apenas este slot
      reason
    });
  };

  const todayAppointments = appointments.filter(apt => apt.appointment_date === selectedDate);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Minha Agenda</h2>
            <p className="text-gray-600">Gerencie seus agendamentos e horários</p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('appointments')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'appointments'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Agendamentos
              </button>
              <button
                onClick={() => setViewMode('schedule')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'schedule'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grade Horária
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo do dia */}
      {scheduleDay && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {scheduleDay.day_name}, {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </h3>
          
          {scheduleDay.is_working_day ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{scheduleDay.total_appointments}</div>
                <div className="text-sm text-gray-600">Agendamentos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(scheduleDay.total_revenue)}</div>
                <div className="text-sm text-gray-600">Receita</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {scheduleDay.working_hours?.start} - {scheduleDay.working_hours?.end}
                </div>
                <div className="text-sm text-gray-600">Horário de trabalho</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {scheduleDay.time_slots.filter(slot => slot.available).length}
                </div>
                <div className="text-sm text-gray-600">Horários livres</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Você não trabalha neste dia</p>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo principal */}
      {viewMode === 'appointments' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agendamentos do Dia</h3>
          
          {loadingAppointments ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : todayAppointments.length > 0 ? (
            <div className="space-y-4">
              {todayAppointments
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                .map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onStatusUpdate={handleStatusUpdate}
                    isUpdating={updatingAppointment}
                  />
                ))
              }
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento para este dia</p>
              <p className="text-sm mt-2">Seus agendamentos aparecerão aqui quando forem criados.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade de Horários</h3>
          
          {loadingSchedule ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : scheduleDay?.is_working_day ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {scheduleDay.time_slots.map((slot, index) => (
                <TimeSlotCard
                  key={index}
                  slot={slot}
                  onBlock={handleBlockTime}
                  isBlocking={blockingTime}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Você não trabalha neste dia</p>
              <p className="text-sm mt-2">Configure seus horários de trabalho no seu perfil.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}