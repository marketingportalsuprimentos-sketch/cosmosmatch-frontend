// src/features/profile/components/BehavioralRadarChart.tsx
// (CORREÇÃO FINAL DE LAYOUT: Gráfico Grande + Labels HTML Customizadas nos cantos)

import { useMemo, useRef, useState } from 'react';
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
import html2canvas from 'html2canvas';

interface BehavioralRadarChartProps {
  answers: number[] | null;
  sign: string;
  userId: string;
  isOwner: boolean;
}

export const BehavioralRadarChart = ({ answers, sign, isOwner }: BehavioralRadarChartProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const data = useMemo(() => {
    if (!answers || answers.length < 20) return [];

    const personalityAvg = answers.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
    const lifestyleAvg = answers.slice(10, 15).reduce((a, b) => a + b, 0) / 5;
    const tastesAvg = answers.slice(15, 20).reduce((a, b) => a + b, 0) / 5;

    // Nota: A ordem aqui define a posição no gráfico (Topo, Esquerda, Direita)
    return [
      { subject: 'Personalidade', A: personalityAvg, fullMark: 10 },
      { subject: 'Estilo de Vida', A: lifestyleAvg, fullMark: 10 },
      { subject: 'Gostos', A: tastesAvg, fullMark: 10 },
    ];
  }, [answers]);

  if (!answers || answers.length === 0) return null;

  const handleShareImage = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1f2937',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Erro ao gerar imagem.');
          setIsSharing(false);
          return;
        }

        const file = new File([blob], `sintonia-${sign.toLowerCase()}.png`, {
          type: 'image/png',
        });

        try {
          if (navigator.share) {
            await navigator.share({
              files: [file],
              title: `Minha Sintonia`,
              text: `Minha vibração ${sign} no CosmosMatch! ✨`,
            });
            toast.success('Menu de partilha aberto!');
          } else {
            throw new Error('Navegador não suporta partilha de arquivos.');
          }
        } catch (shareError) {
          console.log('Partilha direta falhou, baixando imagem...', shareError);
          
          const link = document.createElement('a');
          link.download = `sintonia-${sign.toLowerCase()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          
          toast.success('Imagem salva na Galeria! Agora pode enviar no WhatsApp.');
        }
        
        setIsSharing(false);
      }, 'image/png');

    } catch (error) {
      console.error('Erro fatal ao gerar imagem:', error);
      toast.error('Erro ao processar imagem.');
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-6">
      
      <div 
        ref={cardRef}
        className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700 flex flex-col items-center w-full max-w-sm relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <h3 className="text-2xl font-bold text-white mb-1 mt-2">
          Vibração {sign}
        </h3>
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest font-semibold">
          Sintonia Cósmica
        </p>

        {/* Container do Gráfico com Labels HTML Manuais */}
        <div className="w-full h-[280px] relative mt-4">
          
          {/* --- LABELS MANUAIS (Para não cortar e permitir gráfico grande) --- */}
          
          {/* Topo: Personalidade */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[11px] font-bold text-gray-300 uppercase tracking-wider bg-gray-800/80 px-2 py-1 rounded z-10">
            Personalidade
          </div>

          {/* Canto Inferior Esquerdo: Estilo de Vida */}
          <div className="absolute bottom-8 left-0 text-[11px] font-bold text-gray-300 uppercase tracking-wider bg-gray-800/80 px-1 rounded z-10 text-left leading-tight">
            Estilo<br/>de Vida
          </div>

          {/* Canto Inferior Direito: Gostos */}
          <div className="absolute bottom-8 right-0 text-[11px] font-bold text-gray-300 uppercase tracking-wider bg-gray-800/80 px-1 rounded z-10 text-right">
            Gostos
          </div>

          <ResponsiveContainer width="100%" height="100%">
            {/* OuterRadius 75% deixa o gráfico bem grande */}
            <RadarChart cx="50%" cy="55%" outerRadius="75%" data={data}>
              <PolarGrid stroke="#4b5563" strokeDasharray="3 3" />
              {/* Tick false esconde os textos automáticos do Recharts (que cortavam) */}
              <PolarAngleAxis dataKey="subject" tick={false} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
              <Radar
                name={sign}
                dataKey="A"
                stroke="#a78bfa"
                strokeWidth={3}
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-2 mt-2 opacity-70">
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">CM</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">
            Gerado por CosmosMatch App
          </span>
        </div>
      </div>

      {isOwner && (
        <button
          onClick={handleShareImage}
          disabled={isSharing}
          className="mt-6 flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-purple-900/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSharing ? (
            'Gerando...'
          ) : (
            <>
              <ShareIcon className="w-5 h-5" />
              Compartilhar Card
            </>
          )}
        </button>
      )}
    </div>
  );
};