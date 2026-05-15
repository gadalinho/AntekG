import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { COUNTRIES } from '@/data';
import { LEVEL_NAMES, XP_PER_LEVEL } from '@/types/GameState';

type Tab = 'odkrycia' | 'odznaki' | 'statystyki';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'odkrycia', label: 'Odkrycia', icon: '🌍' },
  { id: 'odznaki', label: 'Odznaki', icon: '🏅' },
  { id: 'statystyki', label: 'Statystyki', icon: '📊' },
];

export function BackpackScreen() {
  const [tab, setTab] = useState<Tab>('odkrycia');
  const goToMap = useGameStore(s => s.goToMap);
  const progress = useGameStore(s => s.progress);
  const player = useGameStore(s => s.player);

  const currentLevelXp = XP_PER_LEVEL[progress.level] ?? 0;
  const nextLevelXp = XP_PER_LEVEL[progress.level + 1] ?? 9999;
  const xpProgress =
    nextLevelXp > currentLevelXp
      ? Math.min(100, ((progress.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
      : 100;

  const visitedCountryObjects = COUNTRIES.filter(c => progress.visitedCountries.includes(c.id));
  const earnedBadges = progress.badges.filter(b => b.earned);

  return (
    <div className="flex flex-col h-full bg-[#1B3B6F]">
      {/* Nagłówek */}
      <div className="bg-[#152d55] px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={goToMap}
            className="bg-white/10 rounded-xl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Wróć na mapę"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#FFD93D]">🎒 Plecak Odkrywcy</h1>
            <p className="text-white/60 text-sm">{player?.name ?? 'Odkrywca'}</p>
          </div>
          <div className="text-right">
            <p className="text-[#FFD93D] font-bold">{progress.coins} 🪙</p>
            <p className="text-white/60 text-xs">{LEVEL_NAMES[progress.level] ?? 'Odkrywca'}</p>
          </div>
        </div>
        {/* Pasek XP */}
        <div className="bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-[#FF8C42] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-white/50 text-xs mt-1 text-right">{progress.xp} XP</p>
      </div>

      {/* Zakładki */}
      <div className="flex bg-[#152d55] border-t border-white/10">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-3 text-sm font-medium transition-colors min-h-[44px] ${
              tab === t.id ? 'text-[#FFD93D] border-b-2 border-[#FFD93D]' : 'text-white/60'
            }`}
            aria-selected={tab === t.id}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Zawartość */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'odkrycia' && (
          <div className="p-4 space-y-4">
            <Section
              title="🌍 Odwiedzone kraje"
              count={`${progress.visitedCountries.length}/${COUNTRIES.length}`}
            >
              {visitedCountryObjects.length === 0 ? (
                <p className="text-white/40 text-sm">Odwiedź swój pierwszy kraj na mapie!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {visitedCountryObjects.map(c => (
                    <span
                      key={c.id}
                      className="bg-white/10 text-white px-3 py-1.5 rounded-xl text-sm"
                    >
                      {c.flagEmoji} {c.namePL}
                    </span>
                  ))}
                </div>
              )}
            </Section>

            <Section title="🍽️ Odkryte smaki" count={`${progress.discoveredFoods.length}`}>
              {progress.discoveredFoods.length === 0 ? (
                <p className="text-white/40 text-sm">Przeglądaj zakładkę Smaki w krajach!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {progress.discoveredFoods.map(food => (
                    <span
                      key={food}
                      className="bg-[#FF8C42]/20 text-white px-3 py-1.5 rounded-xl text-sm"
                    >
                      {food}
                    </span>
                  ))}
                </div>
              )}
            </Section>

            <Section title="🐾 Odkryte zwierzęta" count={`${progress.discoveredAnimals.length}`}>
              {progress.discoveredAnimals.length === 0 ? (
                <p className="text-white/40 text-sm">Przeglądaj zakładkę Zwierzęta w krajach!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {progress.discoveredAnimals.map(animal => (
                    <span
                      key={animal}
                      className="bg-[#7FB069]/20 text-white px-3 py-1.5 rounded-xl text-sm"
                    >
                      {animal}
                    </span>
                  ))}
                </div>
              )}
            </Section>

            <Section
              title="💬 Poznane języki"
              count={`${progress.learnedLanguages.length}/${COUNTRIES.length}`}
            >
              {progress.learnedLanguages.length === 0 ? (
                <p className="text-white/40 text-sm">Ucz się zwrotów w zakładce Język!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.filter(c => progress.learnedLanguages.includes(c.id)).map(c => (
                    <span
                      key={c.id}
                      className="bg-[#5B8FDE]/20 text-white px-3 py-1.5 rounded-xl text-sm"
                    >
                      {c.flagEmoji} {c.languages[0]}
                    </span>
                  ))}
                </div>
              )}
            </Section>
          </div>
        )}

        {tab === 'odznaki' && (
          <div className="p-4 space-y-3">
            <p className="text-white/50 text-sm text-center">
              Zdobyto: {earnedBadges.length}/{progress.badges.length}
            </p>
            {progress.badges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-2xl p-4 flex items-center gap-4 ${
                  badge.earned ? 'bg-[#FFD93D]/15 border border-[#FFD93D]/30' : 'bg-white/5'
                }`}
              >
                <span className={`text-3xl ${badge.earned ? '' : 'grayscale opacity-40'}`}>
                  {badge.icon}
                </span>
                <div className="flex-1">
                  <p className={`font-bold ${badge.earned ? 'text-[#FFD93D]' : 'text-white/50'}`}>
                    {badge.namePL}
                  </p>
                  <p className="text-white/50 text-sm">{badge.description}</p>
                </div>
                {badge.earned && <span className="text-[#7FB069] text-xl">✓</span>}
              </motion.div>
            ))}
          </div>
        )}

        {tab === 'statystyki' && (
          <div className="p-4 space-y-3">
            {[
              {
                icon: '🌍',
                label: 'Odwiedzone kraje',
                value: `${progress.visitedCountries.length}/${COUNTRIES.length}`,
              },
              {
                icon: '💡',
                label: 'Zebrane ciekawostki',
                value: `${progress.collectedFacts.length}`,
              },
              { icon: '🍽️', label: 'Odkryte smaki', value: `${progress.discoveredFoods.length}` },
              {
                icon: '🐾',
                label: 'Odkryte zwierzęta',
                value: `${progress.discoveredAnimals.length}`,
              },
              { icon: '💬', label: 'Poznane języki', value: `${progress.learnedLanguages.length}` },
              { icon: '✅', label: 'Poprawne odpowiedzi', value: `${progress.correctAnswers}` },
              { icon: '⭐', label: 'Zdobyte XP', value: `${progress.xp}` },
              { icon: '🪙', label: 'Monety', value: `${progress.coins}` },
              { icon: '🏅', label: 'Odznaki', value: `${earnedBadges.length}/8` },
            ].map(stat => (
              <div
                key={stat.label}
                className="bg-white/10 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="text-white">{stat.label}</span>
                </div>
                <span className="text-[#FFD93D] font-bold">{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-sm">{title}</h3>
        <span className="text-white/50 text-xs">{count}</span>
      </div>
      {children}
    </div>
  );
}
