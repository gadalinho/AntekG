import { useState } from 'react';
import { motion } from 'framer-motion';
import { COUNTRIES } from '@/data';
import type { Country } from '@/types/Country';
import type { GameProps } from './types';

const QUESTIONS = 3;

interface DetectiveRound {
  target: Country;
  choices: Country[];
}

function buildRounds(country: Country): DetectiveRound[] {
  const others = COUNTRIES.filter(c => c.id !== country.id).sort(() => Math.random() - 0.5);
  const targets: Country[] = [country, ...others.slice(0, QUESTIONS - 1)].sort(
    () => Math.random() - 0.5
  );
  return targets.map(target => {
    const distractors = COUNTRIES.filter(c => c.id !== target.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const choices = [...distractors, target].sort(() => Math.random() - 0.5);
    return { target, choices };
  });
}

export function DetectiveGame({ country, onComplete, onBack }: GameProps) {
  const [rounds] = useState(() => buildRounds(country));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const current = rounds[round];

  function handleChoice(id: string) {
    if (selected !== null || !current) return;
    setSelected(id);
    if (id === current.target.id) setScore(s => s + 1);
    setTimeout(() => {
      if (round + 1 >= QUESTIONS) setDone(true);
      else {
        setRound(r => r + 1);
        setSelected(null);
      }
    }, 1100);
  }

  const coins = Math.round((score / QUESTIONS) * 20);

  if (done || !current) {
    return (
      <div className="flex flex-col h-full bg-[#1B3B6F] items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-[#FFD93D] mb-2">Sprawa rozwiązana!</h2>
        <p className="text-white text-lg mb-1">
          {score}/{QUESTIONS} trafień
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
            Trop {round + 1} z {QUESTIONS}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <div className="bg-[#152d55] rounded-2xl p-5">
          <p className="text-[#FFD93D] text-xs font-bold mb-3">🔍 DETEKTYW MÓWI:</p>
          <p className="text-white leading-relaxed text-sm">
            &ldquo;Ukryłem się w kraju, gdzie słynnym miejscem jest{' '}
            <span className="font-bold text-[#FFD93D]">{current.target.famousPlace.name}</span>.{' '}
            {current.target.famousPlace.description} W którym kraju jestem?&rdquo;
          </p>
        </div>

        <div className="space-y-3">
          {current.choices.map(c => {
            const isCorrect = c.id === current.target.id;
            const isSelected = selected === c.id;
            let cls = 'bg-white/10 border-transparent';
            if (selected !== null) {
              if (isCorrect) cls = 'bg-[#7FB069]/40 border-[#7FB069]';
              else if (isSelected) cls = 'bg-red-500/30 border-red-400';
            }
            return (
              <motion.button
                key={c.id}
                whileTap={{ scale: selected === null ? 0.97 : 1 }}
                onClick={() => handleChoice(c.id)}
                className={`w-full ${cls} border rounded-2xl p-4 flex items-center gap-3 transition-colors min-h-[56px]`}
              >
                <span className="text-2xl">{c.flagEmoji}</span>
                <span className="text-white font-medium">{c.namePL}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
