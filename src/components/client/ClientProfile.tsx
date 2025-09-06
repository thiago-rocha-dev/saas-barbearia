import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/label';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

import { useToast } from '../ui/use-toast';
import { useClientData } from '../../hooks/useClientData';
import type { UpdateClientProfileRequest } from '../../types/client';
import {
  User,
  Edit3,
  Phone,
  Mail,
  Calendar,
  Bell,
  Clock,
  Star,
  Save,
  X,
  Camera
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientProfileProps {
  profile?: any;
  loading?: boolean;
  onUpdate?: (updates: UpdateClientProfileRequest) => Promise<boolean>;
  className?: string;
}

export function ClientProfile({ profile: propProfile, loading: propLoading, onUpdate, className }: ClientProfileProps) {
  const { profile: hookProfile, stats, loading: hookLoading, actions } = useClientData();
  
  // Use props if provided, otherwise use hook data
  const profile = propProfile || hookProfile;
  const loading = propLoading !== undefined ? { profile: propLoading } : hookLoading;
  const updateProfile = onUpdate || actions.updateProfile;
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateClientProfileRequest>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar formulário quando o perfil carregar
  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        phone: profile.phone || '',
        birth_date: profile.birth_date || '',
        preferences: profile.preferences || {
          notifications: {
            email: true,
            sms: false,
            push: true,
            reminder_hours: 24
          },
          booking: {
            preferred_time: 'morning',
            auto_confirm: false,
            favorite_barber_id: undefined
          }
        }
      });
    }
  }, [profile]);

  const handleInputChange = (field: keyof UpdateClientProfileRequest, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (category: string, field: string, value: any) => {
    setEditForm((prev: any) => ({
      ...prev,
      preferences: {
          ...prev.preferences,
          [category]: {
            ...(prev.preferences as any)?.[category],
            [field]: value
          }
        }
    }));
  };

  const handleSubmit = async () => {
    if (!editForm.name?.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome é obrigatório',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await updateProfile(editForm);
      if (success) {
        setIsEditing(false);
        toast({
          title: 'Sucesso',
          description: 'Perfil atualizado com sucesso!'
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao atualizar perfil',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao atualizar perfil',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditForm({
        name: profile.name || '',
        phone: profile.phone || '',
        birth_date: profile.birth_date || '',
        preferences: profile.preferences
      });
    }
  };

  if (loading.profile) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Erro ao carregar perfil</p>
        <Button onClick={actions.loadProfile} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <Button
          onClick={() => setIsEditing(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Edit3 className="h-4 w-4" />
          Editar Perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Pessoais */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar e Nome */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url} alt={profile.name} />
                    <AvatarFallback className="text-lg">
                      {profile.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{profile.name}</h3>
                  <p className="text-gray-500">{profile.email}</p>
                  {stats && (
                    <Badge variant="secondary" className="mt-1">
                      Cliente desde {format(new Date(stats.member_since), 'MMM yyyy', { locale: ptBR })}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Dados de Contato */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input value={profile.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </Label>
                  <Input
                    value={profile.phone || 'Não informado'}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data de Nascimento
                  </Label>
                  <Input
                    type="date"
                    value={profile.birth_date || ''}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  />
                </div>
              </div>

              {/* Preferências de Agendamento */}
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Preferências de Agendamento
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Horário Preferido</Label>
                    <Select
                      value={profile.preferences?.booking?.preferred_time || 'morning'}
                      disabled={!isEditing}
                      onValueChange={(value: string) => handlePreferenceChange('booking', 'preferred_time', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Manhã (8h - 12h)</SelectItem>
                        <SelectItem value="afternoon">Tarde (12h - 18h)</SelectItem>
                        <SelectItem value="evening">Noite (18h - 22h)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Confirmação Automática</Label>
                      <p className="text-sm text-gray-500">Confirmar agendamentos automaticamente</p>
                    </div>
                    <Switch
                      checked={profile.preferences?.booking?.auto_confirm || false}
                      disabled={!isEditing}
                      onCheckedChange={(checked: boolean) => handlePreferenceChange('booking', 'auto_confirm', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Preferências de Notificação */}
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email</Label>
                      <p className="text-sm text-gray-500">Receber notificações por email</p>
                    </div>
                    <Switch
                      checked={profile.preferences?.notifications?.email || false}
                      disabled={!isEditing}
                      onCheckedChange={(checked: boolean) => handlePreferenceChange('notifications', 'email', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS</Label>
                      <p className="text-sm text-gray-500">Receber notificações por SMS</p>
                    </div>
                    <Switch
                      checked={profile.preferences?.notifications?.sms || false}
                      disabled={!isEditing}
                      onCheckedChange={(checked: boolean) => handlePreferenceChange('notifications', 'sms', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push</Label>
                      <p className="text-sm text-gray-500">Receber notificações push</p>
                    </div>
                    <Switch
                      checked={profile.preferences?.notifications?.push || false}
                      disabled={!isEditing}
                      onCheckedChange={(checked: boolean) => handlePreferenceChange('notifications', 'push', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lembrete (horas antes)</Label>
                    <Select
                      value={String(profile.preferences?.notifications?.reminder_hours || 24)}
                      disabled={!isEditing}
                      onValueChange={(value: string) => handlePreferenceChange('notifications', 'reminder_hours', Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hora</SelectItem>
                        <SelectItem value="2">2 horas</SelectItem>
                        <SelectItem value="6">6 horas</SelectItem>
                        <SelectItem value="12">12 horas</SelectItem>
                        <SelectItem value="24">24 horas</SelectItem>
                        <SelectItem value="48">48 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="space-y-6">
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.total_appointments}
                    </div>
                    <div className="text-sm text-gray-500">Agendamentos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      R$ {stats.total_spent.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">Gasto Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.loyalty_points}
                    </div>
                    <div className="text-sm text-gray-500">Pontos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.average_rating_given.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">Avaliação Média</div>
                  </div>
                </div>

                {stats.favorite_barber && (
                  <>
                    <Separator />
                    <div>
                      <h5 className="font-medium mb-2">Barbeiro Favorito</h5>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={stats.favorite_barber.avatar_url} />
                          <AvatarFallback>
                            {stats.favorite_barber.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{stats.favorite_barber.name}</p>
                          <p className="text-xs text-gray-500">
                            {stats.favorite_barber.appointments_count} agendamentos
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {stats.favorite_service && (
                  <>
                    <Separator />
                    <div>
                      <h5 className="font-medium mb-2">Serviço Favorito</h5>
                      <p className="text-sm">{stats.favorite_service.name}</p>
                      <p className="text-xs text-gray-500">
                        {stats.favorite_service.times_booked} vezes
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}