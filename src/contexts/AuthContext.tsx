// frontend/src/contexts/AuthContext.tsx
// (COLE ISTO NO SEU ARQUIVO)

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  // --- INÍCIO DA CORREÇÃO (Bug do Blur) ---
  Dispatch, 
  SetStateAction 
  // --- FIM DA CORREÇÃO ---
} from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api'; 
import { useQueryClient } from '@tanstack/react-query'; 

// (Interfaces Subscription e User - Sem alterações)
export interface Subscription {
  id: string;
  status: 'FREE' | 'PREMIUM' | 'LIFETIME';
  freeContactsUsed: number;
}
interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: 'USER' | 'ADMIN';
  subscription: Subscription | null;
  createdAt?: string;
  updatedAt?: string;
}

type AuthUser = User | null;

// --- INÍCIO DA CORREÇÃO (Bug do Blur) ---
// 1. Atualizar a interface do Contexto
export interface AuthContextType {
  user: AuthUser;
  // Alterar o tipo de 'setUser' para permitir a "função de atualização"
  setUser: Dispatch<SetStateAction<AuthUser>>;
  isLoading: boolean;
  logout: () => void;
  // 2. Adicionar a nossa nova função segura
  incrementFreeContactsUsed: () => void; 
}
// --- FIM DA CORREÇÃO ---


// Criação do Contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // (useEffect de validação do token - Sem alterações)
  useEffect(() => {
    let isMounted = true;
    const validateToken = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('cosmosmatch_token');
      let fetchedUser: AuthUser = null;
      if (token) {
        try {
          const response = await api.get<User>('/auth/profile');
          fetchedUser = response.data;
          console.log(
            'AuthContext: Token validado (useEffect). User:',
            fetchedUser.username,
            'Subscrição:',
            fetchedUser.subscription,
          );
        } catch (error: any) {
          console.error(
            'AuthContext: Token inválido ou expirado (useEffect). Limpando token...',
            error.response?.data?.message || error.message,
          );
          localStorage.removeItem('cosmosmatch_token');
          fetchedUser = null;
        }
      } else {
        console.log(
          'AuthContext: Nenhum token encontrado no localStorage (useEffect).',
        );
      }
      if (isMounted) {
        setUserState(fetchedUser);
        setIsLoading(false);
        console.log(
          `AuthContext: Validação inicial concluída. isLoading: ${false}, User: ${
            fetchedUser ? fetchedUser.username : 'null'
          }`,
        );
      }
    };
    validateToken();
    return () => {
      isMounted = false;
    };
  }, []);

  // --- INÍCIO DA CORREÇÃO (Bug do Blur) ---
  // 3. A função 'setUser' (usada para Login/Logout) agora lida
  //    corretamente com a "função de atualização" (updater)
  const setUser = useCallback(
    (action: SetStateAction<AuthUser>) => {
      // Se a 'action' for um usuário (login/logout), limpamos o cache.
      if (typeof action !== 'function') {
        const userData = action;
        console.log(
          'AuthContext: setUser (Login/Logout) chamado com:',
          userData ? userData.username : 'null',
        );
        if (userData) {
          console.log('AuthContext: setUser (subscription data):', userData.subscription); 
          queryClient.clear();
        }
      }
      // Se for uma função (incremento), não limpamos o cache.
      setUserState(action);
    },
    [queryClient],
  );
  // --- FIM DA CORREÇÃO ---


  // (Função 'logout' - Sem alterações)
  const logout = useCallback(() => {
    console.log('AuthContext: logout chamado.');
    localStorage.removeItem('cosmosmatch_token');
    setUserState(null);
    queryClient.clear();
  }, [queryClient]);


  // --- INÍCIO DA CORREÇÃO (Bug do Blur) ---
  // 4. Implementar a nova função
  const incrementFreeContactsUsed = useCallback(() => {
    setUserState((currentUser) => {
      // Se não houver usuário ou subscrição, não faz nada
      if (!currentUser || !currentUser.subscription || currentUser.subscription.status !== 'FREE') {
        return currentUser;
      }

      // Incrementa o valor mais recente
      const newCount = (currentUser.subscription.freeContactsUsed ?? 0) + 1;
      console.log('AuthContext (incrementFreeContactsUsed) executado. Novo contador:', newCount);

      // Retorna o novo objeto de usuário
      return {
        ...currentUser,
        subscription: {
          ...currentUser.subscription,
          freeContactsUsed: newCount,
        },
      };
    });
  }, []); 
  // --- FIM DA CORREÇÃO ---


  // 5. Adicionar a nova função ao 'value'
  const value = { user, setUser, isLoading, logout, incrementFreeContactsUsed };

  // (Loading screen - Sem alterações)
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#1a202c',
          color: 'white',
          fontSize: '1.2rem',
        }}
      >
        A carregar CosmosMatch... ✨
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook useAuth (Sem alterações)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};