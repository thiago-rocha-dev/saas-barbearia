import React, { useState } from 'react';
import { User, Phone, Mail, Clock, Save, Edit3, Camera } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useBarberData } from '../../hooks/useBarberData';
import { DAYS_OF_WEEK } from '../../types/barber';
import type { UpdateBarberProfileRequest, UpdateWorkingHoursRequest } from '../../types/barber';

export function BarberProfile() {
  const {
    profile,
    workingHours,
    loadingProfile,
    loadingWorkingHours,
    updatingProfile,
    updatingWorkingHours,
    updateProfile,
    updateWorkingHours
  } = useBarberData();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingHours, setIsEditingHours] = useState(false);
  
  const [profileForm, setProfileForm] = useState<UpdateBarberProfileRequest>({
    name: '',
    phone: '',
    avatar_url: ''
  });

  const [hoursForm, setHoursForm] = useState<UpdateWorkingHoursRequest[]>(
    DAYS_OF_WEEK.map(day => ({
      day_of_week: day.value,
      is_available: false,
      start_time: '09:00',
      end_time: '18:00',
      break_start: '12:00',
      break_end: '13:00'
    }))
  );

  // Atualizar formulários quando os dados carregarem
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  React.useEffect(() => {
    if (workingHours && workingHours.length > 0) {
      const formattedHours = DAYS_OF_WEEK.map(day => {
        const existingHour = workingHours.find(h => h.day_of_week === day.value);
        return existingHour ? {
          day_of_week: existingHour.day_of_week,
          is_available: existingHour.is_available,
          start_time: existingHour.start_time,
          end_time: existingHour.end_time,
          break_start: existingHour.break_start,
          break_end: existingHour.break_end
        } : {
          day_of_week: day.value,
          is_available: false,
          start_time: '09:00',
          end_time: '18:00',
          break_start: '12:00',
          break_end: '13:00'
        };
      });
      setHoursForm(formattedHours);
    }
  }, [workingHours]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile(profileForm);
    if (success) {
      setIsEditingProfile(false);
    }
  };

  const handleHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateWorkingHours(hoursForm);
    if (success) {
      setIsEditingHours(false);
    }
  };

  const updateHourField = (dayIndex: number, field: keyof UpdateWorkingHoursRequest, value: any) => {
    setHoursForm(prev => prev.map((hour, index) => 
      index === dayIndex ? { ...hour, [field]: value } : hour
    ));
  };

  if (loadingProfile || loadingWorkingHours) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
          <Button
            variant="outline"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            disabled={updatingProfile}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditingProfile ? 'Cancelar' : 'Editar'}
          </Button>
        </div>

        {/* Foto do perfil */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Foto do perfil" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            {isEditingProfile && (
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{profile?.name || 'Nome não informado'}</h3>
            <p className="text-gray-600">{profile?.email}</p>
            <p className="text-sm text-gray-500">Barbeiro</p>
          </div>
        </div>

        {/* Formulário de perfil */}
        {isEditingProfile ? (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome completo"
                icon={<User />}
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <Input
                label="Telefone"
                icon={<Phone />}
                value={profileForm.phone}
                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            <Input
              label="URL da foto"
              icon={<Camera />}
              value={profileForm.avatar_url}
              onChange={(e) => setProfileForm(prev => ({ ...prev, avatar_url: e.target.value }))}
              placeholder="https://exemplo.com/foto.jpg"
            />
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditingProfile(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updatingProfile}>
                {updatingProfile ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium">{profile?.name || 'Não informado'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="font-medium">{profile?.phone || 'Não informado'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Horários de trabalho */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Horários de Trabalho</h3>
          <Button
            variant="outline"
            onClick={() => setIsEditingHours(!isEditingHours)}
            disabled={updatingWorkingHours}
          >
            <Clock className="w-4 h-4 mr-2" />
            {isEditingHours ? 'Cancelar' : 'Editar'}
          </Button>
        </div>

        {isEditingHours ? (
          <form onSubmit={handleHoursSubmit} className="space-y-4">
            {DAYS_OF_WEEK.map((day, index) => {
              const dayHours = hoursForm[index];
              return (
                <div key={day.value} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{day.label}</h4>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={dayHours.is_available}
                        onChange={(e) => updateHourField(index, 'is_available', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Disponível</span>
                    </label>
                  </div>
                  
                  {dayHours.is_available && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Início</label>
                        <input
                          type="time"
                          value={dayHours.start_time}
                          onChange={(e) => updateHourField(index, 'start_time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Fim</label>
                        <input
                          type="time"
                          value={dayHours.end_time}
                          onChange={(e) => updateHourField(index, 'end_time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Pausa início</label>
                        <input
                          type="time"
                          value={dayHours.break_start || ''}
                          onChange={(e) => updateHourField(index, 'break_start', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Pausa fim</label>
                        <input
                          type="time"
                          value={dayHours.break_end || ''}
                          onChange={(e) => updateHourField(index, 'break_end', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditingHours(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updatingWorkingHours}>
                {updatingWorkingHours ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Horários
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day) => {
              const dayHours = workingHours?.find(h => h.day_of_week === day.value);
              return (
                <div key={day.value} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="font-medium text-gray-900">{day.label}</span>
                  {dayHours?.is_available ? (
                    <div className="text-sm text-gray-600">
                      {dayHours.start_time} - {dayHours.end_time}
                      {dayHours.break_start && dayHours.break_end && (
                        <span className="ml-2 text-gray-400">
                          (Pausa: {dayHours.break_start} - {dayHours.break_end})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Indisponível</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}