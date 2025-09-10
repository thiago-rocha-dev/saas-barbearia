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
  onCreateBooking,
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
              ) : availableBarbers.length === 0 ? (
                // TRAE_FIX: Fallback amigável quando não há barbeiros disponíveis
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Scissors className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum barbeiro disponível no momento
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Não encontramos barbeiros ativos para agendamento. Entre em contato com o suporte ou tente novamente mais tarde.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => loadBarbers()}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4" />
                      Tentar Novamente
                    </Button>
                    <Button 
                      variant="primary"
                      onClick={() => window.open('mailto:suporte@barberpro.com', '_blank')}
                    >
                      Contatar Suporte
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableBarbers.map((barber) => {
                    // TRAE_FIX-card: Safe rendering com fallbacks para todos os campos
                    const barberName = barber.name || 'Nome não informado';
                    const barberRating = barber.rating || 0;
                    const barberReviews = barber.total_reviews || 0;
                    const barberBio = barber.bio || '';
                    const barberSpecialties = barber.specialties || [];
                    const barberAvatar = barber.avatar_url || '';
                    
                    // TRAE_FIX-card: Fallback para iniciais do nome
                    const getInitials = (name: string) => {
                      return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
                    };
                    
                    return (
                      <div
                        key={barber.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md hover:border-blue-300 ${
                          selectedBarber?.id === barber.id 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-200 bg-white'
                        }`}
                        onClick={() => handleBarberSelect(barber)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-12 w-12 border-2 border-gray-100">
                            {/* TRAE_FIX-card: Avatar com fallback seguro */}
                            <AvatarImage 
                              src={barberAvatar} 
                              alt={barberName}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                              {getInitials(barberName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            {/* TRAE_FIX-card: Nome com truncate para evitar overflow */}
                            <h3 className="font-semibold text-gray-900 truncate">{barberName}</h3>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current flex-shrink-0" />
                              <span className="text-sm text-gray-600">
                                {/* TRAE_FIX-card: Rating com fallback seguro */}
                                {barberRating > 0 ? barberRating.toFixed(1) : 'N/A'} 
                                ({barberReviews > 0 ? barberReviews : 0})
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* TRAE_FIX-card: Bio com renderização condicional segura */}
                        {barberBio && barberBio.trim() && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{barberBio}</p>
                        )}
                        {/* TRAE_FIX-card: Especialidades com verificação de array */}
                        {barberSpecialties && barberSpecialties.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {barberSpecialties.slice(0, 3).map((specialty, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                                {specialty || 'Especialidade'}
                              </Badge>
                            ))}
                            {barberSpecialties.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{barberSpecialties.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {/* Passo 2: Escolher Serviço */}
          {currentStep === 'service' && (
            <div className="space-y-4">
              {/* TRAE_FIX-nav: Header com barbeiro selecionado - renderização segura */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={selectedBarber?.avatar_url || ''} 
                    alt={selectedBarber?.name || 'Barbeiro'} 
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                    {selectedBarber?.name ? selectedBarber.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2) : 'BB'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedBarber?.name || 'Barbeiro selecionado'}</p>
                  <p className="text-sm text-gray-600">Barbeiro selecionado</p>
                </div>
              </div>
              
              {loading.services ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              ) : availableServices.length === 0 ? (
                // TRAE_FIX-nav: Fallback amigável quando não há serviços disponíveis
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Scissors className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum serviço disponível
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Este barbeiro não possui serviços cadastrados no momento. Escolha outro barbeiro ou entre em contato com o suporte.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setCurrentStep('barber');
                        setSelectedBarber(null);
                      }}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Escolher Outro Barbeiro
                    </Button>
                    <Button 
                       variant="primary"
                       onClick={() => selectedBarber && loadServices && loadServices(selectedBarber.id)}
                       className="flex items-center gap-2"
                     >
                       <Loader2 className="h-4 w-4" />
                       Tentar Novamente
                     </Button>
                  </div>
                </div>
              ) : (
                // TRAE_FIX-nav: Lista de serviços com renderização segura
                <>
                  <div className="space-y-3">
                    {availableServices.map((service) => {
                      // TRAE_FIX-nav: Safe rendering para serviços
                      const serviceName = service.name || 'Serviço';
                      const serviceDuration = service.duration_minutes || 0;
                      const servicePrice = service.price || 0;
                      const serviceDescription = service.description || '';
                      
                      return (
                        <div
                          key={service.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md hover:border-blue-300 ${
                            selectedService?.id === service.id 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 bg-white'
                          }`}
                          onClick={() => handleServiceSelect(service)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                <Scissors className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 truncate">{serviceName}</h3>
                                <p className="text-sm text-gray-600">
                                  {serviceDuration > 0 ? `${serviceDuration} minutos` : 'Duração não informada'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-lg font-bold text-green-600">
                                R$ {servicePrice.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          {serviceDescription && serviceDescription.trim() && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{serviceDescription}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* TRAE_FIX-nav: Botão de navegação sempre visível */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setCurrentStep('barber');
                        setSelectedService(null);
                      }}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Voltar
                    </Button>
                    
                    {selectedService && (
                      <Button 
                        onClick={() => setCurrentStep('datetime')}
                        className="flex items-center gap-2"
                      >
                        Próximo: Data e Horário
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </Button>
                    )}
                  </div>
                </>
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
                    // TRAE_FIX-ux: Feedback amigável quando não há horários disponíveis
                    <div className="text-center py-12">
                      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhum horário disponível
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Não há horários livres para {format(new Date(selectedDate), "EEEE, dd 'de' MMMM", { locale: ptBR })}. 
                        Tente escolher outra data ou entre em contato conosco.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedDate('');
                            setSelectedTime('');
                          }}
                          className="flex items-center gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Escolher Outra Data
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setCurrentStep('barber');
                            setSelectedBarber(null);
                            setSelectedService(null);
                            setSelectedDate('');
                            setSelectedTime('');
                          }}
                          className="flex items-center gap-2"
                        >
                          <Scissors className="h-4 w-4" />
                          Escolher Outro Barbeiro
                        </Button>
                      </div>
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