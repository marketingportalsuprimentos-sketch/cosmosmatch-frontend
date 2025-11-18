// src/features/profile/components/BehavioralRadarChart.tsx

import { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { ShareIcon } from '@heroicons/react/24/solid';
import { toast } from '@/lib/toast';

interface BehavioralRadarChartProps {
  answers: number[] | null; // As 20 respostas
  sign: string;
}

export const BehavioralRadarChart = ({ answers, sign }: BehavioralRadarChartProps) => {
  
  // 1. Calcular as Médias das Categorias
  const data = useMemo(() => {
    if (!answers || answers.length < 20) return [];

    // Personalidade: Perguntas 1 a 10 (Índices 0-9)
    const personalityAvg = answers.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
    
    // Estilo de Vida: Perguntas 11 a 15 (Índices 10-14)
    const lifestyleAvg = answers.slice(10, 15).reduce((a, b) => a + b, 0) / 5;

    // Gostos: Perguntas 16 a 20 (Índices 15-19)
    const tastesAvg = answers.slice(15, 20).reduce((a, b) => a + b, 0) / 5;

    return [
      { subject: 'Personalidade', A: personalityAvg, fullMark: 10 },
      { subject: 'Estilo de Vida', A: lifestyleAvg, fullMark: 10 },
      { subject: 'Gostos', A: tastesAvg, fullMark: 10 },
    ];
  }, [answers]);

  // Se não tiver respostas, não mostra nada (ou mostra estado vazio)
  if (!answers || answers.length === 0) return null;

  // 2. Função de Compartilhar (Nativa do Mobile)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Minha Sintonia Cósmica de ${sign}`,
          text: `Confira a minha vibração astrológica no CosmosMatch! Sou ${sign} com foco em...`,
          url: window.location.href, // Link para o perfil
        });
      } catch (error) {
        console.log('Erro ao compartilhar', error);
      }
    } else {
      // Fallback para Desktop (Copia link)
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link do perfil copiado!');
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 mt-6 border border-gray-700 flex flex-col items-center">
      
      <h3 className="text-lg font-bold text-white mb-2">
        Vibração {sign}
      </h3>
      <p className="text-xs text-gray-400 mb-4 text-center">
        Baseado na sua autoavaliação
      </p>

      {/* O GRÁFICO */}
      <div className="w-full h-[250px] -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#4b5563" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#9ca3af', fontSize: 12 }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
            <Radar
              name={sign}
              dataKey="A"
              stroke="#8b5cf6" // Roxo
              strokeWidth={3}
              fill="#8b5cf6"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* BOTÃO COMPARTILHAR */}
      <button
        onClick={handleShare}
        className="mt-4 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all"
      >
        <ShareIcon className="w-4 h-4" />
        Compartilhar
      </button>
    </div>
  );
};