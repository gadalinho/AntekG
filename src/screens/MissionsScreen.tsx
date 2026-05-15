import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { ALL_MISSIONS, DAILY_MISSIONS, WEEKLY_MISSIONS, CHALLENGE_MISSIONS } from '@/data/missions';
import type { Mission } from '@/data/missions';

const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_WEEK = 7 * ONE_DAY;

function MissionCard({
  mission,
  progress,
  completed,
}: {
  mission: Mission;
  progress: number;
  completed: boolean;
}) {
  const pct = Math.min(100, (progress / mission.goal) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 border ${
        completed ? 'bg-[#7FB069]/15 border-[#7FB069]/40' : 'bg-white/8 border-white/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`text-3xl ${completed ? '' : 'opacity-80'}`}>{mission.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={`font-bold text-sm ${completed ? 'text-[#7FB069]' : 'text-white'}`}>
              {mission.title}
            </p>
            {completed && <span className="text-[#7FB069] text-lg flex-shrink-0">✓</span>}
          </div>
          <p className="text-white/50 text-xs mb-2">{mission.description}</p>

          {!completed && (
            <>
              <div className="bg-white/10 rounded-full h-1.5 overflow-hidden mb-1">
                <motion.div
                  className="h-full bg-[#FF8C42] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <p className="text-white/40 text-xs">
                {progress} / {mission.goal}
              </p>
            </>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[#FFD93D] text-xs font-bold">+{mission.reward.coins} 🪙</p>
          <p className="text-[#7FB069] text-xs">+{mission.reward.xp} XP</p>
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeader({ title, reset }: { title: string; reset?: string }) {
  return (
    <div className="flex items-center justify-between mb-2 mt-4">
      <h2 className="text-[#FFD93D] font-bold">{title}</h2>
      {reset && <span className="text-white/40 text-xs">{reset}</span>}
    </div>
  );
}

function timeUntilReset(lastReset: number, interval: number): string {
  const next = lastReset + interval;
  const diff = next - Date.now();
  if (diff <= 0) return 'Resetuje się teraz';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `Reset za ${h}h ${m}m`;
  return `Reset za ${m}m`;
}

export function MissionsScreen() {
  const goToMap = useGameStore(s => s.goToMap);
  const progress = useGameStore(s => s.progress);

  const dailyReset = timeUntilReset(progress.lastDailyReset, ONE_DAY);
  const weeklyReset = timeUntilReset(progress.lastWeeklyReset, ONE_WEEK);

  const getProgress = useMemo(() => {
    return (mission: Mission): number => {
      const base = progress.missionProgress[mission.id] ?? 0;
      return base;
    };
  }, [progress.missionProgress]);

  const isCompleted = (id: string) => progress.completedMissions.includes(id);

  const totalCompleted = ALL_MISSIONS.filter(m => isCompleted(m.id)).length;
  const totalMissions = ALL_MISSIONS.length;

  return (
    <div className="flex flex-col h-full bg-[#1B3B6F]">
      {/* Header */}
      <div className="bg-[#152d55] px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={goToMap}
            className="bg-white/10 rounded-xl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Wróć na mapę"
          >
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#FFD93D]">📋 Misje</h1>
            <p className="text-white/60 text-sm">
              Ukończono: {totalCompleted}/{totalMissions}
            </p>
          </div>
        </div>
        {/* Overall progress */}
        <div className="bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-[#FFD93D] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(totalCompleted / totalMissions) * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <SectionHeader title="⚡ Dzienne" reset={dailyReset} />
        <div className="space-y-2">
          {DAILY_MISSIONS.map(m => (
            <MissionCard
              key={m.id}
              mission={m}
              progress={getProgress(m)}
              completed={isCompleted(m.id)}
            />
          ))}
        </div>

        <SectionHeader title="📅 Tygodniowe" reset={weeklyReset} />
        <div className="space-y-2">
          {WEEKLY_MISSIONS.map(m => (
            <MissionCard
              key={m.id}
              mission={m}
              progress={getProgress(m)}
              completed={isCompleted(m.id)}
            />
          ))}
        </div>

        <SectionHeader title="🏆 Wyzwania" />
        <div className="space-y-2">
          {CHALLENGE_MISSIONS.map(m => (
            <MissionCard
              key={m.id}
              mission={m}
              progress={getProgress(m)}
              completed={isCompleted(m.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
