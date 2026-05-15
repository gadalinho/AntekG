import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { COUNTRIES } from '@/data';
import type { Country } from '@/types/Country';

type QuizMode = 'menu' | 'playing' | 'result';
type QuizCategory = 'flagi' | 'stolice' | 'mapa' | 'mieszane';

interface Question {
  id: string;
  type: QuizCategory;
  prompt: string; // Text above question
  visual?: string; // Flag emoji or map emoji
  question: string;
  options: string[];
  correctIndex: number;
  countryId: string;
}

const CATEGORY_INFO: Record<
  QuizCategory,
  { label: string; icon: string; desc: string; color: string }
> = {
  flagi: { label: 'Zgadnij flagę', icon: '🚩', desc: 'Rozpoznaj kraj po fladze', color: '#FF8C42' },
  stolice: {
    label: 'Stolice świata',
    icon: '🏛️',
    desc: 'Wskaż stolicę podanego kraju',
    color: '#5B8FDE',
  },
  mapa: {
    label: 'Gdzie leżę?',
    icon: '🗺️',
    desc: 'Zgadnij kraj po kontynencie i wskazówkach',
    color: '#7FB069',
  },
  mieszane: {
    label: 'Wszystko miesza',
    icon: '🎲',
    desc: 'Losowy mix wszystkich kategorii',
    color: '#FFD93D',
  },
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickDistractors(correct: Country, all: Country[], count: number): Country[] {
  const pool = all.filter(c => c.id !== correct.id);
  return shuffle(pool).slice(0, count);
}

function buildFlagQuestion(country: Country, all: Country[]): Question {
  const distractors = pickDistractors(country, all, 3);
  const options = shuffle([country, ...distractors]).map(c => c.namePL);
  const correctIndex = options.indexOf(country.namePL);
  return {
    id: `flag_${country.id}`,
    type: 'flagi',
    prompt: 'Czyja to flaga?',
    visual: country.flagEmoji,
    question: 'Wybierz prawidłową odpowiedź:',
    options,
    correctIndex,
    countryId: country.id,
  };
}

function buildCapitalQuestion(country: Country, all: Country[]): Question {
  const distractors = pickDistractors(country, all, 3);
  const options = shuffle([country, ...distractors]).map(c => c.capital);
  const correctIndex = options.indexOf(country.capital);
  return {
    id: `cap_${country.id}`,
    type: 'stolice',
    prompt: `${country.flagEmoji} ${country.namePL}`,
    question: 'Jakie jest stolica tego kraju?',
    options,
    correctIndex,
    countryId: country.id,
  };
}

function buildMapQuestion(country: Country, all: Country[]): Question {
  // Use same-continent distractors for harder challenge
  const sameContinent = all.filter(c => c.continent === country.continent && c.id !== country.id);
  const otherContinent = all.filter(c => c.continent !== country.continent);
  const pool = shuffle([...sameContinent, ...otherContinent]);
  const distractors = pool.slice(0, 3);
  const options = shuffle([country, ...distractors]).map(c => c.namePL);
  const correctIndex = options.indexOf(country.namePL);
  const continentEmojis: Record<string, string> = {
    Europa: '🏰',
    Azja: '🏯',
    Afryka: '🦁',
    'Ameryka Północna': '🗽',
    'Ameryka Południowa': '🌿',
    'Australia i Oceania': '🦘',
  };
  return {
    id: `map_${country.id}`,
    type: 'mapa',
    prompt: `Kontynent: ${continentEmojis[country.continent] ?? '🌍'} ${country.continent}`,
    visual: '🗺️',
    question: `Stolica tego kraju to ${country.capital}. Jak się nazywa ten kraj?`,
    options,
    correctIndex,
    countryId: country.id,
  };
}

function generateQuestions(category: QuizCategory, count = 10): Question[] {
  const all = COUNTRIES.filter(c => c.available);
  const pool = shuffle(all).slice(0, Math.min(count * 3, all.length));

  const builders = {
    flagi: buildFlagQuestion,
    stolice: buildCapitalQuestion,
    mapa: buildMapQuestion,
    mieszane: (c: Country, a: Country[]) => {
      const fns: Array<(c: Country, a: Country[]) => Question> = [
        buildFlagQuestion,
        buildCapitalQuestion,
        buildMapQuestion,
      ];
      return fns[Math.floor(Math.random() * fns.length)]!(c, a);
    },
  };

  const questions: Question[] = [];
  const used = new Set<string>();

  for (const country of pool) {
    if (questions.length >= count) break;
    const key = `${category}_${country.id}`;
    if (used.has(key)) continue;
    used.add(key);
    questions.push(builders[category](country, all));
  }

  return questions.slice(0, count);
}

const TIMER_SECONDS = 20;

export function QuizScreen() {
  const goToMap = useGameStore(s => s.goToMap);
  const addCoins = useGameStore(s => s.addCoins);
  const addXp = useGameStore(s => s.addXp);
  const trackCorrectAnswer = useGameStore(s => s.trackCorrectAnswer);
  const incrementMetric = useGameStore(s => s.incrementMetric);

  const [mode, setMode] = useState<QuizMode>('menu');
  const [category, setCategory] = useState<QuizCategory>('mieszane');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const handleAnswer = useCallback(
    (idx: number) => {
      if (selected !== null) return;
      const q = questions[current];
      if (!q) return;
      setSelected(idx);
      setTimerActive(false);
      const correct = idx === q.correctIndex;
      setAnswers(prev => [...prev, correct]);
      if (correct) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setBestStreak(s => Math.max(s, newStreak));
        setScore(s => s + 10 + (newStreak > 1 ? (newStreak - 1) * 3 : 0));
        trackCorrectAnswer();
      } else {
        setStreak(0);
      }
    },
    [selected, questions, current, streak, trackCorrectAnswer]
  );

  // Auto-timeout
  useEffect(() => {
    if (!timerActive) return;
    if (timer <= 0) {
      handleAnswer(99); // wrong auto-answer
      return;
    }
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, timerActive, handleAnswer]);

  // Auto-advance after answer
  useEffect(() => {
    if (selected === null) return;
    const id = setTimeout(() => {
      if (current + 1 >= questions.length) {
        const earned = Math.round(score / 5);
        const xpEarned = Math.round(score / 3);
        addCoins(earned);
        addXp(xpEarned);
        incrementMetric('quizRoundsPlayed', 1);
        setMode('result');
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
        setTimer(TIMER_SECONDS);
        setTimerActive(true);
      }
    }, 1200);
    return () => clearTimeout(id);
  }, [selected, current, questions.length, score, addCoins, addXp, incrementMetric]);

  function startQuiz(cat: QuizCategory) {
    setCategory(cat);
    const qs = generateQuestions(cat);
    setQuestions(qs);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setAnswers([]);
    setTimer(TIMER_SECONDS);
    setTimerActive(true);
    setMode('playing');
  }

  if (mode === 'menu') {
    return (
      <div className="flex flex-col h-full bg-[#1B3B6F]">
        <div className="bg-[#152d55] px-4 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={goToMap}
            className="bg-white/10 rounded-xl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Wróć na mapę"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#FFD93D]">🧠 Quiz Geograficzny</h1>
            <p className="text-white/60 text-sm">Wybierz kategorię i zagraj!</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {(Object.keys(CATEGORY_INFO) as QuizCategory[]).map(cat => {
            const info = CATEGORY_INFO[cat];
            return (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.97 }}
                onClick={() => startQuiz(cat)}
                className="w-full rounded-2xl p-5 flex items-center gap-4 text-left"
                style={{ backgroundColor: `${info.color}22`, border: `2px solid ${info.color}44` }}
              >
                <span className="text-4xl">{info.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-white text-lg">{info.label}</p>
                  <p className="text-white/60 text-sm">{info.desc}</p>
                </div>
                <span className="text-white/40 text-xl">▶</span>
              </motion.button>
            );
          })}

          <div className="bg-white/5 rounded-2xl p-4 mt-4">
            <p className="text-white/50 text-sm text-center">
              💡 Za każdą poprawną odpowiedź zdobywasz 10 pkt + bonus za serię!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'result') {
    const correct = answers.filter(Boolean).length;
    const total = answers.length;
    const pct = Math.round((correct / total) * 100);
    const coinsEarned = Math.round(score / 5);
    const xpEarned = Math.round(score / 3);
    const grade =
      pct >= 90
        ? '🏆 Fenomenalnie!'
        : pct >= 70
          ? '⭐ Świetnie!'
          : pct >= 50
            ? '👍 Dobrze!'
            : '📚 Ćwicz dalej!';

    return (
      <div className="flex flex-col h-full bg-[#1B3B6F] items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#152d55] rounded-3xl p-8 w-full max-w-sm text-center space-y-4"
        >
          <p className="text-5xl">{pct >= 50 ? '🎉' : '😅'}</p>
          <h2 className="text-2xl font-bold text-[#FFD93D]">{grade}</h2>
          <p className="text-white/70">
            Poprawnych:{' '}
            <span className="text-white font-bold">
              {correct}/{total}
            </span>
          </p>
          <div className="bg-[#1B3B6F] rounded-2xl p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-white/60">Punkty</span>
              <span className="text-[#FFD93D] font-bold">{score}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Najlepsza seria</span>
              <span className="text-[#FF8C42] font-bold">🔥 {bestStreak}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Zdobyte monety</span>
              <span className="text-[#FFD93D] font-bold">+{coinsEarned} 🪙</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Zdobyte XP</span>
              <span className="text-[#7FB069] font-bold">+{xpEarned} XP</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => startQuiz(category)}
              className="flex-1 bg-[#FF8C42] text-white font-bold py-3 rounded-2xl"
            >
              🔄 Zagraj znowu
            </button>
            <button
              onClick={() => setMode('menu')}
              className="flex-1 bg-white/10 text-white font-bold py-3 rounded-2xl"
            >
              📋 Menu
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // PLAYING
  const q = questions[current];
  if (!q) return null;
  const timerPct = (timer / TIMER_SECONDS) * 100;
  const timerColor = timer > 10 ? '#7FB069' : timer > 5 ? '#FFD93D' : '#FF4444';

  return (
    <div className="flex flex-col h-full bg-[#1B3B6F]">
      {/* Header */}
      <div className="bg-[#152d55] px-4 pt-3 pb-3">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => {
              setMode('menu');
              setTimerActive(false);
            }}
            className="bg-white/10 rounded-xl px-3 py-2 text-white/70 text-sm min-h-[36px]"
          >
            ✕ Zakończ
          </button>
          <span className="text-white/60 text-sm">
            {current + 1} / {questions.length}
          </span>
          {streak >= 2 && (
            <span className="text-[#FF8C42] font-bold text-sm">🔥 Seria ×{streak}</span>
          )}
          {streak < 2 && <span className="text-[#FFD93D] font-bold text-sm">⭐ {score} pkt</span>}
        </div>
        {/* Timer bar */}
        <div className="bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${timerPct}%`, backgroundColor: timerColor }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-right text-xs mt-0.5" style={{ color: timerColor }}>
          {timer}s
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 py-2 px-4">
        {questions.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i === current ? 20 : 8,
              height: 8,
              backgroundColor:
                i < answers.length
                  ? answers[i]
                    ? '#7FB069'
                    : '#FF4444'
                  : i === current
                    ? '#FFD93D'
                    : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Visual / prompt */}
            <div className="bg-[#152d55] rounded-2xl p-5 text-center">
              <p className="text-white/60 text-sm mb-2">{q.prompt}</p>
              {q.visual && <p className="text-6xl mb-2">{q.visual}</p>}
              <p className="text-white font-bold text-base">{q.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((opt, i) => {
                let bg = 'bg-white/10';
                let border = 'border-transparent';
                if (selected !== null) {
                  if (i === q.correctIndex) {
                    bg = 'bg-[#7FB069]/30';
                    border = 'border-[#7FB069]';
                  } else if (i === selected && selected !== q.correctIndex) {
                    bg = 'bg-[#FF4444]/30';
                    border = 'border-[#FF4444]';
                  }
                }
                return (
                  <motion.button
                    key={i}
                    whileTap={selected === null ? { scale: 0.97 } : {}}
                    onClick={() => handleAnswer(i)}
                    disabled={selected !== null}
                    className={`w-full text-left rounded-2xl p-4 border-2 transition-all ${bg} ${border} min-h-[52px]`}
                  >
                    <span className="text-white font-medium">{opt}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {selected !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-2xl p-3 text-center font-bold ${
                    selected === q.correctIndex
                      ? 'bg-[#7FB069]/20 text-[#7FB069]'
                      : 'bg-[#FF4444]/20 text-[#FF4444]'
                  }`}
                >
                  {selected === q.correctIndex
                    ? streak >= 3
                      ? `🔥 Niesamowita seria! +${10 + (streak - 1) * 3} pkt`
                      : '✓ Poprawnie!'
                    : `✗ Prawidłowa odpowiedź: ${q.options[q.correctIndex]}`}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
