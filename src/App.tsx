// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Router } from './router'; // Importamos o COMPONENTE Router (com R maiúsculo)

// 1. Criar uma instância do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* CORREÇÃO: Usamos o componente <Router /> que já contém a lógica de proteção */}
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}