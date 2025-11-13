// frontend/src/features/astrology/components/NatalChartDisplay.tsx

import { FullNatalChart, PlanetPosition } from '@/types/profile.types';
import { Fragment, useState } from 'react';

// Constantes dos Signos (com aspas corrigidas)
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

// Mapeamento dos Planetas (igual)
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
};

// Constantes SVG (iguais)
const SVG_CENTER = 100;
const WHEEL_RADIUS = 90;
const TEXT_RADIUS = WHEEL_RADIUS - 12;
const PLANET_RADIUS = WHEEL_RADIUS - 45;

// (Funções Helper polarToCartesian, astroLongitudeToSvgAngle, describeArc... iguais)
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

// --- LÓGICA DE CLIQUE RESTAURADA (Passo 1) ---
/**
 * Caixa de informações que aparece quando um planeta é clicado.
 */
const PlanetDetailBox = ({ planet, onClose }: { planet: PlanetPosition; onClose: () => void }) => {
  const displayInfo = PLANET_SYMBOLS[planet.name] || { symbol: '?', color: '#FFF' };
  
  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-lg relative mt-6 animate-fadeIn">
      <button 
        onClick={onClose} 
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-600 transition-colors"
        aria-label="Fechar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      
      <h3 className="text-2xl font-bold flex items-center mb-2">
        <span 
          style={{ color: displayInfo.color, fontSize: '2rem', marginRight: '0.5rem' }}
          className="drop-shadow-sm"
        >
          {displayInfo.symbol}
        </span>
        <span className="text-white">{planet.name}</span>
      </h3>
      
      <p className="text-lg text-indigo-300 font-semibold">
        {planet.sign} a {planet.degree.toFixed(2)}°
      </p>
      
      <p className="text-gray-300 mt-2 text-sm">
        {planet.meaning}
      </p>
    </div>
  );
};
// --- FIM DA LÓGICA DE CLIQUE RESTAURADA (Passo 1) ---


interface Props {
  chart: FullNatalChart | null | undefined;
}

export const NatalChartDisplay = ({ chart }: Props) => {
  // --- LÓGICA DE CLIQUE RESTAURADA (Passo 2) ---
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetPosition | null>(null);
  // --- FIM DA LÓGICA DE CLIQUE RESTAURADA (Passo 2) ---

  if (!chart) {
    return <p className="text-center text-gray-400">Dados do mapa astral indisponíveis.</p>;
  }

  // (Sub-componente ZodiacWheel... igual)
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

  // (Sub-componente HouseLines... igual)
  const HouseLines = () => (
    <g id="house-lines" stroke="#E2E8F0" strokeWidth={1}>
      {chart.houses.map((house) => {
        const angle = astroLongitudeToSvgAngle(house.longitude);
        const lineEnd = polarToCartesian(SVG_CENTER, SVG_CENTER, WHEEL_RADIUS, angle);
        const textPos = polarToCartesian(SVG_CENTER, SVG_CENTER, WHEEL_RADIUS - 20, angle + 15);

        return (
          <Fragment key={house.name}>
            <line
              x1={SVG_CENTER}
              y1={SVG_CENTER}
              x2={lineEnd.x}
              y2={lineEnd.y}
              strokeOpacity={0.8}
            />
            <text
              x={textPos.x}
              y={textPos.y}
              fill="#E2E8F0"
              fontSize="8"
              textAnchor="middle"
              alignmentBaseline="middle"
              opacity={0.7}
            >
              {house.name.split(' ')[1]}
            </text>
          </Fragment>
        );
      })}
    </g>
  );

  // --- LÓGICA DE CLIQUE RESTAURADA (Passo 3) ---
  // (Sub-componente PlanetSymbols... com onClick)
  const PlanetSymbols = () => (
    <g id="planet-symbols">
      {chart.planets.map((planet) => {
        const displayInfo = PLANET_SYMBOLS[planet.name];
        if (!displayInfo) {
          console.warn(`Símbolo não encontrado para: ${planet.name}`);
          return null;
        }
        const angle = astroLongitudeToSvgAngle(planet.longitude);
        const pos = polarToCartesian(SVG_CENTER, SVG_CENTER, PLANET_RADIUS, angle);

        return (
          <text
            key={planet.name}
            x={pos.x}
            y={pos.y}
            fill={displayInfo.color}
            fontSize="14"
            textAnchor="middle"
            alignmentBaseline="middle"
            onClick={() => setSelectedPlanet(planet)} // <-- O onClick
            style={{ 
              filter: "drop-shadow(0 0 1px #000)", 
              cursor: "pointer" // <-- O cursor
            }}
            className="transition-transform hover:scale-150"
          >
            {displayInfo.symbol}
          </text>
        );
      })}
    </g>
  );
  // --- FIM DA LÓGICA DE CLIQUE RESTAURADA (Passo 3) ---


  return (
    <div className="w-full max-w-lg mx-auto">
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <ZodiacWheel />
        <HouseLines />
        <circle 
          cx={SVG_CENTER} 
          cy={SVG_CENTER} 
          r={WHEEL_RADIUS - 30}
          fill="#1F2937"
          stroke="#4A5568"
          strokeWidth={0.5}
        />
        <PlanetSymbols />
      </svg>
      
      {/* --- LÓGICA DE CLIQUE RESTAURADA (Passo 4) --- */}
      {/* Renderiza o PlanetDetailBox quando um planeta é selecionado */}
      {selectedPlanet && (
        <PlanetDetailBox 
          planet={selectedPlanet} 
          onClose={() => setSelectedPlanet(null)} 
        />
      )}
      {/* --- FIM DA LÓGICA DE CLIQUE RESTAURADA (Passo 4) --- */}
    </div>
  );
};