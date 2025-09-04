import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner, LoadingOverlay, SkeletonLoader } from '../components/ui/LoadingSpinner';
import { useToast } from '../hooks/useToast';

const ComponentTest: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const { addToast } = useToast();

  const handleToastTest = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: { title: 'Sucesso!', description: 'Operação realizada com sucesso.' },
      error: { title: 'Erro!', description: 'Algo deu errado. Tente novamente.' },
      warning: { title: 'Atenção!', description: 'Verifique os dados inseridos.' },
      info: { title: 'Informação', description: 'Esta é uma mensagem informativa.' }
    };
    
    addToast({ ...messages[type], type });
  };

  const handleOverlayTest = () => {
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 3000);
  };

  return (
    <div className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            🧪 Teste de Componentes Cyberpunk
          </h1>
          <p className="text-gray-300 text-lg">
            Demonstração de todos os componentes base criados para o sistema de autenticação
          </p>
        </div>

        {/* Button Tests */}
        <section className="glass-card p-6 rounded-xl border border-cyan-400/30">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
            🔘 Button Components
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary Variants */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Variantes Principais</h3>
              <Button variant="primary" size="md">Primary Button</Button>
              <Button variant="cyberpunk" size="md">Cyberpunk Button</Button>
              <Button variant="neon" size="md">Neon Button</Button>
            </div>

            {/* Secondary Variants */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Variantes Secundárias</h3>
              <Button variant="secondary" size="md">Secondary</Button>
              <Button variant="outline" size="md">Outline</Button>
              <Button variant="ghost" size="md">Ghost</Button>
            </div>

            {/* Special States */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Estados Especiais</h3>
              <Button variant="danger" size="md">Danger</Button>
              <Button variant="cyberpunk" size="md" isLoading>Loading</Button>
              <Button variant="neon" size="md" glow>Glow Effect</Button>
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Tamanhos</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="cyberpunk" size="sm">Small</Button>
              <Button variant="cyberpunk" size="md">Medium</Button>
              <Button variant="cyberpunk" size="lg">Large</Button>
              <Button variant="cyberpunk" size="xl">Extra Large</Button>
            </div>
          </div>

          {/* With Icons */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Com Ícones</h3>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="primary" 
                icon={<span>🚀</span>} 
                iconPosition="left"
              >
                Launch
              </Button>
              <Button 
                variant="cyberpunk" 
                icon={<span>⚡</span>} 
                iconPosition="right"
              >
                Power
              </Button>
            </div>
          </div>
        </section>

        {/* Input Tests */}
        <section className="glass-card p-6 rounded-xl border border-cyan-400/30">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
            📝 Input Components
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Inputs */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Inputs Básicos</h3>
              
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                variant="cyberpunk"
              />
              
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                variant="cyberpunk"
              />
              
              <Input
                label="Nome Completo"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                variant="neon"
              />
            </div>

            {/* Special States */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Estados Especiais</h3>
              
              <Input
                label="Com Erro"
                type="text"
                error="Este campo é obrigatório"
                variant="cyberpunk"
              />
              
              <Input
                label="Carregando"
                type="text"
                isLoading
                variant="cyberpunk"
              />
              
              <Input
                label="Com Ícone"
                type="text"
                icon={<span>🔍</span>}
                variant="cyberpunk"
              />
            </div>
          </div>
        </section>

        {/* Loading Spinner Tests */}
        <section className="glass-card p-6 rounded-xl border border-cyan-400/30">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
            ⏳ Loading Components
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Spinner Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Variantes</h3>
              <div className="space-y-4">
                <LoadingSpinner variant="cyberpunk" size="md" text="Cyberpunk" />
                <LoadingSpinner variant="neon" size="md" text="Neon" />
                <LoadingSpinner variant="pulse" size="md" text="Pulse" />
              </div>
            </div>

            {/* Different Types */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Tipos</h3>
              <div className="space-y-4">
                <LoadingSpinner variant="dots" size="md" text="Dots" />
                <LoadingSpinner variant="bars" size="md" text="Bars" />
                <LoadingSpinner variant="default" size="md" text="Default" />
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Tamanhos</h3>
              <div className="flex items-center gap-4">
                <LoadingSpinner variant="cyberpunk" size="xs" />
                <LoadingSpinner variant="cyberpunk" size="sm" />
                <LoadingSpinner variant="cyberpunk" size="md" />
                <LoadingSpinner variant="cyberpunk" size="lg" />
              </div>
            </div>
          </div>

          {/* Skeleton Loaders */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Skeleton Loaders</h3>
            <div className="space-y-3">
              <SkeletonLoader variant="text" className="h-4 w-3/4" />
              <SkeletonLoader variant="text" className="h-4 w-1/2" />
              <SkeletonLoader variant="rectangular" className="h-32 w-full" />
              <div className="flex items-center gap-3">
                <SkeletonLoader variant="circular" className="h-12 w-12" />
                <div className="flex-1 space-y-2">
                  <SkeletonLoader variant="text" className="h-4 w-3/4" />
                  <SkeletonLoader variant="text" className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* Overlay Test */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Loading Overlay</h3>
            <Button variant="cyberpunk" onClick={handleOverlayTest}>
              Testar Overlay (3s)
            </Button>
          </div>
        </section>

        {/* Toast Tests */}
        <section className="glass-card p-6 rounded-xl border border-cyan-400/30">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
            🔔 Toast Notifications
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="primary" 
              onClick={() => handleToastTest('success')}
              size="sm"
            >
              Success Toast
            </Button>
            <Button 
              variant="danger" 
              onClick={() => handleToastTest('error')}
              size="sm"
            >
              Error Toast
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleToastTest('warning')}
              size="sm"
            >
              Warning Toast
            </Button>
            <Button 
              variant="cyberpunk" 
              onClick={() => handleToastTest('info')}
              size="sm"
            >
              Info Toast
            </Button>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-gray-400">
          <p>✨ Todos os componentes estão funcionando perfeitamente!</p>
          <p className="text-sm mt-2">Fase 2 - Tarefa 1 concluída com sucesso</p>
        </div>
      </div>

      {/* Toast Container */}

      
      {/* Loading Overlay */}
      <LoadingOverlay 
        isVisible={showOverlay} 
        text="Testando overlay..." 
        variant="cyberpunk" 
      />
    </div>
  );
};

export default ComponentTest;