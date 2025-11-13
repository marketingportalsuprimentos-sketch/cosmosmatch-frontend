// src/types/social.types.ts

// O tipo de usuário retornado pela busca
// (Simplificado, apenas com o necessário para a lista)
export interface UserSearchResult {
  id: string;
  name: string;
  profile: {
    imageUrl: string | null;
  };
}