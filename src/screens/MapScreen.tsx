import { useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { CONTINENTS } from '@/data';
import { COUNTRIES } from '@/data';
import type { Country } from '@/types/Country';

const WorldMap = lazy(() =>
  import('@/components/Map/WorldMap').then(m => ({ default: m.WorldMap }))
);

export function MapScreen() {
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);

  const visitedCountries = useGameStore(s => s.progress.visitedCountries);
  const coins = useGameStore(s => s.progress.coins);
  const level = useGameStore(s => s.progress.level);
  const player = useGameStore(s => s.player);
  const goToCountry = useGameStore(s => s.goToCountry);
  const goToScreen = useGameStore(s => s.goToScreen);
  const visitCountry = useGameStore(s => s.visitCountry);

  const collectedFacts = useGameStore(s => s.progress.collectedFacts);

  function handleCountrySelect(country: Country) {
    visitCountry(country.id);
    goToCountry(country.id);
  }

  const continentEmojis: Record<string, string> = {
    Europa: '🏰',
    Azja: '🏯',
    Afryka: '🦁',
    'Ameryka Północna': '🗽',
    'Ameryka Południowa': '🌿',
    'Australia i Oceania': '🦘',
  };

  return (
    <div className="flex flex-col h-full bg-[#1B3B6F]">
      {/* Górny pasek */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#152d55] shadow-md">
        <button
          onClick={() => goToScreen('passport')}
          className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 min-h-[44px]"
          aria-label="Paszport odkrywcy"
        >
          <span className="text-lg">🧭</span>
          <span className="text-white/90 text-sm font-medium truncate max-w-[80px]">
            {player?.name ?? 'Odkrywca'}
          </span>
        </button>

        <div className="text-center">
          <p className="text-[#FFD93D] font-bold text-xs">
            {visitedCountries.length}/{COUNTRIES.length} krajów
          </p>
          <p className="text-white/60 text-xs">{collectedFacts.length} ciekawostek</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => goToScreen('shop')}
            className="flex items-center gap-1 bg-[#FFD93D]/20 rounded-xl px-3 py-2 min-h-[44px]"
            aria-label={`Monety: ${coins}`}
          >
            <span>🪙</span>
            <span className="text-[#FFD93D] font-bold text-sm">{coins}</span>
          </button>

          <button
            onClick={() => goToScreen('quiz')}
            className="bg-white/10 rounded-xl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Quiz geograficzny"
          >
            <span className="text-xl">🧠</span>
          </button>

          <button
            onClick={() => goToScreen('missions')}
            className="bg-white/10 rounded-xl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Misje"
          >
            <span className="text-xl">📋</span>
          </button>

          <button
            onClick={() => goToScreen('backpack')}
            className="bg-white/10 rounded-xl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Plecak odkrywcy"
          >
            <span className="text-xl">🎒</span>
          </button>
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1 relative overflow-hidden">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-5xl mb-3 animate-pulse">🌍</div>
                <p className="text-white/60">Ładowanie mapy…</p>
              </div>
            </div>
          }
        >
          <WorldMap
            visitedCountries={visitedCountries}
            selectedContinent={selectedContinent}
            onCountrySelect={handleCountrySelect}
          />
        </Suspense>

        {/* Poziom gracza */}
        <div className="absolute top-2 right-2 bg-[#1B3B6F]/80 backdrop-blur-sm rounded-xl px-3 py-1">
          <p className="text-[#FFD93D] text-xs font-bold">Poz. {level}</p>
        </div>
      </div>

      {/* Filtr kontynentów */}
      <div className="bg-[#152d55] px-3 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedContinent(null)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors min-h-[40px] ${
              selectedContinent === null
                ? 'bg-[#FFD93D] text-[#1B3B6F]'
                : 'bg-white/10 text-white/80'
            }`}
            aria-pressed={selectedContinent === null}
          >
            🌐 Wszystkie
          </motion.button>

          {CONTINENTS.map(continent => (
            <motion.button
              key={continent}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedContinent(prev => (prev === continent ? null : continent))}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors min-h-[40px] ${
                selectedContinent === continent
                  ? 'bg-[#FFD93D] text-[#1B3B6F]'
                  : 'bg-white/10 text-white/80'
              }`}
              aria-pressed={selectedContinent === continent}
            >
              {continentEmojis[continent]} {continent}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
