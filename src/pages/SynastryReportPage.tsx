// frontend/src/pages/SynastryReportPage.tsx
// (CORREÇÃO FINAL - Botão de Voltar Dinâmico)

import { useParams, Link } from 'react-router-dom';
import { useGetSynastryReport } from '@/features/compatibility/hooks/useCompatibilityQueries';
import { Aspect, FullSynastryPayload } from '@/types/compatibility.types';
import { SynastryChartDisplay } from '@/features/compatibility/components/SynastryChartDisplay';

// (Componente AspectItem - igual)
const AspectItem = ({
  aspect,
  nameA,
  nameB,
}: {
  aspect: Aspect;
  nameA: string;
  nameB: string;
}) => (
  <li className="p-3 bg-gray-700 rounded-lg">
    <h4 className="font-semibold text-indigo-300">
      {`${aspect.planetAName} de ${nameA}`} {aspect.type} {`${aspect.planetBName} de ${nameB}`}
    </h4>
    <p className="text-sm text-gray-300">{aspect.summary}</p>
    <span className="text-xs text-gray-500">
      (Qualidade: {aspect.quality} | Orbe: {aspect.orb.toFixed(1)}°)
    </span>
  </li>
);

export const SynastryReportPage = () => {
  const { userId } = useParams<{ userId: string }>();
  
  const { data, isLoading, error } = useGetSynastryReport(userId) as {
    data: FullSynastryPayload | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  const report = data?.report;
  const chartA = data?.chartA;
  const chartB = data?.chartB;
  const nameA = data?.nameA;
  const nameB = data?.nameB;

  // (Tratamento de loading/error - igual)
  if (isLoading) {
    return (
      <div className="text-center p-10 text-white">
        A calcular relatório de sinastria...
      </div>
    );
  }

  if (error) {
    let errorMessage = 'Erro ao calcular o relatório.';
    if ((error as any)?.response?.status === 400) {
      errorMessage = 'Não foi possível calcular: um ou ambos os perfis têm dados de nascimento incompletos.';
    }
    return <div className="text-center p-10 text-red-400">{errorMessage}</div>;
  }

  if (!data || !report || !chartA || !chartB || !nameA || !nameB) {
    return (
      <div className="text-center p-10 text-gray-400">
        Nenhum relatório encontrado.
      </div>
    );
  }

  return (
    <div className="text-white p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-300">
        Relatório de Sinastria
      </h1>

      {/* (Secção de Visualização - igual) */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-center">Visualização da Sinastria</h2>
        <p className="text-center text-sm text-gray-400 mb-4">
          Anel Interno: {nameA} | Anel Externo: {nameB}
        </p>
        
        <SynastryChartDisplay 
          chartA={chartA} 
          chartB={chartB} 
          report={report} 
        />
        
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500"></div>
            <span className="text-gray-300">Aspecto Positivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-500"></div>
            <span className="text-gray-300">Aspecto Desafiador</span>
          </div>
        </div>

      </div>

      {/* (Secções de Relatório de Texto - iguais) */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 text-green-400">
          Pontos Fortes e Atração
        </h2>
        {report.positiveAspects.length > 0 ? (
          <ul className="space-y-3">
            {report.positiveAspects.map((aspect, idx) => (
              <AspectItem 
                key={`pos-${idx}`} 
                aspect={aspect} 
                nameA={nameA} 
                nameB={nameB} 
              />
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm italic">
            Nenhum aspecto positivo principal encontrado.
          </p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3 text-red-400">
          Pontos de Tensão e Desafio
        </h2>
        {report.challengingAspects.length > 0 ? (
          <ul className="space-y-3">
            {report.challengingAspects.map((aspect, idx) => (
              <AspectItem 
                key={`neg-${idx}`} 
                aspect={aspect} 
                nameA={nameA} 
                nameB={nameB} 
              />
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm italic">
            Nenhum aspecto desafiador principal encontrado.
          </p>
        )}
      </div>

      {/* --- BOTÃO VOLTAR (AGORA DINÂMICO) --- */}
      <div className="text-center mt-8 pb-10">
        <Link
          to={`/profile/${userId}`} 
          className="px-6 py-2 bg-gray-600 rounded hover:bg-gray-500 transition-colors"
        >
          Voltar ao Perfil de {nameB}
        </Link>
      </div>
      
    </div>
  );
};