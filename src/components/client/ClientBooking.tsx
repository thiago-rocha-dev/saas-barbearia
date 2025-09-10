import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/Button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useToast } from '../ui/use-toast';
import { useClientData } from '../../hooks/useClientData';
import type { BookingRequest, AvailableBarber, AvailableService, AvailableTimeSlot } from '../../types/client';
import {
  Scissors,
  Star,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { format, addDays, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientBookingProps {
  availableBarbers?: AvailableBarber[];
  availableServices?: AvailableService[];
  availableTimeSlots?: AvailableTimeSlot[];
  loading?: boolean;
  onCreateBooking?: (booking: BookingRequest) => Promise<string | null>;
  onLoadBarbers?: () => Promise<void>;
  onLoadServices?: (barberId: string) => Promise<void>;
  onLoadTimeSlots?: (barberId: string, date: string) => Promise<void>;
  className?: string;
  onBookingComplete?: (appointmentId: string) => void;
}

type BookingStep = 'barber' | 'service' | 'datetime' | 'confirmation';

export function ClientBooking({ 
  availableBarbers: propBarbers,
  availableServices: propServices,
  availableTimeSlots: propTimeSlots,
  loading: propLoading,
  onLoadBarbers,
  onLoadServices,
  onLoadTimeSlots,
  className, 
  onBookingComplete 
}: ClientBookingProps) {
  const {
    availableBarbers: hookBarbers,
    availableServices: hookServices,
    availableTimeSlots: hookTimeSlots,
    loading: hookLoading,
    actions
  } = useClientData();
  
  // Use props if provided, otherwise use hook data
  const availableBarbers = propBarbers || hookBarbers;
  const availableServices = propServices || hookServices;
  const availableTimeSlots = propTimeSlots || hookTimeSlots;
  const loading = propLoading !== undefined ? { 
    barbers: propLoading, 
    services: propLoading, 
    timeSlots: propLoading 
  } : hookLoading;
  const createBooking = onCreateBooking || actions.createAppointment;
  const loadBarbers = onLoadBarbers || actions.loadAvailableBarbers;
  const loadServices = onLoadServices || actions.loadAvailableServices;
  const loadTimeSlots = onLoadTimeSlots || actions.loadAvailableTimeSlots;
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('barber');
  const [selectedBarber, setSelectedBarber] = useState<AvailableBarber | null>(null);
  const [selectedService, setSelectedService] = useState<AvailableService | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Gerar próximos 14 dias disponíveis
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, "EEE, dd 'de' MMM", { locale: ptBR }),
      isToday: isToday(date)
    };
  });
  
  // Carregar barbeiros ao montar o componente
  useEffect(() => {
    if (loadBarbers) {
      loadBarbers();
    }
  }, [loadBarbers]);
  
  // Carregar serviços quando barbeiro for selecionado
  useEffect(() => {
    if (selectedBarber && loadServices) {
      loadServices(selectedBarber.id);
    }
  }, [selectedBarber, loadServices]);
  
  // Carregar horários quando data for selecionada
  useEffect(() => {
    if (selectedBarber && selectedDate && loadTimeSlots) {
      loadTimeSlots(selectedBarber.id, selectedDate);
    }
  }, [selectedBarber, selectedDate]);
  
  const handleBarberSelect = (barber: AvailableBarber) => {
    setSelectedBarber(barber);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setCurrentStep('service');
  };
  
  const handleServiceSelect = (service: AvailableService) => {
    setSelectedService(service);
    setSelectedDate('');
    setSelectedTime('');
    setCurrentStep('datetime');
  };
  
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep('confirmation');
  };
  
  // TRAE_FIX: Implementação completa do agendamento com feedback visual adequado
  const handleConfirmBooking = async () => {
    if (!selectedBarber || !selectedService || !selectedDate || !selectedTime) {
      toast({
        title: 'Erro',
        description: 'Todos os campos são obrigatórios',
        variant: 'destructive'
      });
      return;
    }
    
    const booking: BookingRequest = {
      barber_id: selectedBarber.id,
      service_id: selectedService.id,
      appointment_date: selectedDate,
      start_time: selectedTime,
      notes: notes.trim() || undefined
    };
    
    setIsSubmitting(true);
    try {
      // TRAE_FIX: Implementação real da criação de agendamento
      const appointmentId = await createBooking(booking);
      if (appointmentId) {
        setShowConfirmation(true);
        toast({
          title: 'Sucesso!',
          description: 'Agendamento criado com sucesso!',
          variant: 'default'
        });
        onBookingComplete?.(appointmentId);
        // TRAE_FIX: Reset do formulário após sucesso
        setTimeout(() => {
          resetBooking();
        }, 2000);
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao criar agendamento. Tente novamente.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro inesperado ao criar agendamento',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetBooking = () => {
    setCurrentStep('barber');
    setSelectedBarber(null);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setNotes('');
    setShowConfirmation(false);
  };
  
  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'service':
        setCurrentStep('barber');
        break;
      case 'datetime':
        setCurrentStep('service');
        break;
      case 'confirmation':
        setCurrentStep('datetime');
        break;
    }
  };
  
  const getStepTitle = () => {
    switch (currentStep) {
      case 'barber':
        return 'Escolha o Barbeiro';
      case 'service':
        return 'Escolha o Serviço';
      case 'datetime':
        return 'Escolha Data e Horário';
      case 'confirmation':
        return 'Confirmar Agendamento';
      default:
        return 'Novo Agendamento';
    }
  };
  
  if (showConfirmation) {
    return (
      <div className={`max-w-md mx-auto ${className}`}>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Agendamento Confirmado!</h2>
            <p className="text-gray-600 mb-6">
              Seu agendamento foi criado com sucesso. Você receberá uma confirmação em breve.
            </p>
            <div className="space-y-2 text-sm text-left bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between">
                <span className="font-medium">Barbeiro:</span>
                <span>{selectedBarber?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Serviço:</span>
                <span>{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Data:</span>
                <span>{format(new Date(selectedDate), "dd 'de' MMMM", { locale: ptBR })}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Horário:</span>
                <span>{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Valor:</span>
                <span>R$ {selectedService?.price.toFixed(2)}</span>
              </div>
            </div>
            <Button onClick={resetBooking} className="w-full">
              Fazer Novo Agendamento
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header com navegação */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{getStepTitle()}</h1>
          {currentStep !== 'barber' && (
            <Button variant="outline" onClick={goToPreviousStep}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
        </div>
        
        {/* Progress indicator */}
        <div className="flex items-center space-x-2">
          {['barber', 'service', 'datetime', 'confirmation'].map((step, index) => {
            const isActive = currentStep === step;
            const isCompleted = ['barber', 'service', 'datetime', 'confirmation'].indexOf(currentStep) > index;
            
            return (
              <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isActive ? 'bg-blue-600 text-white' :
                  isCompleted ? 'bg-green-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`flex-1 h-1 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      {/* Conteúdo do passo atual */}
      <Card>
        <CardContent className="p-6">
          {/* Passo 1: Escolher Barbeiro */}
          {currentStep === 'barber' && (
            <div className="space-y-4">
              {loading.barbers ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableBarbers.map((barber) => (
                    <div
                      key={barber.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedBarber?.id === barber.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => handleBarberSelect(barber)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={barber.avatar_url} alt={barber.name} />
                          <AvatarFallback>{barber.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{barber.name}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">
                              {barber.rating.toFixed(1)} ({barber.total_reviews})
                            </span>
                          </div>
                        </div>
                      </div>
                      {barber.bio && (
                        <p className="text-sm text-gray-600 mb-2">{barber.bio}</p>
                      )}
                      {barber.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {barber.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Passo 2: Escolher Serviço */}
          {currentStep === 'service' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedBarber?.avatar_url} alt={selectedBarber?.name} />
                  <AvatarFallback>{selectedBarber?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedBarber?.name}</p>
                  <p className="text-sm text-gray-600">Barbeiro selecionado</p>
                </div>
              </div>
              
              {loading.services ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {availableServices.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedService?.id === service.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => handleServiceSelect(service)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Scissors className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="text-sm text-gray-600">{service.duration_minutes} minutos</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            R$ {service.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      {service.description && (
                        <p className="text-sm text-gray-600 mt-2">{service.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Passo 3: Escolher Data e Horário */}
          {currentStep === 'datetime' && (
            <div className="space-y-6">
              {/* Resumo da seleção */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedBarber?.avatar_url} alt={selectedBarber?.name} />
                    <AvatarFallback>{selectedBarber?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedBarber?.name}</p>
                    <p className="text-sm text-gray-600">Barbeiro</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Scissors className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedService?.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedService?.duration_minutes}min - R$ {selectedService?.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Seleção de Data */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Escolha a Data</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {availableDates.map((dateOption) => (
                    <Button
                      key={dateOption.date}
                      variant={selectedDate === dateOption.date ? 'primary' : 'outline'}
                      className={`h-auto p-3 flex flex-col items-center ${
                        dateOption.isToday ? 'border-blue-500' : ''
                      }`}
                      onClick={() => handleDateSelect(dateOption.date)}
                    >
                      <span className="text-sm font-medium">{dateOption.label}</span>
                      {dateOption.isToday && (
                        <span className="text-xs text-blue-600">Hoje</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Seleção de Horário */}
              {selectedDate && (
                <div>
                  <Label className="text-base font-semibold mb-3 block">Escolha o Horário</Label>
                  {loading.timeSlots ? (
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="animate-pulse h-10 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {availableTimeSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? 'primary' : 'outline'}
                          disabled={!slot.available}
                          className={`h-10 text-sm ${
                            !slot.available ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => slot.available && handleTimeSelect(slot.time)}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  )}
                  {availableTimeSlots.length === 0 && !loading.timeSlots && (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Nenhum horário disponível para esta data</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Passo 4: Confirmação */}
          {currentStep === 'confirmation' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Confirme os detalhes do seu agendamento</h3>
              
              {/* Resumo completo */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Barbeiro:</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedBarber?.avatar_url} alt={selectedBarber?.name} />
                      <AvatarFallback className="text-xs">{selectedBarber?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{selectedBarber?.name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Serviço:</span>
                  <span>{selectedService?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Data:</span>
                  <span>{format(new Date(selectedDate), "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Horário:</span>
                  <span>{selectedTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Duração:</span>
                  <span>{selectedService?.duration_minutes} minutos</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {selectedService?.price.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Alguma observação especial para o barbeiro?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              
              {/* Botão de confirmação */}
              <Button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="w-full h-12 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Confirmar Agendamento
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}