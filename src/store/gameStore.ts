import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Screen, Player, GameProgress, Badge } from '@/types/GameState';
import { LEVEL_NAMES, XP_PER_LEVEL } from '@/types/GameState';
import { INITIAL_BADGES } from '@/data/badges';
import { COUNTRIES } from '@/data';
import { loadSavedState, saveState, clearSavedState } from '@/utils/storage';

interface GameStore {
  // Nawigacja
  screen: Screen;
  selectedCountryId: string | null;

  // Gracz
  player: Player | null;
  progress: GameProgress;

  // Onboarding
  isOnboarded: boolean;

  // Akcje nawigacyjne
  goToMap: () => void;
  goToCountry: (id: string) => void;
  goToScreen: (screen: Screen) => void;
  goBack: () => void;

  // Akcje gracza
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

  // Trwałość
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
        if (
          screen === 'country' ||
          screen === 'backpack' ||
          screen === 'passport' ||
          screen === 'shop'
        ) {
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
          return { progress: withBadges };
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
          return { progress: { ...updated, badges: checkBadges(updated) } };
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
          return { progress: { ...updated, badges: checkBadges(updated) } };
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
          return { progress: { ...updated, badges: checkBadges(updated) } };
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
          return { progress: { ...updated, badges: checkBadges(updated) } };
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
          return { progress: { ...updated, badges: checkBadges(updated) } };
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
