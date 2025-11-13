// frontend/src/types/auth.types.ts
import { z } from 'zod';

// --- Zod Schemas ---
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});
export type LoginDto = z.infer<typeof loginSchema>;

// --- INÍCIO DA ATUALIZAÇÃO (Fase 2: Username) ---

// 1. Definimos o "Base Schema" com todos os campos (incluindo o novo 'username')
const registerSchemaBase = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  // Adicionamos as mesmas regras de validação que o backend
  username: z
    .string()
    .min(3, 'O nome de utilizador deve ter pelo menos 3 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'O nome de utilizador só pode conter letras, números e _',
    }),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
});

// 2. Criamos o tipo a partir do "Base Schema"
type RegisterSchemaData = z.infer<typeof registerSchemaBase>;

// 3. Exportamos o schema final com a validação 'refine'
export const registerSchema = registerSchemaBase.refine(
  (data: RegisterSchemaData) => data.password === data.confirmPassword,
  {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  },
);

// 4. O nosso DTO de registo agora inclui 'username'
export type RegisterDto = RegisterSchemaData;

// --- FIM DA ATUALIZAÇÃO ---

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordDtoSchema = z.object({
  newPassword: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  token: z.string(),
});
export type ResetPasswordDto = z.infer<typeof resetPasswordDtoSchema>;

const resetPasswordFormBaseSchema = z.object({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  token: z.string(),
});
type ResetPasswordFormData = z.infer<typeof resetPasswordFormBaseSchema>;
export const resetPasswordFormSchema = resetPasswordFormBaseSchema.refine(
  (data: ResetPasswordFormData) => data.password === data.confirmPassword,
  {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  },
);
export type ResetPasswordFormDto = z.infer<typeof resetPasswordFormSchema>;
// --- Fim dos Zod Schemas ---

// --- INÍCIO DA CORREÇÃO (Etapa 3: Sincronizar Tipos) ---

// 1. Definir o tipo da Subscrição (deve corresponder ao AuthContext)
export interface Subscription {
  id: string;
  // --- INÍCIO DA CORREÇÃO (Build TS2367) ---
  // Alinhado com o schema.prisma (FREE, PREMIUM, LIFETIME)
  status: 'FREE' | 'PREMIUM' | 'LIFETIME';
  // --- FIM DA CORREÇÃO ---
  freeContactsUsed: number;
}

// 2. O utilizador básico retornado pela API de auth (agora com subscrição)
export interface AuthUser {
  id: string;
  email: string;
  // --- INÍCIO DA ATUALIZAÇÃO (Fase 2: Username) ---
  username: string; // <-- Adicionado
  // --- FIM DA ATUALIZAÇÃO ---
  name: string;
  role: 'USER' | 'ADMIN';
  subscription: Subscription | null; // <-- CORREÇÃO (Adicionado)
}

// --- FIM DA CORREÇÃO ---

// O perfil completo retornado por /profile/me
export interface UserProfile {
  id: string;
  userId: string;
  bio: string | null;
  birthDate: string | null;
  birthTime: string | null;
  birthCity: string | null;
  currentCity: string | null;
  gender: string | null;
  imageUrl: string | null;
  searchRadius: number | null;
}

// A resposta completa do login/registo
export interface AuthResponse {
  accessToken: string;
  user: AuthUser; // <-- Este 'user' agora está correto
}

// --- INÍCIO DA ADIÇÃO (Solução: Corrigir Email) ---
/**
 * DTO para a rota de atualização de email não verificado
 * (Corresponde ao backend/src/auth/dto/update-unverified-email.dto.ts)
 */
export interface UpdateUnverifiedEmailDto {
  newEmail: string;
  password: string;
}
// --- FIM DA ADIÇÃO ---