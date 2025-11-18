// src/features/profile/components/BehavioralRadarChart.tsx
// (CORRIGIDO: Removemos o argumento extra do toast que causava o erro de build)

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
}

export const BehavioralRadarChart = ({ answers, sign }: BehavioralRadarChartProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const data = useMemo(() => {
    if (!answers || answers.length < 20) return [];

    const personalityAvg = answers.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
    const lifestyleAvg = answers.slice(10, 15).reduce((a, b) => a + b, 0) / 5;
    const tastesAvg = answers.slice(15, 20).reduce((a, b) => a + b, 0) / 5;

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
      // 1. Gera a imagem
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

        // 2. Tenta usar a API Nativa (Mobile Share Sheet)
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
          // 3. FALLBACK: Se falhar (ou for Desktop), baixa a imagem
          console.log('Partilha direta falhou, baixando imagem...', shareError);
          
          const link = document.createElement('a');
          link.download = `sintonia-${sign.toLowerCase()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          
          // CORREÇÃO AQUI: Removemos o objeto { duration: 5000 }
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
      
      {/* CARD QUE VIRA IMAGEM */}
      <div 
        ref={cardRef}
        className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700 flex flex-col items-center w-full max-w-sm relative overflow-hidden"
      >
        {/* Fundo Gradiente */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <h3 className="text-2xl font-bold text-white mb-1 mt-2">
          Vibração {sign}
        </h3>
        <p className="text-xs text-gray-400 mb-6 uppercase tracking-widest font-semibold">
          Sintonia Cósmica
        </p>

        {/* Gráfico */}
        <div className="w-full h-[250px] -ml-2 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="#4b5563" strokeDasharray="3 3" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#e5e7eb', fontSize: 11, fontWeight: 'bold' }} 
              />
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

        {/* Branding */}
        <div className="flex items-center gap-2 mt-4 opacity-70">
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">CM</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">
            Gerado por CosmosMatch App
          </span>
        </div>
      </div>

      {/* BOTÃO DE AÇÃO */}
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
    </div>
  );
};