import { z } from 'zod';

export const BadgeSchema = z.object({
  id: z.string(),
  namePL: z.string(),
  description: z.string(),
  icon: z.string(),
  earned: z.boolean(),
  earnedAt: z.number().optional(),
});

export const PlayerSchema = z.object({
  name: z.string().min(1).max(20),
  avatarSkin: z.string(),
  createdAt: z.number(),
  totalPlayTime: z.number().int().nonnegative(),
});

export const GameProgressSchema = z.object({
  visitedCountries: z.array(z.string()),
  collectedFacts: z.array(z.string()),
  collectedStickers: z.array(z.string()),
  badges: z.array(BadgeSchema),
  coins: z.number().int().nonnegative(),
  level: z.number().int().min(1).max(4),
  xp: z.number().int().nonnegative(),
  correctAnswers: z.number().int().nonnegative(),
  discoveredFoods: z.array(z.string()),
  discoveredAnimals: z.array(z.string()),
  learnedLanguages: z.array(z.string()),
  mapBackground: z.string(),
  purchasedItems: z.array(z.string()),
});

export const SavedStateSchema = z.object({
  player: PlayerSchema,
  progress: GameProgressSchema,
  savedAt: z.number(),
  version: z.literal(1),
});

export type Badge = z.infer<typeof BadgeSchema>;
export type Player = z.infer<typeof PlayerSchema>;
export type GameProgress = z.infer<typeof GameProgressSchema>;
export type SavedState = z.infer<typeof SavedStateSchema>;

export type Screen =
  | 'onboarding'
  | 'map'
  | 'country'
  | 'minigame'
  | 'backpack'
  | 'passport'
  | 'shop'
  | 'settings';

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Junior Odkrywca',
  2: 'Tropiciel',
  3: 'Ekspert',
  4: 'Mistrz',
};

export const XP_PER_LEVEL = [0, 0, 200, 600, 1200] as const;
