import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { getCountryById } from '@/data';
import { QuizGame } from '@/games/QuizGame';
import { FlagGuessGame } from '@/games/FlagGuessGame';
import { PhraseMatchGame } from '@/games/PhraseMatchGame';
import { DetectiveGame } from '@/games/DetectiveGame';
import { WordPuzzle } from '@/games/WordPuzzle';

type GameType = 'quiz' | 'flag' | 'phrase' | 'detective' | 'puzzle';

interface GameInfo {
  id: GameType;
  name: string;
  icon: string;
  desc: string;
  maxCoins: number;
}

const GAME_LIST: GameInfo[] = [
  { id: 'quiz', name: 'Quiz', icon: '❓', desc: 'Odpowiedz na pytania o kraju', maxCoins: 50 },
  { id: 'flag', name: 'Flagi', icon: '🏳️', desc: 'Rozpoznaj flagi świata', maxCoins: 30 },
  { id: 'phrase', name: 'Słówka', icon: '💬', desc: 'Dopasuj zwroty w obcym języku', maxCoins: 30 },
  {
    id: 'detective',
    name: 'Detektyw',
    icon: '🔍',
    desc: 'Znajdź ukryty kraj po wskazówkach',
    maxCoins: 20,
  },
  { id: 'puzzle', name: 'Puzzle', icon: '🧩', desc: 'Ułóż nazwę stolicy z liter', maxCoins: 20 },
];

export function MiniGameScreen() {
  const [activeGame, setActiveGame] = useState<GameType | null>(null);

  const countryId = useGameStore(s => s.selectedCountryId);
  const goBack = useGameStore(s => s.goBack);
  const addCoins = useGameStore(s => s.addCoins);
  const addXp = useGameStore(s => s.addXp);

  const country = countryId ? getCountryById(countryId) : null;

  function handleComplete(coins: number) {
    addCoins(coins);
    addXp(15);
    setActiveGame(null);
  }

  if (!country) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1B3B6F]">
        <div className="text-center p-6">
          <p className="text-white/60 mb-4">Wybierz najpierw kraj na mapie</p>
          <button
            onClick={goBack}
            className="bg-[#FF8C42] text-white px-6 py-3 rounded-2xl font-bold min-h-[44px]"
          >
            ← Wróć
          </button>
        </div>
      </div>
    );
  }

  if (activeGame) {
    const gameProps = {
      country,
      onComplete: handleComplete,
      onBack: () => setActiveGame(null),
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGame}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {activeGame === 'quiz' && <QuizGame {...gameProps} />}
          {activeGame === 'flag' && <FlagGuessGame {...gameProps} />}
          {activeGame === 'phrase' && <PhraseMatchGame {...gameProps} />}
          {activeGame === 'detective' && <DetectiveGame {...gameProps} />}
          {activeGame === 'puzzle' && <WordPuzzle {...gameProps} />}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1B3B6F]">
      <div className="relative bg-[#152d55] px-4 pt-4 pb-3">
        <button
          onClick={goBack}
          className="absolute left-4 top-4 bg-white/10 rounded-xl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Wróć na ekran kraju"
        >
          ←
        </button>
        <div className="text-center">
          <div className="text-4xl mb-1">{country.flagEmoji}</div>
          <h1 className="text-xl font-bold text-[#FFD93D]">Misje: {country.namePL}</h1>
          <p className="text-white/60 text-sm">Wybierz rodzaj misji</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {GAME_LIST.map((game, i) => (
          <motion.button
            key={game.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveGame(game.id)}
            className="w-full bg-white/10 rounded-2xl p-4 flex items-center gap-4 text-left min-h-[72px]"
          >
            <span className="text-3xl">{game.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold">{game.name}</p>
              <p className="text-white/60 text-sm">{game.desc}</p>
            </div>
            <span className="text-[#FFD93D] font-bold text-sm shrink-0">+{game.maxCoins} 🪙</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
