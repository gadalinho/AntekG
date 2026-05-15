import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export function OnboardingScreen() {
  const [name, setName] = useState('');
  const [step, setStep] = useState<'intro' | 'name'>('intro');
  const setupPlayer = useGameStore(s => s.setupPlayer);

  const handleStart = () => {
    const trimmed = name.trim();
    if (trimmed.length < 1) return;
    setupPlayer(trimmed);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      {step === 'intro' ? (
        <motion.div
          key="intro"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-8xl"
          >
            🗺️
          </motion.div>

          <div>
            <h1 className="text-4xl font-bold text-[#FFD93D] mb-2">World Explorer</h1>
            <p className="text-white/80 text-lg leading-relaxed max-w-xs">
              Odkrywaj świat, ucz się ciekawostek i zostań
              <br />
              <strong className="text-[#3FB8AF]">Mistrzem Odkrywcy!</strong>
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs text-left text-sm">
            {[
              { icon: '🌍', text: '30 krajów do odkrycia' },
              { icon: '🎮', text: '5 rodzajów mini-gier' },
              { icon: '🏆', text: '8 odznak do zdobycia' },
              { icon: '🎒', text: 'Plecak z kolekcją ciekawostek' },
            ].map(item => (
              <div
                key={item.text}
                className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-white/90">{item.text}</span>
              </div>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep('name')}
            className="w-full max-w-xs bg-[#FF8C42] text-white font-bold text-xl py-4 rounded-2xl shadow-lg"
          >
            Zaczynamy! 🚀
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          key="name"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center gap-6 w-full max-w-xs"
        >
          <div className="text-7xl">🧭</div>
          <div>
            <h2 className="text-3xl font-bold text-[#FFD93D] mb-1">Jak masz na imię?</h2>
            <p className="text-white/70">Twoje imię pojawi się w paszporcie odkrywcy</p>
          </div>

          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value.slice(0, 20))}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            placeholder="Wpisz swoje imię…"
            maxLength={20}
            autoFocus
            className="w-full bg-white/15 border-2 border-white/30 focus:border-[#FFD93D] text-white text-xl text-center py-4 px-4 rounded-2xl outline-none placeholder:text-white/40 transition-colors"
            aria-label="Imię odkrywcy"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            disabled={name.trim().length === 0}
            className="w-full bg-[#FF8C42] disabled:bg-white/20 disabled:text-white/40 text-white font-bold text-xl py-4 rounded-2xl shadow-lg transition-colors"
          >
            Wyruszam w świat! 🌍
          </motion.button>

          <button onClick={() => setStep('intro')} className="text-white/50 text-sm underline">
            ← Wróć
          </button>
        </motion.div>
      )}
    </div>
  );
}
