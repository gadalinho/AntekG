import { useState, useEffect, useCallback, useRef } from 'react';
import type { TouchEvent, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameProps } from './types';

interface Cat {
  id: number;
  x: number; // % from left
  y: number; // % from top
  speed: number; // px/s
  hit: boolean;
}

const GAME_DURATION = 30; // seconds
const SPAWN_INTERVAL = 1000; // ms
const CAT_EMOJIS = ['🐱', '😺', '🐾', '😸', '😻'];

export function AirplaneGame({ onComplete, onBack }: GameProps) {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro');
  const [cats, setCats] = useState<Cat[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [planeX, setPlaneX] = useState(50); // % from left
  const [shots, setShots] = useState<{ id: number; x: number; y: number }[]>([]);
  const nextId = useRef(0);
  const shotId = useRef(0);
  const gameRef = useRef<HTMLDivElement | null>(null);

  // Spawn cats
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      const x = 5 + Math.random() * 90;
      const speed = 30 + Math.random() * 40;
      setCats(prev => [
        ...prev.filter(c => !c.hit && c.y < 110),
        { id: nextId.current++, x, y: -10, speed, hit: false },
      ]);
    }, SPAWN_INTERVAL);
    return () => clearInterval(id);
  }, [phase]);

  // Move cats down
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      setCats(prev => prev.map(c => ({ ...c, y: c.y + c.speed * 0.05 })).filter(c => c.y < 115));
    }, 50);
    return () => clearInterval(id);
  }, [phase]);

  // Countdown
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id);
          setPhase('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Move shots up & check collision using refs to avoid stale closures
  const catsRef = useRef<Cat[]>([]);
  const shotsRef = useRef<{ id: number; x: number; y: number }[]>([]);
  useEffect(() => {
    catsRef.current = cats;
  }, [cats]);
  useEffect(() => {
    shotsRef.current = shots;
  }, [shots]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      const movedShots = shotsRef.current.map(s => ({ ...s, y: s.y - 4 })).filter(s => s.y > -5);

      const hitCatIds = new Set<number>();
      const remainingShots = movedShots.filter(shot => {
        const hit = catsRef.current.find(
          cat => !cat.hit && Math.abs(cat.x - shot.x) < 8 && Math.abs(cat.y - shot.y) < 10
        );
        if (hit) {
          hitCatIds.add(hit.id);
          return false;
        }
        return true;
      });

      if (hitCatIds.size > 0) {
        setScore(s => s + hitCatIds.size * 10);
        setCats(cs => cs.map(c => (hitCatIds.has(c.id) ? { ...c, hit: true } : c)));
        setTimeout(() => setCats(cs => cs.filter(c => !hitCatIds.has(c.id))), 400);
      }
      setShots(remainingShots);
    }, 50);
    return () => clearInterval(id);
  }, [phase]);

  const shoot = useCallback(() => {
    if (phase !== 'playing') return;
    setShots(prev => [...prev, { id: shotId.current++, x: planeX, y: 85 }]);
  }, [phase, planeX]);

  const handleMove = useCallback(
    (e: TouchEvent | MouseEvent) => {
      if (phase !== 'playing') return;
      const rect = gameRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setPlaneX(Math.max(5, Math.min(95, pct)));
    },
    [phase]
  );

  const coinsEarned = Math.floor(score / 10) + (score >= 50 ? 10 : 0);

  if (phase === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0a1f3c] p-6 text-center">
        <p className="text-6xl mb-4">✈️</p>
        <h2 className="text-2xl font-bold text-[#FFD93D] mb-2">Pilot odkrywca</h2>
        <p className="text-white/70 mb-2">
          Lecisz samolotem nad światem! Kotki blokują widok na mapę — zestrzel je wszystkie!
        </p>
        <p className="text-white/50 text-sm mb-6">
          Dotykaj/klikaj po ekranie żeby celować i strzelać 🐱
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setPhase('playing')}
            className="bg-[#FF8C42] text-white font-bold px-6 py-3 rounded-2xl text-lg"
          >
            🚀 Startujemy!
          </button>
          <button onClick={onBack} className="bg-white/10 text-white px-4 py-3 rounded-2xl">
            ← Wróć
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0a1f3c] p-6 text-center">
        <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="space-y-4">
          <p className="text-6xl">🎖️</p>
          <h2 className="text-2xl font-bold text-[#FFD93D]">Misja zakończona!</h2>
          <p className="text-white/70">
            Zestrzelono kotków: <span className="text-white font-bold">{score / 10}</span>
          </p>
          <div className="bg-[#152d55] rounded-2xl p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-white/60">Wynik</span>
              <span className="text-[#FFD93D] font-bold">{score} pkt</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Monety</span>
              <span className="text-[#FFD93D] font-bold">+{coinsEarned} 🪙</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onComplete(coinsEarned)}
              className="flex-1 bg-[#FF8C42] text-white font-bold py-3 rounded-2xl"
            >
              ✓ Zakończ
            </button>
            <button
              onClick={() => {
                setCats([]);
                setScore(0);
                setTimeLeft(GAME_DURATION);
                setPlaneX(50);
                setShots([]);
                setPhase('playing');
              }}
              className="flex-1 bg-white/10 text-white font-bold py-3 rounded-2xl"
            >
              🔄 Jeszcze raz
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={gameRef}
      className="relative w-full h-full bg-gradient-to-b from-[#0a1f3c] to-[#1a4a8a] overflow-hidden select-none"
      onTouchMove={handleMove}
      onMouseMove={handleMove}
      onTouchStart={e => {
        handleMove(e);
        shoot();
      }}
      onClick={shoot}
    >
      {/* Sky bg clouds */}
      <div className="absolute inset-0 pointer-events-none">
        {[15, 40, 65, 85].map((x, i) => (
          <div
            key={i}
            className="absolute text-white/10 text-5xl"
            style={{ left: `${x}%`, top: `${15 + i * 18}%` }}
          >
            ☁️
          </div>
        ))}
      </div>

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-2 bg-black/30 z-10">
        <span className="text-[#FFD93D] font-bold">⭐ {score}</span>
        <span className={`font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
          ⏱ {timeLeft}s
        </span>
        <button
          onClick={onBack}
          className="text-white/60 text-sm bg-white/10 px-2 py-1 rounded-lg min-h-[32px]"
        >
          ✕
        </button>
      </div>

      {/* Cats */}
      <AnimatePresence>
        {cats.map(cat => (
          <motion.div
            key={cat.id}
            initial={{ scale: 1 }}
            animate={cat.hit ? { scale: 1.5, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute text-3xl pointer-events-none"
            style={{
              left: `${cat.x}%`,
              top: `${cat.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {CAT_EMOJIS[cat.id % CAT_EMOJIS.length]}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Shots */}
      {shots.map(shot => (
        <div
          key={shot.id}
          className="absolute text-yellow-300 text-base pointer-events-none"
          style={{
            left: `${shot.x}%`,
            top: `${shot.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          ✦
        </div>
      ))}

      {/* Plane */}
      <motion.div
        className="absolute text-4xl pointer-events-none"
        animate={{ left: `${planeX}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ bottom: '8%', transform: 'translateX(-50%)' }}
      >
        ✈️
      </motion.div>

      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/30 text-xs pointer-events-none">
        Dotykaj ekran aby strzelać
      </p>
    </div>
  );
}
