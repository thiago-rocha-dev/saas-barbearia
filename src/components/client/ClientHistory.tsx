import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useToast } from '../ui/use-toast';
import { useClientData } from '../../hooks/useClientData';
import type { CreateReviewRequest, AppointmentFilters } from '../../types/client';
import {
  Calendar,
  Clock,
  Star,
  DollarSign,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientHistoryProps {
  appointmentHistory?: any[];
  loading?: boolean;
  onCreateReview?: (appointmentId: string, review: CreateReviewRequest) => Promise<boolean>;
  className?: string;
}

interface ReviewFormData {
  rating: number;
  comment: string;
  service_quality: number;
  punctuality: number;
  cleanliness: number;
  overall_experience: number;
  would_recommend: boolean;
}

export function ClientHistory({ 
  appointmentHistory: propHistory, 
  loading: propLoading, 
  onCreateReview,
  className 
}: ClientHistoryProps) {
  const { appointmentHistory: hookHistory, loading: hookLoading, actions } = useClientData();
  
  // Use props if provided, otherwise use hook data
  const appointmentHistory = propHistory || hookHistory;
  const loading = propLoading !== undefined ? { appointmentHistory: propLoading } : hookLoading;
  // const createReview = onCreateReview || actions.createReview;
  const createReview = onCreateReview;
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: 'completed',
    limit: 10,
    offset: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    rating: 5,
    comment: '',
    service_quality: 5,
    punctuality: 5,
    cleanliness: 5,
    overall_experience: 5,
    would_recommend: true
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  
  // Carregar histórico ao montar o componente
  useEffect(() => {
    if (actions?.loadAppointmentHistory) {
      actions.loadAppointmentHistory(filters);
    }
  }, [filters, actions]);
  
  // Filtrar histórico por termo de busca
  const filteredHistory = appointmentHistory.filter(appointment => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.barber_name.toLowerCase().includes(searchLower) ||
      appointment.service_name.toLowerCase().includes(searchLower)
    );
  });
  
  const handleFilterChange = (key: keyof AppointmentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset offset when changing filters
    }));
  };
  
  const handleLoadMore = () => {
    setFilters(prev => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 10)
    }));
  };
  
  const openReviewDialog = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setReviewForm({
      rating: 5,
      comment: '',
      service_quality: 5,
      punctuality: 5,
      cleanliness: 5,
      overall_experience: 5,
      would_recommend: true
    });
    setShowReviewDialog(true);
  };
  
  const handleReviewSubmit = async () => {
    if (!selectedAppointment) return;
    
    const review: CreateReviewRequest = {
      appointment_id: selectedAppointment,
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim() || undefined,
      service_quality: reviewForm.service_quality,
      punctuality: reviewForm.punctuality,
      cleanliness: reviewForm.cleanliness,
      overall_experience: reviewForm.overall_experience,
      would_recommend: reviewForm.would_recommend
    };
    
    setIsSubmittingReview(true);
    try {
      const success = createReview ? await createReview(selectedAppointment, review) : false;
      if (success) {
        setShowReviewDialog(false);
        setSelectedAppointment(null);
        toast({
          title: 'Sucesso!',
          description: 'Avaliação enviada com sucesso!'
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao enviar avaliação. Tente novamente.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao enviar avaliação',
        variant: 'destructive'
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
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
  
  const StarRating = ({ rating, onRatingChange, readonly = false }: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
  }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 cursor-pointer transition-colors ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${readonly ? 'cursor-default' : 'hover:text-yellow-400'}`}
            onClick={() => !readonly && onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };
  
  const isLoading = 'appointmentHistory' in loading ? loading.appointmentHistory : loading.history;
  
  if (isLoading && appointmentHistory.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900">Histórico de Agendamentos</h1>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status || 'completed'}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Concluídos</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                    <SelectItem value="no_show">Não Compareceu</SelectItem>
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
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Nenhum agendamento encontrado para sua busca' : 'Nenhum agendamento no histórico'}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Limpar busca
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={appointment.barber_avatar} alt={appointment.barber_name} />
                      <AvatarFallback>{appointment.barber_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{appointment.service_name}</h3>
                      <p className="text-gray-600">com {appointment.barber_name}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(appointment.appointment_date), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {appointment.start_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          R$ {appointment.service_price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusLabel(appointment.status)}
                    </Badge>
                  </div>
                </div>
                
                {/* Avaliação existente ou botão para avaliar */}
                {appointment.review ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Sua Avaliação</h4>
                      <StarRating rating={appointment.review.rating} readonly />
                    </div>
                    {appointment.review.comment && (
                      <p className="text-gray-700 mb-3">{appointment.review.comment}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Qualidade:</span>
                        <div className="flex items-center gap-1">
                          <StarRating rating={appointment.review.service_quality} readonly />
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Pontualidade:</span>
                        <div className="flex items-center gap-1">
                          <StarRating rating={appointment.review.punctuality} readonly />
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Limpeza:</span>
                        <div className="flex items-center gap-1">
                          <StarRating rating={appointment.review.cleanliness} readonly />
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Experiência:</span>
                        <div className="flex items-center gap-1">
                          <StarRating rating={appointment.review.overall_experience} readonly />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {appointment.review.would_recommend ? (
                        <>
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Recomendaria este barbeiro</span>
                        </>
                      ) : (
                        <>
                          <ThumbsDown className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-600">Não recomendaria este barbeiro</span>
                        </>
                      )}
                    </div>
                  </div>
                ) : appointment.can_review ? (
                  <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">Avalie este atendimento</p>
                      <p className="text-sm text-blue-700">Sua opinião é importante para nós!</p>
                    </div>
                    <Button onClick={() => openReviewDialog(appointment.id)}>
                      <Star className="h-4 w-4 mr-2" />
                      Avaliar
                    </Button>
                  </div>
                ) : null}
                
                {/* Observações do cliente */}
                {appointment.client_notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-sm text-gray-700 mb-1">Suas observações:</h5>
                    <p className="text-sm text-gray-600">{appointment.client_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Carregar mais */}
      {filteredHistory.length > 0 && filteredHistory.length >= (filters.limit || 10) && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
             className="flex items-center gap-2"
           >
             {isLoading ? (
              <>
                <RotateCcw className="h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                Carregar mais
              </>
            )}
          </Button>
        </div>
      )}
      
      {/* Dialog de Avaliação */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Avaliar Atendimento</DialogTitle>
            <DialogDescription>
              Compartilhe sua experiência para ajudar outros clientes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Avaliação Geral */}
            <div className="space-y-2">
              <Label>Avaliação Geral</Label>
              <div className="flex items-center gap-2">
                <StarRating
                  rating={reviewForm.rating}
                  onRatingChange={(rating) => setReviewForm(prev => ({ ...prev, rating }))}
                />
                <span className="text-sm text-gray-500">({reviewForm.rating}/5)</span>
              </div>
            </div>
            
            {/* Avaliações Específicas */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Qualidade do Serviço</Label>
                <StarRating
                  rating={reviewForm.service_quality}
                  onRatingChange={(rating) => setReviewForm(prev => ({ ...prev, service_quality: rating }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Pontualidade</Label>
                <StarRating
                  rating={reviewForm.punctuality}
                  onRatingChange={(rating) => setReviewForm(prev => ({ ...prev, punctuality: rating }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Limpeza</Label>
                <StarRating
                  rating={reviewForm.cleanliness}
                  onRatingChange={(rating) => setReviewForm(prev => ({ ...prev, cleanliness: rating }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Experiência Geral</Label>
                <StarRating
                  rating={reviewForm.overall_experience}
                  onRatingChange={(rating) => setReviewForm(prev => ({ ...prev, overall_experience: rating }))}
                />
              </div>
            </div>
            
            {/* Comentário */}
            <div className="space-y-2">
              <Label>Comentário (opcional)</Label>
              <Textarea
                placeholder="Conte-nos mais sobre sua experiência..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                rows={3}
              />
            </div>
            
            {/* Recomendação */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Recomendaria este barbeiro?</Label>
                <p className="text-sm text-gray-500">Ajude outros clientes</p>
              </div>
              <Switch
                checked={reviewForm.would_recommend}
                onCheckedChange={(checked: boolean) => setReviewForm(prev => ({ ...prev, would_recommend: checked }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
              disabled={isSubmittingReview}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}