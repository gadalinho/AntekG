import { useState } from 'react';
import { motion } from 'framer-motion';
import { COUNTRIES } from '@/data';
import type { GameProps } from './types';

const ROUNDS = 5;

interface Round {
  flagEmoji: string;
  correctName: string;
  choices: string[];
}

function buildRounds(countryId: string): Round[] {
  const pool = COUNTRIES.filter(c => c.id !== countryId);
  return Array.from({ length: ROUNDS }, (_, i) => {
    const target =
      i === 0
        ? (COUNTRIES.find(c => c.id === countryId) ?? COUNTRIES[0]!)
        : (pool[i % pool.length] ?? pool[0]!);
    const others = COUNTRIES.filter(c => c.id !== target.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const choices = [...others.map(c => c.namePL), target.namePL].sort(() => Math.random() - 0.5);
    return { flagEmoji: target.flagEmoji, correctName: target.namePL, choices };
  });
}

export function FlagGuessGame({ country, onComplete, onBack }: GameProps) {
  const [rounds] = useState(() => buildRounds(country.id));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const current = rounds[round];

  function handleChoice(name: string) {
    if (selected !== null || !current) return;
    setSelected(name);
    if (name === current.correctName) setScore(s => s + 1);
    setTimeout(() => {
      if (round + 1 >= ROUNDS) setDone(true);
      else {
        setRound(r => r + 1);
        setSelected(null);
      }
    }, 900);
  }

  const coins = Math.round((score / ROUNDS) * 30);

  if (done || !current) {
    return (
      <div className="flex flex-col h-full bg-[#1B3B6F] items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🏳️</div>
        <h2 className="text-2xl font-bold text-[#FFD93D] mb-2">Koniec!</h2>
        <p className="text-white text-lg mb-1">
          {score}/{ROUNDS} poprawnych
        </p>
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
        <div className="flex-1">
          <div className="flex gap-1">
            {rounds.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i < round ? 'bg-[#FF8C42]' : i === round ? 'bg-[#FFD93D]' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <p className="text-white/60 text-xs mt-1">
            Runda {round + 1} z {ROUNDS}
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              key={round}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-9xl mb-4"
            >
              {current.flagEmoji}
            </motion.div>
            <p className="text-white/60 text-sm">Czyja to flaga?</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-2">
          {current.choices.map(name => {
            const isCorrect = name === current.correctName;
            const isSelected = selected === name;
            let cls = 'bg-white/10 border-transparent';
            if (selected !== null) {
              if (isCorrect) cls = 'bg-[#7FB069]/40 border-[#7FB069]';
              else if (isSelected) cls = 'bg-red-500/30 border-red-400';
            }
            return (
              <motion.button
                key={name}
                whileTap={{ scale: selected === null ? 0.95 : 1 }}
                onClick={() => handleChoice(name)}
                className={`${cls} border rounded-2xl p-3 text-white font-medium text-center min-h-[60px] transition-colors`}
              >
                {name}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
