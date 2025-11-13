import { useCreateSubscription } from '@/features/payment/hooks/usePaymentMutations';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

// Importa o index.css para carregar o Tailwind e corrigir o estilo
import '../index.css';

export function PremiumPage() {
  // O nosso hook de mutação
  const { mutate: createSubscription, isPending } = useCreateSubscription();
  
  // Instancia o hook de navegação
  const navigate = useNavigate(); 

  /**
   * CORREÇÃO: Navega para a página /discovery, como pedido.
   */
  const handleGoToSafePage = () => {
    navigate('/discovery');  
  };

  /**
   * Função para iniciar a subscrição
   */
  const handleSubscribeClick = () => {
    if (isPending) return;
    createSubscription();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6 text-white text-center">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-xl relative">  
        
        {/* --- Botão "X" que agora chama a função corrigida --- */}
        <button
          onClick={handleGoToSafePage} // MUDANÇA AQUI
          aria-label="Fechar"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
          <SparklesIcon className="h-10 w-10 text-white" aria-hidden="true" />
        </div>

        <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
          CosmosMatch Premium
        </h2>
        <p className="mt-4 text-lg text-gray-300">
          Desbloqueie todo o potencial do Cosmos.
        </p> {/* <-- ERRO CORRIGIDO AQUI (era </jato>) */}

        <div className="mt-8 text-left text-gray-300 space-y-3">
          <p className="flex items-center">
            <SparklesIcon className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0" />
            Contactos ilimitados (Mensagens, Comentários, Icebreakers).
          </p>
          <p className="flex items-center">
            <SparklesIcon className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0" />
            Veja quem gostou de si primeiro. (Brevemente)
          </p>
          <p className="flex items-center">
            <SparklesIcon className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0" />
            Modo "invisível". (Brevemente)
          </p>
        </div>

        <div className="mt-10">
          <button
            onClick={handleSubscribeClick}
            disabled={isPending}
            className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-lg font-medium text-white hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-wait"
          >
            {isPending ? 'A aguardar Asaas...' : 'Tornar-se Premium Agora'}
          </button>
          
          {/* --- Botão "Agora não" que agora chama a função corrigida --- */}
          <button
            type="button"
            onClick={handleGoToSafePage} // MUDANÇA AQUI
            disabled={isPending} // Desativa during loading
            className="mt-4 w-full inline-flex justify-center rounded-lg border border-gray-700 shadow-sm px-6 py-2.5 bg-gray-800 text-base font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800 disabled:opacity-50"
          >
            Agora não
          </button>
          
          <p className="mt-6 text-xs text-gray-500">
            (Plano Mensal - R$ 19,90). Você será redirecionado para o checkout seguro do Asaas.
          </p>
        </div>
      </div>
    </div>
  );
}