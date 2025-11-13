// src/features/discovery/hooks/useDiscoveryMutations.ts
// (COLE ISTO NO SEU ARQUIVO)

// --- INÍCIO DA CORREÇÃO ---
// REMOVIDO: useMutation (não é mais necessário aqui)
// REMOVIDO: sendIcebreaker (não vamos mais usar esta API)

import { toast } from '@/lib/toast'; // (Mantido, embora o hook de chat já use)

// 1. Manter o hook de "Like" (que é separado)
import { useLikeUser } from '@/features/profile/hooks/useProfile';
// 2. Importar o hook de "Chat" (o mesmo do Feed/Galeria, que tem o paywall)
import { useCreateOrGetConversation } from '@/features/chat/hooks/useChatMutations';
// --- FIM DA CORREÇÃO ---

type UseDiscoveryMutationsProps = {
  // Props, se necessário no futuro
};

// (Não precisamos mais do IcebreakerVars, o hook de chat já o define)

export function useDiscoveryMutations({}: UseDiscoveryMutationsProps = {}) {
  
  // 1. O "Like" (Botão Coração) está correto e separado.
  const likeMutation = useLikeUser();

  // --- INÍCIO DA CORREÇÃO ---
  // 2. O "sendIcebreaker" (Botão Mensagem) estava errado.
  //    Agora, ele usa o hook de CHAT unificado, que
  //    aciona corretamente o paywall de 3 mensagens.
  const icebreakerMutation = useCreateOrGetConversation();
  // --- FIM DA CORREÇÃO ---

  return {
    // Ação de Like (separada, não conta no paywall)
    like: likeMutation.mutateAsync,
    likeStatus: likeMutation.status,
    
    // Ação de Mensagem (unificada, conta no paywall)
    sendIcebreaker: icebreakerMutation.mutateAsync,
    icebreakerStatus: icebreakerMutation.status,
  };
}