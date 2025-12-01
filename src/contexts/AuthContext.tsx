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
import { io, Socket } from 'socket.io-client';

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

export interface AuthContextType {
  user: AuthUser;
  setUser: Dispatch<SetStateAction<AuthUser>>;
  isLoading: boolean;
  logout: () => void;
  incrementFreeContactsUsed: () => void;
  socket: Socket | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- CORREÇÃO AQUI: Mudamos o padrão para 3000 ---
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const queryClient = useQueryClient();

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
          console.log('AuthContext: Token validado. User:', fetchedUser.username);
        } catch (error: any) {
          console.error('AuthContext: Token inválido.', error.message);
          localStorage.removeItem('cosmosmatch_token');
          fetchedUser = null;
        }
      }
      if (isMounted) {
        setUserState(fetchedUser);
        setIsLoading(false);
      }
    };
    validateToken();
    return () => { isMounted = false; };
  }, []);

  // Socket.IO Connection
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    if (user && !socket) {
      const token = localStorage.getItem('cosmosmatch_token');
      if (!token) return;

      console.log(`AuthContext (Socket): Conectando a ${BACKEND_URL}`);

      const newSocket = io(BACKEND_URL, {
        auth: { token: token },
        transports: ['websocket'], // Força websocket para evitar erros de polling
      });

      newSocket.on('connect', () => {
        console.log(`AuthContext (Socket): Conectado! ID: ${newSocket.id}`);
      });

      newSocket.on('connect_error', (err) => {
        console.error(`AuthContext (Socket): Erro de conexão.`, err.message);
      });

      setSocket(newSocket);
    }

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [user, socket]);

  const setUser = useCallback(
    (action: SetStateAction<AuthUser>) => {
      setUserState(action);
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('cosmosmatch_token');
    setUserState(null);
    queryClient.clear();
  }, [queryClient]);

  const incrementFreeContactsUsed = useCallback(() => {
    setUserState((currentUser) => {
      if (!currentUser?.subscription || currentUser.subscription.status !== 'FREE') {
        return currentUser;
      }
      return {
        ...currentUser,
        subscription: {
          ...currentUser.subscription,
          freeContactsUsed: (currentUser.subscription.freeContactsUsed ?? 0) + 1,
        },
      };
    });
  }, []);

  const value = {
    user,
    setUser,
    isLoading,
    logout,
    incrementFreeContactsUsed,
    socket,
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Carregando...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};