import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Screen, Player, GameProgress, Badge } from '@/types/GameState';
import { LEVEL_NAMES, XP_PER_LEVEL } from '@/types/GameState';
import { INITIAL_BADGES } from '@/data/badges';
import { COUNTRIES } from '@/data';
import { ALL_MISSIONS } from '@/data/missions';
import type { MissionMetric } from '@/data/missions';
import { loadSavedState, saveState, clearSavedState } from '@/utils/storage';

const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_WEEK = 7 * ONE_DAY;

interface GameStore {
  screen: Screen;
  selectedCountryId: string | null;
  player: Player | null;
  progress: GameProgress;
  isOnboarded: boolean;

  goToMap: () => void;
  goToCountry: (id: string) => void;
  goToScreen: (screen: Screen) => void;
  goBack: () => void;

  setupPlayer: (name: string) => void;
  visitCountry: (countryId: string) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addXp: (amount: number) => void;
  collectFact: (factId: string) => void;
  collectSticker: (stickerId: string) => void;
  trackCorrectAnswer: () => void;
  trackFood: (food: string) => void;
  trackAnimal: (animal: string) => void;
  trackLanguage: (langId: string) => void;
  purchaseItem: (itemId: string) => void;
  setMapBackground: (bg: string) => void;
  earnBadge: (badgeId: string) => void;
  incrementMetric: (metric: MissionMetric, amount?: number) => void;

  saveProgress: () => void;
  resetProgress: () => void;
}

const DEFAULT_PROGRESS: GameProgress = {
  visitedCountries: [],
  collectedFacts: [],
  collectedStickers: [],
  badges: INITIAL_BADGES,
  coins: 0,
  level: 1,
  xp: 0,
  correctAnswers: 0,
  discoveredFoods: [],
  discoveredAnimals: [],
  learnedLanguages: [],
  mapBackground: 'default',
  purchasedItems: [],
  missionProgress: {},
  completedMissions: [],
  lastDailyReset: Date.now(),
  lastWeeklyReset: Date.now(),
  quizRoundsPlayed: 0,
  gamesPlayed: 0,
  bestQuizStreak: 0,
};

function computeLevel(xp: number): number {
  for (let lvl = XP_PER_LEVEL.length - 1; lvl >= 1; lvl--) {
    const threshold = XP_PER_LEVEL[lvl];
    if (threshold !== undefined && xp >= threshold) return lvl;
  }
  return 1;
}

function checkBadges(progress: GameProgress): Badge[] {
  return progress.badges.map(badge => {
    if (badge.earned) return badge;
    let shouldEarn = false;
    switch (badge.id) {
      case 'first_step':
        shouldEarn = progress.visitedCountries.length >= 1;
        break;
      case 'europe_explorer':
        shouldEarn = COUNTRIES.filter(c => c.continent === 'Europa').every(c =>
          progress.visitedCountries.includes(c.id)
        );
        break;
      case 'foodie':
        shouldEarn = progress.discoveredFoods.length >= 10;
        break;
      case 'linguist':
        shouldEarn = progress.learnedLanguages.length >= 5;
        break;
      case 'zoologist':
        shouldEarn = progress.discoveredAnimals.length >= 15;
        break;
      case 'quiz_master':
        shouldEarn = progress.correctAnswers >= 20;
        break;
      case 'world_traveler': {
        const continents = new Set(
          COUNTRIES.filter(c => progress.visitedCountries.includes(c.id)).map(c => c.continent)
        );
        shouldEarn = continents.size >= 4;
        break;
      }
      case 'curious_mind':
        shouldEarn = progress.collectedFacts.length >= 25;
        break;
    }
    return shouldEarn ? { ...badge, earned: true, earnedAt: Date.now() } : badge;
  });
}

// Returns { coins, xp } earned from newly completed missions
function checkMissions(progress: GameProgress): {
  updatedProgress: GameProgress;
  coinsEarned: number;
  xpEarned: number;
} {
  const now = Date.now();
  let updatedProgress = { ...progress };
  let coinsEarned = 0;
  let xpEarned = 0;

  // Reset daily missions if needed
  if (now - progress.lastDailyReset > ONE_DAY) {
    const dailyIds = ALL_MISSIONS.filter(m => m.type === 'daily').map(m => m.id);
    updatedProgress = {
      ...updatedProgress,
      completedMissions: updatedProgress.completedMissions.filter(id => !dailyIds.includes(id)),
      missionProgress: Object.fromEntries(
        Object.entries(updatedProgress.missionProgress).filter(([id]) => !dailyIds.includes(id))
      ),
      lastDailyReset: now,
    };
  }

  // Reset weekly missions if needed
  if (now - progress.lastWeeklyReset > ONE_WEEK) {
    const weeklyIds = ALL_MISSIONS.filter(m => m.type === 'weekly').map(m => m.id);
    updatedProgress = {
      ...updatedProgress,
      completedMissions: updatedProgress.completedMissions.filter(id => !weeklyIds.includes(id)),
      missionProgress: Object.fromEntries(
        Object.entries(updatedProgress.missionProgress).filter(([id]) => !weeklyIds.includes(id))
      ),
      lastWeeklyReset: now,
    };
  }

  return { updatedProgress, coinsEarned, xpEarned };
}

function getMetricValue(progress: GameProgress, metric: MissionMetric): number {
  switch (metric) {
    case 'visitedCountries':
      return progress.visitedCountries.length;
    case 'collectedFacts':
      return progress.collectedFacts.length;
    case 'correctAnswers':
      return progress.correctAnswers;
    case 'discoveredFoods':
      return progress.discoveredFoods.length;
    case 'discoveredAnimals':
      return progress.discoveredAnimals.length;
    case 'learnedLanguages':
      return progress.learnedLanguages.length;
    case 'quizRoundsPlayed':
      return progress.quizRoundsPlayed;
    case 'gamesPlayed':
      return progress.gamesPlayed;
  }
}

function evaluateMissions(progress: GameProgress): {
  progress: GameProgress;
  coinsEarned: number;
  xpEarned: number;
} {
  const { updatedProgress } = checkMissions(progress);
  let result = updatedProgress;
  let coinsEarned = 0;
  let xpEarned = 0;

  for (const mission of ALL_MISSIONS) {
    if (result.completedMissions.includes(mission.id)) continue;
    const value = getMetricValue(result, mission.metric);
    const prev = result.missionProgress[mission.id] ?? 0;
    const updated = Math.max(prev, value);
    if (updated !== prev) {
      result = {
        ...result,
        missionProgress: { ...result.missionProgress, [mission.id]: updated },
      };
    }
    if (updated >= mission.goal) {
      result = {
        ...result,
        completedMissions: [...result.completedMissions, mission.id],
        coins: result.coins + mission.reward.coins,
        xp: result.xp + mission.reward.xp,
      };
      coinsEarned += mission.reward.coins;
      xpEarned += mission.reward.xp;
    }
  }

  result = { ...result, level: computeLevel(result.xp) };
  return { progress: result, coinsEarned, xpEarned };
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => {
    const saved = loadSavedState();

    return {
      screen: saved ? 'map' : 'onboarding',
      selectedCountryId: null,
      player: saved?.player ?? null,
      progress: saved?.progress ?? DEFAULT_PROGRESS,
      isOnboarded: !!saved,

      goToMap: () => set({ screen: 'map', selectedCountryId: null }),
      goToCountry: (id: string) => set({ screen: 'country', selectedCountryId: id }),
      goToScreen: (screen: Screen) => set({ screen }),
      goBack: () => {
        const { screen } = get();
        if (['country', 'backpack', 'passport', 'shop', 'quiz', 'missions'].includes(screen)) {
          set({ screen: 'map', selectedCountryId: null });
        } else if (screen === 'minigame') {
          set({ screen: 'country' });
        }
      },

      setupPlayer: (name: string) => {
        const player: Player = {
          name: name.trim(),
          avatarSkin: 'default',
          createdAt: Date.now(),
          totalPlayTime: 0,
        };
        set({ player, isOnboarded: true, screen: 'map' });
        get().saveProgress();
      },

      visitCountry: (countryId: string) => {
        set(state => {
          if (state.progress.visitedCountries.includes(countryId)) return state;
          const updated: GameProgress = {
            ...state.progress,
            visitedCountries: [...state.progress.visitedCountries, countryId],
          };
          const withBadges = { ...updated, badges: checkBadges(updated) };
          const { progress } = evaluateMissions(withBadges);
          return { progress };
        });
        get().saveProgress();
      },

      addCoins: (amount: number) => {
        set(state => ({ progress: { ...state.progress, coins: state.progress.coins + amount } }));
        get().saveProgress();
      },

      spendCoins: (amount: number): boolean => {
        const { progress } = get();
        if (progress.coins < amount) return false;
        set(state => ({ progress: { ...state.progress, coins: state.progress.coins - amount } }));
        get().saveProgress();
        return true;
      },

      addXp: (amount: number) => {
        set(state => {
          const newXp = state.progress.xp + amount;
          const newLevel = computeLevel(newXp);
          return { progress: { ...state.progress, xp: newXp, level: newLevel } };
        });
        get().saveProgress();
      },

      collectFact: (factId: string) => {
        set(state => {
          if (state.progress.collectedFacts.includes(factId)) return state;
          const updated: GameProgress = {
            ...state.progress,
            collectedFacts: [...state.progress.collectedFacts, factId],
          };
          const withBadges = { ...updated, badges: checkBadges(updated) };
          const { progress } = evaluateMissions(withBadges);
          return { progress };
        });
        get().saveProgress();
      },

      collectSticker: (stickerId: string) => {
        set(state => {
          if (state.progress.collectedStickers.includes(stickerId)) return state;
          return {
            progress: {
              ...state.progress,
              collectedStickers: [...state.progress.collectedStickers, stickerId],
            },
          };
        });
        get().saveProgress();
      },

      trackCorrectAnswer: () => {
        set(state => {
          const updated: GameProgress = {
            ...state.progress,
            correctAnswers: state.progress.correctAnswers + 1,
          };
          const withBadges = { ...updated, badges: checkBadges(updated) };
          const { progress } = evaluateMissions(withBadges);
          return { progress };
        });
        get().saveProgress();
      },

      trackFood: (food: string) => {
        set(state => {
          if (state.progress.discoveredFoods.includes(food)) return state;
          const updated: GameProgress = {
            ...state.progress,
            discoveredFoods: [...state.progress.discoveredFoods, food],
          };
          const withBadges = { ...updated, badges: checkBadges(updated) };
          const { progress } = evaluateMissions(withBadges);
          return { progress };
        });
        get().saveProgress();
      },

      trackAnimal: (animal: string) => {
        set(state => {
          if (state.progress.discoveredAnimals.includes(animal)) return state;
          const updated: GameProgress = {
            ...state.progress,
            discoveredAnimals: [...state.progress.discoveredAnimals, animal],
          };
          const withBadges = { ...updated, badges: checkBadges(updated) };
          const { progress } = evaluateMissions(withBadges);
          return { progress };
        });
        get().saveProgress();
      },

      trackLanguage: (langId: string) => {
        set(state => {
          if (state.progress.learnedLanguages.includes(langId)) return state;
          const updated: GameProgress = {
            ...state.progress,
            learnedLanguages: [...state.progress.learnedLanguages, langId],
          };
          const withBadges = { ...updated, badges: checkBadges(updated) };
          const { progress } = evaluateMissions(withBadges);
          return { progress };
        });
        get().saveProgress();
      },

      incrementMetric: (metric: MissionMetric, amount = 1) => {
        set(state => {
          let updated = state.progress;
          switch (metric) {
            case 'quizRoundsPlayed':
              updated = { ...updated, quizRoundsPlayed: (updated.quizRoundsPlayed ?? 0) + amount };
              break;
            case 'gamesPlayed':
              updated = { ...updated, gamesPlayed: (updated.gamesPlayed ?? 0) + amount };
              break;
            default:
              break;
          }
          const { progress } = evaluateMissions(updated);
          return { progress };
        });
        get().saveProgress();
      },

      purchaseItem: (itemId: string) => {
        set(state => {
          if (state.progress.purchasedItems.includes(itemId)) return state;
          return {
            progress: {
              ...state.progress,
              purchasedItems: [...state.progress.purchasedItems, itemId],
            },
          };
        });
        get().saveProgress();
      },

      setMapBackground: (bg: string) => {
        set(state => ({ progress: { ...state.progress, mapBackground: bg } }));
        get().saveProgress();
      },

      earnBadge: (badgeId: string) => {
        set(state => ({
          progress: {
            ...state.progress,
            badges: state.progress.badges.map(b =>
              b.id === badgeId ? { ...b, earned: true, earnedAt: Date.now() } : b
            ),
          },
        }));
        get().saveProgress();
      },

      saveProgress: () => {
        const { player, progress } = get();
        if (!player) return;
        saveState({ player, progress, savedAt: Date.now(), version: 1 });
      },

      resetProgress: () => {
        clearSavedState();
        set({
          screen: 'onboarding',
          selectedCountryId: null,
          player: null,
          progress: DEFAULT_PROGRESS,
          isOnboarded: false,
        });
      },
    };
  })
);

export const levelName = (level: number): string => LEVEL_NAMES[level] ?? 'Odkrywca';
