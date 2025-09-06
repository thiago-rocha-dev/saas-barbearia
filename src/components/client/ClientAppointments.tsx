import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { useToast } from '../ui/use-toast';
import { useClientData } from '../../hooks/useClientData';
import type { AppointmentFilters } from '../../types/client';
import {
  Calendar,
  Clock,
  Scissors,
  DollarSign,
  MapPin,
  Phone,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  RefreshCw,
  Plus,
  Star
} from 'lucide-react';
import { format, isToday, isTomorrow, isThisWeek, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientAppointmentsProps {
  appointments?: any[];
  loading?: boolean;
  onCancel?: (appointmentId: string) => Promise<boolean>;
  onReschedule?: (appointmentId: string, newDateTime: string) => Promise<boolean>;
  className?: string;
  onCreateNew?: () => void;
}

export function ClientAppointments({ 
  appointments: propAppointments, 
  loading: propLoading, 
  onCancel, 
  className, 
  onCreateNew 
}: ClientAppointmentsProps) {
  const { appointments: hookAppointments, loading: hookLoading, actions } = useClientData();
  
  // Use props if provided, otherwise use hook data
  const appointments = propAppointments || hookAppointments;
  const loading = propLoading !== undefined ? { appointments: propLoading } : hookLoading;
  const cancelAppointment = onCancel || actions.cancelAppointment;
  // const rescheduleAppointment = onReschedule;
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: 'scheduled',
    limit: 20,
    offset: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Carregar agendamentos ao montar o componente
  useEffect(() => {
    if (actions?.loadAppointments) {
      actions.loadAppointments(filters);
    }
  }, [filters, actions]);
  
  // Filtrar agendamentos por termo de busca
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.barber_name.toLowerCase().includes(searchLower) ||
      appointment.service_name.toLowerCase().includes(searchLower)
    );
  });
  
  // Agrupar agendamentos por data
  const groupedAppointments = filteredAppointments.reduce((groups, appointment) => {
    const date = appointment.appointment_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {} as Record<string, typeof filteredAppointments>);
  
  // Ordenar datas
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );
  
  const handleFilterChange = (key: keyof AppointmentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0
    }));
  };
  
  const handleRefresh = () => {
    if (actions?.loadAppointments) {
      actions.loadAppointments(filters);
    }
  };
  
  const openDetailsDialog = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setShowDetailsDialog(true);
  };
  
  const handleCancelAppointment = async (appointmentId: string) => {
    setIsCancelling(true);
    try {
      const success = await cancelAppointment(appointmentId);
      if (success) {
        toast({
          title: 'Sucesso!',
          description: 'Agendamento cancelado com sucesso!'
        });
        // Recarregar lista
        if (actions?.loadAppointments) {
          actions.loadAppointments(filters);
        }
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao cancelar agendamento. Tente novamente.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao cancelar agendamento',
        variant: 'destructive'
      });
    } finally {
      setIsCancelling(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'confirmed':
        return 'Confirmado';
      case 'in_progress':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      case 'no_show':
        return 'Não Compareceu';
      default:
        return status;
    }
  };
  
  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return 'Hoje';
    } else if (isTomorrow(date)) {
      return 'Amanhã';
    } else if (isThisWeek(date)) {
      return format(date, "EEEE", { locale: ptBR });
    } else {
      return format(date, "dd 'de' MMM", { locale: ptBR });
    }
  };
  
  const canCancelAppointment = (appointment: any) => {
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
    const hoursUntilAppointment = differenceInHours(appointmentDateTime, new Date());
    return hoursUntilAppointment >= 2 && ['scheduled', 'confirmed'].includes(appointment.status);
  };
  
  const selectedAppointmentData = selectedAppointment 
    ? appointments.find(apt => apt.id === selectedAppointment)
    : null;
  
  if (loading.appointments && appointments.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meus Agendamentos</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading.appointments}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading.appointments ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {onCreateNew && (
            <Button onClick={onCreateNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          )}
        </div>
      </div>
      
      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status || 'scheduled'}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendados</SelectItem>
                    <SelectItem value="confirmed">Confirmados</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluídos</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por barbeiro ou serviço..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Lista de Agendamentos */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Nenhum agendamento encontrado para sua busca' : 'Nenhum agendamento encontrado'}
              </p>
              <div className="flex items-center justify-center gap-2">
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Limpar busca
                  </Button>
                )}
                {onCreateNew && (
                  <Button onClick={onCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Agendamento
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          sortedDates.map((date) => (
            <div key={date} className="space-y-4">
              {/* Header da Data */}
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {getDateLabel(date)}
                </h2>
                <span className="text-sm text-gray-500">
                  {format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
                <Separator className="flex-1" />
                <Badge variant="outline">
                  {groupedAppointments[date].length} agendamento{groupedAppointments[date].length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              {/* Agendamentos do Dia */}
              <div className="space-y-3">
                {groupedAppointments[date]
                  .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time))
                  .map((appointment: any) => (
                    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={appointment.barber_avatar} alt={appointment.barber_name} />
                              <AvatarFallback>{appointment.barber_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{appointment.service_name}</h3>
                                <Badge className={getStatusColor(appointment.status)}>
                                  {getStatusLabel(appointment.status)}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-2">com {appointment.barber_name}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {appointment.start_time} - {appointment.end_time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  R$ {appointment.service_price.toFixed(2)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Scissors className="h-4 w-4" />
                                  {appointment.service_duration} min
                                </span>
                                {appointment.barber_rating && (
                                  <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4" />
                                    {appointment.barber_rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Ações */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetailsDialog(appointment.id)}
                            >
                              Ver Detalhes
                            </Button>
                            {canCancelAppointment(appointment) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Não, manter</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleCancelAppointment(appointment.id)}
                                      disabled={isCancelling}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {isCancelling ? 'Cancelando...' : 'Sim, cancelar'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                        
                        {/* Observações do cliente */}
                        {appointment.client_notes && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-sm text-gray-700 mb-1">Suas observações:</h5>
                            <p className="text-sm text-gray-600">{appointment.client_notes}</p>
                          </div>
                        )}
                        
                        {/* Alertas importantes */}
                        {isToday(new Date(appointment.appointment_date)) && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Agendamento hoje!</span>
                            </div>
                            <p className="text-sm text-blue-700 mt-1">
                              Lembre-se de chegar com 10 minutos de antecedência.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                }
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Dialog de Detalhes */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
            <DialogDescription>
              Informações completas do seu agendamento
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointmentData && (
            <div className="space-y-4">
              {/* Serviço e Barbeiro */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedAppointmentData.barber_avatar} alt={selectedAppointmentData.barber_name} />
                  <AvatarFallback>{selectedAppointmentData.barber_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedAppointmentData.service_name}</h3>
                  <p className="text-gray-600">com {selectedAppointmentData.barber_name}</p>
                  <Badge className={getStatusColor(selectedAppointmentData.status)}>
                    {getStatusLabel(selectedAppointmentData.status)}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              {/* Informações do Agendamento */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Data</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(selectedAppointmentData.appointment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Horário</p>
                    <p className="text-sm text-gray-600">
                      {selectedAppointmentData.start_time} às {selectedAppointmentData.end_time}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Valor</p>
                    <p className="text-sm text-gray-600">
                      R$ {selectedAppointmentData.service_price.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Scissors className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Duração</p>
                    <p className="text-sm text-gray-600">
                      {selectedAppointmentData.service_duration} minutos
                    </p>
                  </div>
                </div>
                
                {selectedAppointmentData.barber_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Contato do Barbeiro</p>
                      <p className="text-sm text-gray-600">
                        {selectedAppointmentData.barber_phone}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedAppointmentData.barber_address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Endereço</p>
                      <p className="text-sm text-gray-600">
                        {selectedAppointmentData.barber_address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Observações */}
              {selectedAppointmentData.client_notes && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-2">Suas observações:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedAppointmentData.client_notes}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Fechar
            </Button>
            {selectedAppointmentData && canCancelAppointment(selectedAppointmentData) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    Cancelar Agendamento
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Não, manter</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        if (selectedAppointmentData) {
                          handleCancelAppointment(selectedAppointmentData.id);
                          setShowDetailsDialog(false);
                        }
                      }}
                      disabled={isCancelling}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isCancelling ? 'Cancelando...' : 'Sim, cancelar'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}