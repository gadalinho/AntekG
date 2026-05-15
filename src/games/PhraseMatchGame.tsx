import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameProps } from './types';

export function PhraseMatchGame({ country, onComplete, onBack }: GameProps) {
  const phrases = country.phrases;

  const [answerOrders] = useState(() =>
    phrases.map((_, i) => {
      const others = phrases.map((_, j) => j).filter(j => j !== i);
      const picks = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
      return [...picks, i].sort(() => Math.random() - 0.5);
    })
  );

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const currentPhrase = phrases[current];
  const answerOrder = answerOrders[current] ?? [0, 1, 2, 3];

  function handleChoice(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === current) setScore(s => s + 1);
    setTimeout(() => {
      if (current + 1 >= phrases.length) setDone(true);
      else {
        setCurrent(c => c + 1);
        setSelected(null);
      }
    }, 900);
  }

  const coins = Math.round((score / Math.max(phrases.length, 1)) * 30);

  if (done || !currentPhrase) {
    return (
      <div className="flex flex-col h-full bg-[#1B3B6F] items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-2xl font-bold text-[#FFD93D] mb-2">Brawo!</h2>
        <p className="text-white text-lg mb-1">
          {score}/{phrases.length} poprawnych
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
            {phrases.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i < current ? 'bg-[#FF8C42]' : i === current ? 'bg-[#FFD93D]' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <p className="text-white/60 text-xs mt-1">
            Zwrot {current + 1} z {phrases.length}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <div className="bg-white/10 rounded-2xl p-5 text-center">
          <p className="text-white/50 text-xs mb-2">Co znaczy to wyrażenie?</p>
          <p className="text-[#FFD93D] text-3xl font-bold">{currentPhrase.local}</p>
          <p className="text-white/50 text-sm italic mt-1">[{currentPhrase.phonetic}]</p>
        </div>

        <div className="space-y-3">
          {answerOrder.map(idx => {
            const phrase = phrases[idx];
            if (!phrase) return null;
            const isCorrect = idx === current;
            const isSelected = selected === idx;
            let cls = 'bg-white/10 border-transparent';
            if (selected !== null) {
              if (isCorrect) cls = 'bg-[#7FB069]/40 border-[#7FB069]';
              else if (isSelected) cls = 'bg-red-500/30 border-red-400';
            }
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: selected === null ? 0.97 : 1 }}
                onClick={() => handleChoice(idx)}
                className={`w-full ${cls} border rounded-2xl p-4 text-white text-left font-medium transition-colors min-h-[56px]`}
              >
                {phrase.polish}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
