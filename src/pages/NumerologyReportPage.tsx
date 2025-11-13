// frontend/src/pages/NumerologyReportPage.tsx
// NOVO FICHEIRO - Criado com base no SynastryReportPage.tsx

import { useParams, Link } from 'react-router-dom';
// 1. Importar o hook e tipos de NUMEROLOGIA
import { useGetNumerologyReport } from '@/features/compatibility/hooks/useCompatibilityQueries';
import {
  FullNumerologyReport,
  NumerologyReportItem,
} from '@/features/compatibility/services/compatibilityApi';

// 2. Importar ícones para a Qualidade
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
} from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/AuthContext';

// 3. Componente de Item do Relatório (Baseado no AspectItem)
const QUALITY_STYLES: Record<
  NumerologyReportItem['quality'],
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  Harmônico: {
    icon: CheckCircleIcon,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  Neutro: {
    icon: MinusCircleIcon,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
  Desafiador: {
    icon: ExclamationTriangleIcon,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
};

const NumerologyAspectItem = ({
  item,
  nameA,
  nameB,
}: {
  item: NumerologyReportItem;
  nameA: string;
  nameB: string;
}) => {
  const style = QUALITY_STYLES[item.quality];
  const Icon = style.icon;

  return (
    <li
      className={`p-4 rounded-lg border border-gray-700 ${style.bgColor} shadow-md`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-6 h-6 flex-shrink-0 ${style.color}`} />
        <div>
          <h4 className={`text-lg font-semibold ${style.color}`}>
            {item.name}
          </h4>
          <p className="text-sm text-gray-400">
            {nameA} (Nº {item.numberA}) vs. {nameB} (Nº {item.numberB})
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-200 mt-2">{item.summary}</p>
    </li>
  );
};

// 4. Componente da Página Principal
export const NumerologyReportPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: loggedInUser } = useAuth(); // Para obter o nome "Você"

  // 5. Chamar o hook de NUMEROLOGIA
  const { data, isLoading, error } = useGetNumerologyReport(userId) as {
    data: FullNumerologyReport | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  const reportItems = data?.reportItems;
  // Usar o nome do utilizador logado para "nameA"
  const nameA = data?.nameA || loggedInUser?.name.split(' ')[0] || 'Você';
  const nameB = data?.nameB || 'Outro';

  // 6. Tratamento de loading/error (copiado do molde)
  if (isLoading) {
    return (
      <div className="text-center p-10 text-white">
        A calcular relatório de numerologia... 🔢
      </div>
    );
  }

  if (error) {
    let errorMessage = 'Erro ao calcular o relatório.';
    // Erro 400 (BadRequest) é lançado se um dos perfis estiver incompleto
    if ((error as any)?.response?.status === 400) {
      errorMessage = (error as any).response.data.message || 'Não foi possível calcular: um ou ambos os perfis têm dados de numerologia incompletos (requer "Nome Completo de Nascimento").';
    }
    return <div className="text-center p-10 text-red-400">{errorMessage}</div>;
  }

  if (!data || !reportItems || !nameA || !nameB) {
    return (
      <div className="text-center p-10 text-gray-400">
        Nenhum relatório encontrado.
      </div>
    );
  }

  return (
    <div className="text-white p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2 text-indigo-300">
        Relatório de Numerologia
      </h1>
      <p className="text-center text-lg text-gray-400 mb-6">
        {nameA} (Você) & {nameB}
      </p>

      {/* 7. REMOVIDA a secção <SynastryChartDisplay> */}

      {/* 8. Renderizar a lista de itens */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-white">
          Análise dos 5 Números
        </h2>
        {reportItems.length > 0 ? (
          <ul className="space-y-4">
            {reportItems.map((item) => (
              <NumerologyAspectItem
                key={item.name}
                item={item}
                nameA={nameA}
                nameB={nameB}
              />
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm italic">
            Nenhum item de relatório encontrado.
          </p>
        )}
      </div>

      {/* 9. Botão Voltar (Link corrigido para o perfil do *alvo*) */}
      <div className="text-center mt-8">
        <Link
          to={`/profile/${userId}`} // Volta para o perfil que estávamos a ver
          className="px-6 py-2 bg-gray-600 rounded hover:bg-gray-500 transition-colors"
        >
          Voltar ao Perfil de {nameB}
        </Link>
      </div>
    </div>
  );
};

export default NumerologyReportPage;