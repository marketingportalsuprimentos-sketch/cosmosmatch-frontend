// src/features/profile/components/BehavioralRadarChart.tsx
// (ATUALIZADO: Gera Imagem PNG para partilhar - Estilo Spotify Wrapped)

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
  const cardRef = useRef<HTMLDivElement>(null); // Referência para o elemento que será "fotografado"
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
      // 1. Gera a imagem a partir do elemento HTML (Card)
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1f2937', // Garante fundo cinza escuro (bg-gray-800)
        scale: 2, // Alta resolução (Retina)
        logging: false,
        useCORS: true, // Para carregar fontes/ícones corretamente
      });

      // 2. Converte para Blob (Arquivo)
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Erro ao gerar imagem.');
          setIsSharing(false);
          return;
        }

        const file = new File([blob], `sintonia-${sign.toLowerCase()}.png`, {
          type: 'image/png',
        });

        // 3. Tenta usar a API de Partilha Nativa (Mobile)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `Minha Sintonia Cósmica`,
              text: `A minha vibração ${sign} no CosmosMatch! ✨`,
            });
            toast.success('Imagem partilhada!');
          } catch (err) {
            console.log('Partilha cancelada pelo utilizador.');
          }
        } else {
          // 4. Fallback para Desktop (Download da imagem)
          const link = document.createElement('a');
          link.download = `sintonia-${sign.toLowerCase()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          toast.success('Imagem baixada para o seu dispositivo!');
        }
        setIsSharing(false);
      }, 'image/png');

    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      toast.error('Erro ao criar imagem para partilha.');
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-6">
      
      {/* ESTE DIV É O QUE SERÁ TRANSFORMADO EM IMAGEM */}
      <div 
        ref={cardRef}
        className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700 flex flex-col items-center w-full max-w-sm relative overflow-hidden"
      >
        {/* Efeito de Brilho de Fundo (Opcional, para ficar bonito na foto) */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <h3 className="text-2xl font-bold text-white mb-1 mt-2">
          Vibração {sign}
        </h3>
        <p className="text-xs text-gray-400 mb-6 uppercase tracking-widest font-semibold">
          Sintonia Cósmica
        </p>

        {/* O GRÁFICO */}
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
                stroke="#a78bfa" // Roxo claro
                strokeWidth={3}
                fill="#8b5cf6"   // Roxo
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Branding (Marketing no Card) */}
        <div className="flex items-center gap-2 mt-4 opacity-70">
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">CM</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">
            Gerado por CosmosMatch App
          </span>
        </div>
      </div>

      {/* BOTÃO DE AÇÃO (FORA DO CARD) */}
      <button
        onClick={handleShareImage}
        disabled={isSharing}
        className="mt-6 flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-purple-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSharing ? (
          'Gerando Imagem...'
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