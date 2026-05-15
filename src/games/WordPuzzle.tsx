import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameProps } from './types';

interface LetterTile {
  letter: string;
  id: number;
  used: boolean;
}

function makeShuffled(word: string): LetterTile[] {
  const letters = word
    .toUpperCase()
    .split('')
    .map((letter, id) => ({ letter, id, used: false }));
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = letters[i]!;
    letters[i] = letters[j]!;
    letters[j] = tmp;
  }
  return letters;
}

export function WordPuzzle({ country, onComplete, onBack }: GameProps) {
  const target = country.capital.toUpperCase();
  const [pool, setPool] = useState<LetterTile[]>(() => makeShuffled(country.capital));
  const [answer, setAnswer] = useState<LetterTile[]>([]);
  const [solved, setSolved] = useState(false);
  const [shake, setShake] = useState(false);

  function pickLetter(id: number) {
    if (solved) return;
    setPool(prev => prev.map(t => (t.id === id ? { ...t, used: true } : t)));
    setAnswer(prev => {
      const tile = pool.find(t => t.id === id);
      if (!tile) return prev;
      const next = [...prev, tile];
      if (next.length === target.length) {
        const word = next.map(t => t.letter).join('');
        if (word === target) {
          setSolved(true);
        } else {
          setShake(true);
          setTimeout(() => {
            setPool(p => p.map(t => ({ ...t, used: false })));
            setAnswer([]);
            setShake(false);
          }, 500);
        }
      }
      return next;
    });
  }

  function removeLetter(id: number) {
    if (solved) return;
    setAnswer(prev => prev.filter(t => t.id !== id));
    setPool(prev => prev.map(t => (t.id === id ? { ...t, used: false } : t)));
  }

  const coins = solved ? 20 : 0;

  if (solved) {
    return (
      <div className="flex flex-col h-full bg-[#1B3B6F] items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🧩</div>
        <h2 className="text-2xl font-bold text-[#FFD93D] mb-2">Ułożono!</h2>
        <p className="text-white text-2xl font-bold mb-1">{country.capital}</p>
        <p className="text-white/60 text-sm mb-4">Stolica kraju {country.namePL}</p>
        <p className="text-[#FF8C42] text-3xl font-bold mb-8">+{coins} 🪙</p>
        <button
          onClick={() => onComplete(coins)}
          className="bg-[#FF8C42] text-white font-bold px-8 py-4 rounded-2xl text-lg min-h-[56px]"
        >
          Zbierz nagrody
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1B3B6F]">
      <div className="bg-[#152d55] px-4 pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="bg-white/10 rounded-xl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Wróć"
        >
          ←
        </button>
        <p className="text-white font-bold">🧩 Ułóż stolicę {country.namePL}</p>
      </div>

      <div className="flex-1 p-4 flex flex-col justify-center gap-10">
        <div className="text-center">
          <p className="text-white/50 text-sm mb-5">Kliknij litery w odpowiedniej kolejności</p>
          <motion.div
            animate={{ x: shake ? [0, -10, 10, -10, 10, 0] : 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center gap-2 flex-wrap min-h-[52px]"
          >
            {answer.map(tile => (
              <button
                key={tile.id}
                onClick={() => removeLetter(tile.id)}
                className="w-11 h-11 bg-[#FF8C42] rounded-xl text-white font-bold text-lg active:scale-90 transition-transform"
              >
                {tile.letter}
              </button>
            ))}
            {answer.length < target.length && (
              <div className="w-11 h-11 border-2 border-dashed border-white/30 rounded-xl" />
            )}
          </motion.div>
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {pool.map(tile => (
            <button
              key={tile.id}
              onClick={() => !tile.used && pickLetter(tile.id)}
              disabled={tile.used}
              className={`w-11 h-11 rounded-xl font-bold text-lg transition-all ${
                tile.used
                  ? 'bg-white/5 text-transparent cursor-default'
                  : 'bg-white/20 text-white active:scale-90'
              }`}
            >
              {tile.letter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
