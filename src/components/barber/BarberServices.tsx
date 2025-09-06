import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Clock, DollarSign, Save, X, Scissors, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useBarberData } from '../../hooks/useBarberData';
import { SERVICE_CATEGORIES } from '../../types/barber';
import type { BarberService, CreateServiceRequest, UpdateServiceRequest } from '../../types/barber';

interface ServiceCardProps {
  service: BarberService;
  onEdit: (service: BarberService) => void;
  onDelete: (serviceId: string) => void;
  isDeleting: boolean;
}

function ServiceCard({ service, onEdit, onDelete, isDeleting }: ServiceCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'corte':
        return <Scissors className="w-5 h-5" />;
      case 'barba':
        return <Star className="w-5 h-5" />;
      default:
        return <Scissors className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'corte':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'barba':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'combo':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'tratamento':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg border ${getCategoryColor(service.category || 'outros')}`}>
              {getCategoryIcon(service.category || 'outros')}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
              <span className="text-sm text-gray-500 capitalize">{service.category}</span>
            </div>
          </div>
          
          {service.description && (
            <p className="text-gray-600 text-sm mb-3">{service.description}</p>
          )}
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{service.duration_minutes} min</span>
            </div>
            <div className="flex items-center space-x-1 text-green-600 font-semibold">
              <DollarSign className="w-4 h-4" />
              <span>{formatCurrency(service.price)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(service)}
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => service.id && onDelete(service.id)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {isDeleting ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ServiceFormProps {
  service?: BarberService;
  onSubmit: (data: CreateServiceRequest | UpdateServiceRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function ServiceForm({ service, onSubmit, onCancel, isSubmitting }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || 'corte',
    duration: service?.duration_minutes || 30,
    price: service?.price || 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {service ? 'Editar Serviço' : 'Novo Serviço'}
        </h3>
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome do serviço"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Ex: Corte masculino"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {SERVICE_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Descreva o serviço oferecido..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duração (minutos)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => updateField('duration', parseInt(e.target.value) || 0)}
              min="15"
              max="240"
              step="15"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço (R$)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {service ? 'Atualizar' : 'Criar'} Serviço
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function BarberServices() {
  const {
    services,
    loadingServices,
    managingService,
    createService,
    updateService,
    deleteService
  } = useBarberData();

  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<BarberService | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleCreateService = async (data: CreateServiceRequest | UpdateServiceRequest) => {
    const success = await createService(data as CreateServiceRequest);
    if (success) {
      setShowForm(false);
    }
  };

  const handleUpdateService = async (data: CreateServiceRequest | UpdateServiceRequest) => {
    if (!editingService?.id) return;
    
    const success = await updateService(editingService.id, data as UpdateServiceRequest);
    if (success) {
      setEditingService(null);
      setShowForm(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    setDeletingServiceId(serviceId);
    await deleteService(serviceId);
    setDeletingServiceId(null);
  };

  const handleEditService = (service: BarberService) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingService(null);
  };

  const filteredServices = filterCategory === 'all' 
    ? services 
    : services.filter(service => service.category === filterCategory);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loadingServices) {
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Meus Serviços</h2>
            <p className="text-gray-600">Gerencie os serviços que você oferece</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas as categorias</option>
              {SERVICE_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <Button onClick={() => setShowForm(true)} disabled={showForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </div>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Serviços</p>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-50 text-green-600 border border-green-200">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Preço Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.length > 0 
                  ? formatCurrency(services.reduce((sum, s) => sum + s.price, 0) / services.length)
                  : 'R$ 0,00'
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Duração Média</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.length > 0 
                  ? Math.round(services.reduce((sum, s) => sum + s.duration_minutes, 0) / services.length)
                  : 0
                } min
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Mais Caro</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.length > 0 
                  ? formatCurrency(Math.max(...services.map(s => s.price)))
                  : 'R$ 0,00'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de criação/edição */}
      {showForm && (
        <ServiceForm
          service={editingService || undefined}
          onSubmit={editingService ? handleUpdateService : handleCreateService}
          onCancel={handleCancelForm}
          isSubmitting={managingService}
        />
      )}

      {/* Lista de serviços */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Serviços {filterCategory !== 'all' && `- ${SERVICE_CATEGORIES.find(c => c.value === filterCategory)?.label}`}
        </h3>
        
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={handleEditService}
                onDelete={handleDeleteService}
                isDeleting={deletingServiceId === service.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Scissors className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum serviço encontrado</p>
            <p className="text-sm mt-2">
              {filterCategory === 'all' 
                ? 'Comece criando seu primeiro serviço.'
                : 'Nenhum serviço encontrado nesta categoria.'
              }
            </p>
            {filterCategory === 'all' && (
              <Button 
                className="mt-4" 
                onClick={() => setShowForm(true)}
                disabled={showForm}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Serviço
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}