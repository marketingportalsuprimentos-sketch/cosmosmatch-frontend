// frontend/src/contexts/AuthContext.tsx

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';
import { useQueryClient } from '@tanstack/react-query';

// --- INÍCIO DA ADIÇÃO (Socket.IO) ---
// Importar o cliente Socket.IO e o tipo 'Socket'
import { io, Socket } from 'socket.io-client';
// --- FIM DA ADIÇÃO ---

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

// --- ATUALIZAÇÃO (Socket.IO) ---
// 1. Atualizar a interface do Contexto
export interface AuthContextType {
  user: AuthUser;
  setUser: Dispatch<SetStateAction<AuthUser>>;
  isLoading: boolean;
  logout: () => void;
  incrementFreeContactsUsed: () => void;
  // 2. Adicionar o socket ao tipo
  socket: Socket | null;
}
// --- FIM DA ATUALIZAÇÃO ---

// Criação do Contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- INÍCIO DA ADIÇÃO (Socket.IO) ---
// URL do backend (deve estar no seu ficheiro .env.local)
// Ex: VITE_BACKEND_URL=http://localhost:3001
// (Estou a assumir que a variável se chama VITE_BACKEND_URL, ajuste se for diferente)
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
// --- FIM DA ADIÇÃO ---

// Componente Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);
  // --- INÍCIO DA ADIÇÃO (Socket.IO) ---
  // 3. Criar estado para a instância do socket
  const [socket, setSocket] = useState<Socket | null>(null);
  // --- FIM DA ADIÇÃO ---
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

  // --- INÍCIO DA ADIÇÃO (Socket.IO) ---
  // 4. useEffect para gerir a ligação do Socket.IO
  // Este efeito depende do 'user'
  useEffect(() => {
    // Se não houver 'user' (logout), desconecta
    if (!user) {
      if (socket) {
        console.log(
          'AuthContext (Socket): Utilizador fez logout, a desconectar socket...',
        );
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Se o 'user' existe (login) E o socket ainda não está ligado
    if (user && !socket) {
      const token = localStorage.getItem('cosmosmatch_token');
      if (!token) {
        console.error(
          'AuthContext (Socket): Utilizador logado mas sem token. A ligação não será estabelecida.',
        );
        return;
      }

      console.log(
        `AuthContext (Socket): A tentar ligar a ${BACKEND_URL} com o user ${user.username}`,
      );

      // Cria a instância do socket, passando o token para o 'handshake'
      // O backend (ChatGateway) irá apanhar isto.
      const newSocket = io(BACKEND_URL, {
        auth: {
          token: token,
        },
      });

      // Listeners para debug
      newSocket.on('connect', () => {
        console.log(
          `AuthContext (Socket): Ligado com sucesso! (ID: ${newSocket.id})`,
        );
      });

      newSocket.on('disconnect', (reason) => {
        console.log(`AuthContext (Socket): Desconectado. Razão: ${reason}`);
        setSocket(null); // Limpa o estado se for desconectado
      });

      newSocket.on('connect_error', (err) => {
        console.error(`AuthContext (Socket): Erro de ligação. ${err.message}`);
        // Pode ter sido um token inválido, desliga
        newSocket.disconnect();
        setSocket(null);
      });

      // Guarda a instância do socket no estado
      setSocket(newSocket);
    }

    // Função de cleanup: Desconecta o socket quando o 'user' mudar (logout)
    return () => {
      if (socket) {
        console.log(
          'AuthContext (Socket): Cleanup useEffect (logout/unmount)...',
        );
        socket.disconnect();
        setSocket(null);
      }
    };
    // Dependência: 'user' e 'socket'
    // Quando o 'user' muda (de null para User ou de User para null), este efeito corre.
  }, [user, socket]);
  // --- FIM DA ADIÇÃO ---

  // (Função 'setUser' - Sem alterações)
  const setUser = useCallback(
    (action: SetStateAction<AuthUser>) => {
      if (typeof action !== 'function') {
        const userData = action;
        console.log(
          'AuthContext: setUser (Login/Logout) chamado com:',
          userData ? userData.username : 'null',
        );
        if (userData) {
          console.log(
            'AuthContext: setUser (subscription data):',
            userData.subscription,
          );
          queryClient.clear();
        }
      }
      setUserState(action);
    },
    [queryClient],
  );

  // (Função 'logout' - Sem alterações)
  // Nota: O 'logout' define o 'user' para 'null', o que
  // irá automaticamente acionar o useEffect do socket (acima)
  // e desligar a ligação. Está perfeito.
  const logout = useCallback(() => {
    console.log('AuthContext: logout chamado.');
    localStorage.removeItem('cosmosmatch_token');
    setUserState(null);
    queryClient.clear();
  }, [queryClient]);

  // (Função 'incrementFreeContactsUsed' - Sem alterações)
  const incrementFreeContactsUsed = useCallback(() => {
    setUserState((currentUser) => {
      if (
        !currentUser ||
        !currentUser.subscription ||
        currentUser.subscription.status !== 'FREE'
      ) {
        return currentUser;
      }

      const newCount = (currentUser.subscription.freeContactsUsed ?? 0) + 1;
      console.log(
        'AuthContext (incrementFreeContactsUsed) executado. Novo contador:',
        newCount,
      );

      return {
        ...currentUser,
        subscription: {
          ...currentUser.subscription,
          freeContactsUsed: newCount,
        },
      };
    });
  }, []);

  // --- ATUALIZAÇÃO (Socket.IO) ---
  // 5. Adicionar o 'socket' ao 'value'
  const value = {
    user,
    setUser,
    isLoading,
    logout,
    incrementFreeContactsUsed,
    socket, // <-- Adicionado aqui
  };
  // --- FIM DA ATUALIZAÇÃO ---

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