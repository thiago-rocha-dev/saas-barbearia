import React, { useState, useCallback } from 'react';
import type { Service } from '../../types/appointments';

interface ServiceSelectorProps {
  services: Service[];
  selectedService: Service | null;
  onServiceSelect: (service: Service) => void;
  error?: string;
  disabled?: boolean;
  showPrices?: boolean;
  layout?: 'grid' | 'list';
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedService,
  onServiceSelect,
  error,
  disabled = false,
  showPrices = true,
  layout = 'grid'
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter services based on search term
  const filteredServices = React.useMemo(() => {
    if (!searchTerm) return services;
    
    return services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [services, searchTerm]);

  // Handle service selection
  const handleServiceClick = useCallback((service: Service) => {
    if (!disabled) {
      onServiceSelect(service);
    }
  }, [disabled, onServiceSelect]);

  // Format price for display
  const formatPrice = useCallback((price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }, []);

  // Format duration for display
  const formatDuration = useCallback((minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  }, []);

  // Get service card style
  const getServiceCardStyle = useCallback((service: Service): string => {
    const baseStyle = 'p-4 rounded-lg border transition-all duration-200 cursor-pointer';
    
    if (disabled) {
      return `${baseStyle} bg-white/5 border-white/10 text-white/50 cursor-not-allowed`;
    }
    
    if (selectedService?.id === service.id) {
      return `${baseStyle} bg-purple-500/20 border-purple-400 text-white shadow-lg`;
    }
    
    return `${baseStyle} bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30`;
  }, [selectedService, disabled]);

  // Render service card
  const renderServiceCard = useCallback((service: Service) => {
    return (
      <div
        key={service.id}
        onClick={() => handleServiceClick(service)}
        className={getServiceCardStyle(service)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            handleServiceClick(service);
          }
        }}
      >
        {/* Service Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-lg">{service.name}</h3>
          {selectedService?.id === service.id && (
            <div className="flex-shrink-0 ml-2">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Service Description */}
        {service.description && (
          <p className="text-sm text-white/70 mb-3 line-clamp-2">
            {service.description}
          </p>
        )}

        {/* Service Details */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            {/* Duration */}
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white/80">{formatDuration(service.duration_minutes)}</span>
            </div>

            {/* Category */}
            {service.category && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-white/60 text-xs">{service.category}</span>
              </div>
            )}
          </div>

          {/* Price */}
          {showPrices && (
            <div className="font-medium text-purple-300">
              {formatPrice(service.price)}
            </div>
          )}
        </div>

        {/* Popular/Featured Badge */}
        {service.is_popular && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Popular
            </span>
          </div>
        )}
      </div>
    );
  }, [handleServiceClick, getServiceCardStyle, selectedService, formatDuration, formatPrice, showPrices, disabled]);

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-white/60 mb-2">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm">Nenhum serviço disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {services.length > 3 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      )}

      {/* Services Grid/List */}
      <div className={`${
        layout === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 gap-4' 
          : 'space-y-3'
      }`}>
        {filteredServices.map(renderServiceCard)}
      </div>

      {/* No Results */}
      {filteredServices.length === 0 && searchTerm && (
        <div className="text-center py-6">
          <div className="text-white/60">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.901-6.06 2.377M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">Nenhum serviço encontrado para "{searchTerm}"</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      )}

      {/* Selected Service Summary */}
      {selectedService && (
        <div className="p-4 bg-purple-500/10 backdrop-blur-sm rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-purple-300 font-medium">Serviço Selecionado</span>
          </div>
          <div className="text-white">
            <div className="font-medium">{selectedService.name}</div>
            <div className="text-sm text-white/70 mt-1">
              {formatDuration(selectedService.duration_minutes)}
              {showPrices && (
                <span className="ml-2">• {formatPrice(selectedService.price)}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Service Count */}
      <div className="text-center text-xs text-white/50">
        {filteredServices.length} de {services.length} serviços
        {searchTerm && ` para "${searchTerm}"`}
      </div>
    </div>
  );
};

export default ServiceSelector;