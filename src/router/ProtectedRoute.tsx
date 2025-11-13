// src/router/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Ajuste o caminho se necessário

export function ProtectedRoute() {
  const { user, isLoading } = useAuth(); // Usar 'user' em vez de 'isAuthenticated'

  // Se ainda estiver a verificar a autenticação (load inicial do AuthContext)
  if (isLoading) {
    // Pode mostrar um spinner global ou uma página de loading aqui
    return <div>A verificar autenticação...</div>; 
  }

  // Se não houver utilizador (após o loading terminar), redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se houver utilizador, renderiza o conteúdo da rota filha (ex: AppLayout)
  return <Outlet />; 
}