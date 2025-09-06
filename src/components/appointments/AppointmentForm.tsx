import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAppointments } from '../../hooks/useAppointments';
import { useToast } from '../../hooks/useToast';
import type {
  Appointment,
  AppointmentFormData,
  Service,
  TimeSlot
} from '../../types/appointments';
import type { UserRole } from '../../types/dashboard';
import TimeSlotPicker from './TimeSlotPicker';
import ServiceSelector from './ServiceSelector';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  selectedDate?: Date;
  selectedTime?: string;
  barberId?: string;
  role?: UserRole;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  isOpen,
  onClose,
  appointment,
  selectedDate,
  selectedTime,
  barberId,
  role
}) => {
  const { user } = useAuth();
  const { createAppointment, updateAppointment, services, loading } = useAppointments();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<AppointmentFormData>({
    client_id: '',
    barber_id: barberId || '',
    service_id: '',
    appointment_date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    appointment_time: selectedTime || '',
    customer_name: '',
    customer_email: '',
    total_price: 0,
    notes: ''
  });

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when appointment or props change
  useEffect(() => {
    if (appointment) {
      setFormData({
        client_id: appointment.client_id,
        barber_id: appointment.barber_id,
        service_id: appointment.service_id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        customer_name: appointment.customer_name || '',
        customer_email: appointment.customer_email || '',
        total_price: appointment.total_price || 0,
        notes: appointment.notes || ''
      });
      
      const service = services.find(s => s.id === appointment.service_id);
      setSelectedService(service || null);
    } else {
      setFormData({
        client_id: role === 'customer' ? user?.id || '' : '',
        barber_id: barberId || '',
        service_id: '',
        appointment_date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        appointment_time: selectedTime || '',
        customer_name: '',
        customer_email: '',
        total_price: 0,
        notes: ''
      });
      setSelectedService(null);
    }
    setErrors({});
  }, [appointment, selectedDate, selectedTime, barberId, role, user?.id, services]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.barber_id) {
      newErrors.barber_id = 'Selecione um barbeiro';
    }

    if (!formData.service_id) {
      newErrors.service_id = 'Selecione um serviço';
    }

    if (!formData.appointment_date) {
      newErrors.appointment_date = 'Selecione uma data';
    } else {
      const selectedDate = new Date(formData.appointment_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.appointment_date = 'A data não pode ser no passado';
      }
    }

    if (!formData.appointment_time) {
      newErrors.appointment_time = 'Selecione um horário';
    }

    if (role === 'admin' && !formData.client_id) {
      newErrors.client_id = 'Selecione um cliente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, role]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      
      if (appointment) {
        // Update existing appointment
        result = await updateAppointment(appointment.id, formData);
      } else {
        // Create new appointment
        result = await createAppointment(formData);
      }

      if (result.success) {
        onClose();
      } else if (result.conflicts && result.conflicts.length > 0) {
        showToast('Conflito de horário detectado. Escolha outro horário.', 'error');
        setErrors({ appointment_time: 'Horário não disponível' });
      }
    } catch (error) {
      console.error('Error submitting appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [appointment, formData, validateForm, updateAppointment, createAppointment, onClose, showToast]);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof AppointmentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Handle service selection
  const handleServiceSelect = useCallback((service: Service) => {
    setSelectedService(service);
    handleInputChange('service_id', service.id);
  }, [handleInputChange]);

  // Handle time slot selection
  const handleTimeSlotSelect = useCallback((timeSlot: TimeSlot) => {
    handleInputChange('appointment_time', timeSlot.time);
  }, [handleInputChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white">
            {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Serviço *
            </label>
            <ServiceSelector
              services={services}
              selectedService={selectedService}
              onServiceSelect={handleServiceSelect}
              error={errors.service_id}
            />
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Data *
            </label>
            <input
              type="date"
              value={formData.appointment_date}
              onChange={(e) => handleInputChange('appointment_date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.appointment_date ? 'border-red-500' : 'border-white/20'
              }`}
            />
            {errors.appointment_date && (
              <p className="mt-1 text-sm text-red-400">{errors.appointment_date}</p>
            )}
          </div>

          {/* Time Slot Selection */}
          {formData.appointment_date && formData.barber_id && selectedService && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Horário *
              </label>
              <TimeSlotPicker
                date={formData.appointment_date}
                barberId={formData.barber_id}
                serviceDuration={selectedService.duration_minutes}
                selectedTime={formData.appointment_time}
                onTimeSelect={handleTimeSlotSelect}
                error={errors.appointment_time}
              />
            </div>
          )}

          {/* Barber Selection (for admin) */}
          {role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Barbeiro *
              </label>
              <select
                value={formData.barber_id}
                onChange={(e) => handleInputChange('barber_id', e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.barber_id ? 'border-red-500' : 'border-white/20'
                }`}
              >
                <option value="" className="bg-gray-800">Selecione um barbeiro</option>
                {/* TODO: Add barber options from user management */}
              </select>
              {errors.barber_id && (
                <p className="mt-1 text-sm text-red-400">{errors.barber_id}</p>
              )}
            </div>
          )}

          {/* Client Selection (for admin) */}
          {role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Cliente *
              </label>
              <select
                value={formData.client_id}
                onChange={(e) => handleInputChange('client_id', e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.client_id ? 'border-red-500' : 'border-white/20'
                }`}
              >
                <option value="" className="bg-gray-800">Selecione um cliente</option>
                {/* TODO: Add client options from user management */}
              </select>
              {errors.client_id && (
                <p className="mt-1 text-sm text-red-400">{errors.client_id}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              placeholder="Observações adicionais..."
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Service Info */}
          {selectedService && (
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <h3 className="font-medium text-white mb-2">Detalhes do Serviço</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Duração:</span>
                  <span className="text-white ml-2">{selectedService.duration_minutes} min</span>
                </div>
                <div>
                  <span className="text-white/60">Preço:</span>
                  <span className="text-white ml-2">R$ {selectedService.price.toFixed(2)}</span>
                </div>
              </div>
              {selectedService.description && (
                <p className="text-white/80 text-sm mt-2">{selectedService.description}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white font-medium hover:bg-white/20 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {appointment ? 'Atualizando...' : 'Criando...'}
                </div>
              ) : (
                appointment ? 'Atualizar Agendamento' : 'Criar Agendamento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;