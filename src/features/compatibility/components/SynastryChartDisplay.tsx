// frontend/src/features/compatibility/components/SynastryChartDisplay.tsx

import { Fragment } from 'react';
import { FullNatalChart, PlanetPosition } from '@/types/profile.types';
import { SynastryReport, Aspect } from '@/types/compatibility.types';

// --- Constantes de Desenho (copiadas do NatalChartDisplay) ---

const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈︎', color: '#FF4136' },
  { name: 'Taurus', symbol: '♉︎', color: '#2ECC40' },
  { name: 'Gemini', symbol: '♊︎', color: '#FFDC00' },
  { name: 'Cancer', symbol: '♋︎', color: '#0074D9' },
  { name: 'Leo', symbol: '♌︎', color: '#FF4136' },
  { name: 'Virgo', symbol: '♍︎', color: '#2ECC40' },
  { name: 'Libra', symbol: '♎︎', color: '#FFDC00' },
  { name: 'Scorpio', symbol: '♏︎', color: '#0074D9' },
  { name: 'Sagittarius', symbol: '♐︎', color: '#FF4136' },
  { name: 'Capricorn', symbol: '♑︎', color: '#2ECC40' },
  { name: 'Aquarius', symbol: '♒︎', color: '#FFDC00' },
  { name: 'Pisces', symbol: '♓︎', color: '#0074D9' },
];

const PLANET_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  'Sol': { symbol: '☉', color: '#FFDC00' },
  'Lua': { symbol: '☽', color: '#AAAAAA' },
  'Mercúrio': { symbol: '☿', color: '#FF851B' },
  'Vénus': { symbol: '♀', color: '#2ECC40' },
  'Marte': { symbol: '♂', color: '#FF4136' },
  'Júpiter': { symbol: '♃', color: '#0074D9' },
  'Saturno': { symbol: '♄', color: '#85144b' },
  'Urano': { symbol: '♅', color: '#7FDBFF' },
  'Neptuno': { symbol: '♆', color: '#B10DC9' },
  'Plutão': { symbol: '♇', color: '#F012BE' },
  // Precisamos adicionar o Ascendente aqui para as linhas
  'Ascendente': { symbol: 'AC', color: '#FFFFFF' }, 
};

const SVG_CENTER = 100;
const WHEEL_RADIUS = 90;
const TEXT_RADIUS = WHEEL_RADIUS - 12;

// --- NOVAS Constantes de Raio ---
const PLANET_RADIUS_A = WHEEL_RADIUS - 30; // Anel Interno (User A)
const PLANET_RADIUS_B = WHEEL_RADIUS - 45; // Anel Externo (User B)

// --- Funções Helper de SVG (copiadas do NatalChartDisplay) ---

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function astroLongitudeToSvgAngle(longitude: number): number {
  return (longitude + 90) % 360;
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  const d = [ "M", x, y, "L", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y, "Z" ].join(" ");
  return d;
}

// --- Fim das Funções Helper ---

interface Props {
  chartA: FullNatalChart; // O seu mapa (Anel Interno)
  chartB: FullNatalChart; // O mapa do alvo (Anel Externo)
  report: SynastryReport;
}

export const SynastryChartDisplay = ({ chartA, chartB, report }: Props) => {
  
  // (Sub-componente ZodiacWheel - copiado 100% igual)
  const ZodiacWheel = () => (
    <g id="zodiac-wheel">
      {ZODIAC_SIGNS.map((sign, index) => {
        const startAngle = index * 30;
        const endAngle = (index + 1) * 30;
        const textAngle = startAngle + 15;
        const textPos = polarToCartesian(SVG_CENTER, SVG_CENTER, TEXT_RADIUS, textAngle);
        
        return (
          <Fragment key={sign.name}>
            <path
              d={describeArc(SVG_CENTER, SVG_CENTER, WHEEL_RADIUS, startAngle, endAngle)}
              fill={sign.color}
              fillOpacity={0.2}
              stroke="#4A5568"
              strokeWidth={0.5}
            />
            <text
              x={textPos.x}
              y={textPos.y}
              fill="#E2E8F0"
              fontSize="12"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {sign.symbol}
            </text>
          </Fragment>
        );
      })}
    </g>
  );

  // --- NOVO Sub-componente PlanetSymbols ---
  // Este agora desenha DOIS anéis de planetas
  const PlanetSymbols = () => (
    <g id="planet-symbols">
      {/* Anel A (Interno) - O Seu Mapa */}
      {chartA.planets.map((planet) => {
        const displayInfo = PLANET_SYMBOLS[planet.name];
        if (!displayInfo) return null;
        const angle = astroLongitudeToSvgAngle(planet.longitude);
        const pos = polarToCartesian(SVG_CENTER, SVG_CENTER, PLANET_RADIUS_A, angle);
        return (
          <text
            key={`A-${planet.name}`}
            x={pos.x}
            y={pos.y}
            fill={displayInfo.color}
            fontSize="10" // Um pouco menor
            textAnchor="middle"
            alignmentBaseline="middle"
            style={{ filter: "drop-shadow(0 0 1px #000)" }}
          >
            {displayInfo.symbol}
          </text>
        );
      })}
      {/* Anel B (Externo) - O Mapa do Alvo */}
      {chartB.planets.map((planet) => {
        const displayInfo = PLANET_SYMBOLS[planet.name];
        if (!displayInfo) return null;
        const angle = astroLongitudeToSvgAngle(planet.longitude);
        const pos = polarToCartesian(SVG_CENTER, SVG_CENTER, PLANET_RADIUS_B, angle);
        return (
          <text
            key={`B-${planet.name}`}
            x={pos.x}
            y={pos.y}
            fill={displayInfo.color}
            fontSize="10" // Um pouco menor
            textAnchor="middle"
            alignmentBaseline="middle"
            style={{ filter: "drop-shadow(0 0 1px #000)" }}
          >
            {displayInfo.symbol}
          </text>
        );
      })}
    </g>
  );

  // --- NOVO Sub-componente AspectLines ---
  // A "Magia" está aqui. Ele desenha as linhas
  const AspectLines = () => {
    
    // Função helper para encontrar um planeta/ascendente num mapa
    const findPoint = (chart: FullNatalChart, name: string): PlanetPosition | undefined => {
      if (name === 'Ascendente') {
        // O Ascendente está nas casas, mas precisamos do formato 'PlanetPosition'
        const asc = chart.houses.find(h => h.name === 'Casa 1 (ASC)');
        if (!asc) return undefined;
        // Convertemos para um formato que o nosso código entende
        return { 
          name: 'Ascendente', 
          longitude: asc.longitude,
          sign: asc.sign,
          degree: asc.degree,
          meaning: 'A sua personalidade exterior'
        };
      }
      return chart.planets.find(p => p.name === name);
    }
    
    // Função para criar uma única linha de aspecto
    const createLine = (aspect: Aspect, key: string, color: string) => {
      const pointA = findPoint(chartA, aspect.planetAName);
      const pointB = findPoint(chartB, aspect.planetBName);

      // Se não encontrarmos os planetas (ex: "Saturno" vs "Ascendente" se não os procurámos)
      if (!pointA || !pointB) {
        console.warn(`Não foi possível desenhar a linha para: ${aspect.planetAName} -> ${aspect.planetBName}`);
        return null;
      }

      // Calcular as posições (x, y) de início e fim
      const angleA = astroLongitudeToSvgAngle(pointA.longitude);
      const posA = polarToCartesian(SVG_CENTER, SVG_CENTER, PLANET_RADIUS_A, angleA); // Anel Interno

      const angleB = astroLongitudeToSvgAngle(pointB.longitude);
      const posB = polarToCartesian(SVG_CENTER, SVG_CENTER, PLANET_RADIUS_B, angleB); // Anel Externo

      return (
        <line
          key={key}
          x1={posA.x}
          y1={posA.y}
          x2={posB.x}
          y2={posB.y}
          stroke={color}
          strokeWidth={0.5}
          opacity={0.7}
        />
      );
    }

    return (
      <g id="aspect-lines">
        {/* Linhas Verdes (Positivas) */}
        {report.positiveAspects.map((aspect, idx) => 
          createLine(aspect, `pos-${idx}`, '#2ECC40') // Verde
        )}
        {/* Linhas Vermelhas (Desafiadoras) */}
        {report.challengingAspects.map((aspect, idx) => 
          createLine(aspect, `neg-${idx}`, '#FF4136') // Vermelho
        )}
      </g>
    );
  }


  return (
    <div className="w-full max-w-lg mx-auto">
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        {/* Camada 1: Zodíaco (Fundo) */}
        <ZodiacWheel />
        
        {/* Camada 2: Círculo central (não precisamos mais das 'HouseLines') */}
        <circle 
          cx={SVG_CENTER} 
          cy={SVG_CENTER} 
          r={WHEEL_RADIUS - 55} // Um círculo central menor
          fill="#1F2937"
          stroke="#4A5568"
          strokeWidth={0.5}
        />

        {/* Camada 3: As Linhas de Aspecto (Verde/Vermelho) */}
        <AspectLines />

        {/* Camada 4: Os Planetas (Anéis Interno e Externo) */}
        <PlanetSymbols />

      </svg>
      {/* Removemos o PlanetDetailBox para simplificar este componente */}
    </div>
  );
};