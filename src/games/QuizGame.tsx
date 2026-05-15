import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameProps } from './types';

export function QuizGame({ country, onComplete, onBack }: GameProps) {
  const questions = country.quizQuestions;
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const question = questions[currentQ];

  function handleAnswer(idx: number) {
    if (selected !== null || !question) return;
    setSelected(idx);
    if (idx === question.correctIndex) setScore(s => s + 1);
    setTimeout(() => {
      if (currentQ + 1 >= questions.length) {
        setDone(true);
      } else {
        setCurrentQ(q => q + 1);
        setSelected(null);
      }
    }, 900);
  }

  const coins = Math.round((score / Math.max(questions.length, 1)) * 50);

  if (done || !question) {
    return (
      <div className="flex flex-col h-full bg-[#1B3B6F] items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-[#FFD93D] mb-2">Koniec quizu!</h2>
        <p className="text-white text-lg mb-1">
          {score}/{questions.length} poprawnych
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
            {questions.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i < currentQ ? 'bg-[#FF8C42]' : i === currentQ ? 'bg-[#FFD93D]' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <p className="text-white/60 text-xs mt-1">
            Pytanie {currentQ + 1} z {questions.length}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white/10 rounded-2xl p-5 mb-4">
              <p className="text-white text-lg font-medium leading-relaxed">{question.question}</p>
            </div>
            <div className="space-y-3">
              {question.options.map((answer, idx) => {
                const isCorrect = idx === question.correctIndex;
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
                    onClick={() => handleAnswer(idx)}
                    className={`w-full ${cls} border rounded-2xl p-4 text-white text-left font-medium transition-colors min-h-[56px]`}
                  >
                    {answer}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
