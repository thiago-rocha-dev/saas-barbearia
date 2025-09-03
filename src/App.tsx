import React from 'react';
import { supabase } from './lib/supabase';
import { Button } from './components/ui/Button';

function App() {
  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { error } = await supabase.from('barbershops').select('count');
        setConnected(!error);
      } catch (error) {
        setConnected(false);
      }
    };
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold mb-4 animate-glow">
            BarberPro SaaS
          </h1>
          <p className="text-gray-300 text-lg">
            Sistema Premium de Gestão para Barbearias
          </p>
        </div>

        <div className="bg-dark-card p-6 rounded-lg border border-dark-border glow-gold">
          <h2 className="text-2xl font-semibold mb-4 text-gold">
            🚀 Fase 1 - Fundação Estabelecida
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-green-400">✅</span>
              <span>React + Vite + TypeScript configurado</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-400">✅</span>
              <span>Tailwind CSS tema cyberpunk implementado</span>  
            </div>
            <div className="flex items-center space-x-3">
              <span className={connected ? "text-green-400" : "text-red-400"}>
                {connected ? "✅" : "❌"}
              </span>
              <span>Supabase: {connected ? "Conectado" : "Desconectado"}</span>
            </div>
          </div>

          <div className="mt-6">
            <Button variant="primary" size="lg" className="w-full">
              Sistema Pronto para Desenvolvimento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
