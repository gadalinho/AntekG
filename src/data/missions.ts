export type MissionType = 'daily' | 'weekly' | 'challenge';
export type MissionMetric =
  | 'visitedCountries'
  | 'collectedFacts'
  | 'correctAnswers'
  | 'discoveredFoods'
  | 'discoveredAnimals'
  | 'learnedLanguages'
  | 'quizRoundsPlayed'
  | 'gamesPlayed';

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: MissionType;
  metric: MissionMetric;
  goal: number;
  reward: { coins: number; xp: number };
}

export const DAILY_MISSIONS: Mission[] = [
  {
    id: 'daily_visit',
    title: 'Podróżnik dnia',
    description: 'Odwiedź 1 nowy kraj',
    icon: '✈️',
    type: 'daily',
    metric: 'visitedCountries',
    goal: 1,
    reward: { coins: 20, xp: 10 },
  },
  {
    id: 'daily_facts',
    title: 'Ciekawski',
    description: 'Zbierz 2 ciekawostki',
    icon: '💡',
    type: 'daily',
    metric: 'collectedFacts',
    goal: 2,
    reward: { coins: 15, xp: 10 },
  },
  {
    id: 'daily_quiz',
    title: 'Mistrz quizu',
    description: 'Odpowiedz poprawnie na 3 pytania',
    icon: '🧠',
    type: 'daily',
    metric: 'correctAnswers',
    goal: 3,
    reward: { coins: 25, xp: 15 },
  },
  {
    id: 'daily_food',
    title: 'Smakosz',
    description: 'Odkryj 1 nową potrawę',
    icon: '🍽️',
    type: 'daily',
    metric: 'discoveredFoods',
    goal: 1,
    reward: { coins: 10, xp: 5 },
  },
  {
    id: 'daily_game',
    title: 'Gracz',
    description: 'Zagraj w 1 mini-grę',
    icon: '🎮',
    type: 'daily',
    metric: 'gamesPlayed',
    goal: 1,
    reward: { coins: 20, xp: 10 },
  },
];

export const WEEKLY_MISSIONS: Mission[] = [
  {
    id: 'weekly_explorer',
    title: 'Odkrywca tygodnia',
    description: 'Odwiedź 5 krajów w tym tygodniu',
    icon: '🌍',
    type: 'weekly',
    metric: 'visitedCountries',
    goal: 5,
    reward: { coins: 80, xp: 40 },
  },
  {
    id: 'weekly_foodie',
    title: 'Kulinarny podróżnik',
    description: 'Odkryj 5 nowych potraw',
    icon: '🥘',
    type: 'weekly',
    metric: 'discoveredFoods',
    goal: 5,
    reward: { coins: 60, xp: 30 },
  },
  {
    id: 'weekly_linguist',
    title: 'Poliglota',
    description: 'Poznaj frazy w 3 językach',
    icon: '💬',
    type: 'weekly',
    metric: 'learnedLanguages',
    goal: 3,
    reward: { coins: 70, xp: 35 },
  },
  {
    id: 'weekly_quiz',
    title: 'Quiz Mistrz',
    description: 'Zagraj w 3 rundy quizu',
    icon: '🏆',
    type: 'weekly',
    metric: 'quizRoundsPlayed',
    goal: 3,
    reward: { coins: 90, xp: 45 },
  },
  {
    id: 'weekly_animals',
    title: 'Zoolog',
    description: 'Odkryj 5 nowych zwierząt',
    icon: '🐾',
    type: 'weekly',
    metric: 'discoveredAnimals',
    goal: 5,
    reward: { coins: 60, xp: 30 },
  },
];

export const CHALLENGE_MISSIONS: Mission[] = [
  {
    id: 'ch_countries_10',
    title: 'Globtroter',
    description: 'Odwiedź 10 krajów',
    icon: '🗺️',
    type: 'challenge',
    metric: 'visitedCountries',
    goal: 10,
    reward: { coins: 100, xp: 50 },
  },
  {
    id: 'ch_countries_25',
    title: 'Podróżnik Świata',
    description: 'Odwiedź 25 krajów',
    icon: '🌐',
    type: 'challenge',
    metric: 'visitedCountries',
    goal: 25,
    reward: { coins: 200, xp: 100 },
  },
  {
    id: 'ch_countries_50',
    title: 'Mistrz Geografii',
    description: 'Odwiedź 50 krajów',
    icon: '👑',
    type: 'challenge',
    metric: 'visitedCountries',
    goal: 50,
    reward: { coins: 400, xp: 200 },
  },
  {
    id: 'ch_facts_30',
    title: 'Encyklopedia',
    description: 'Zbierz 30 ciekawostek',
    icon: '📚',
    type: 'challenge',
    metric: 'collectedFacts',
    goal: 30,
    reward: { coins: 100, xp: 50 },
  },
  {
    id: 'ch_quiz_50',
    title: 'Geniusz quizu',
    description: 'Odpowiedz poprawnie na 50 pytań',
    icon: '🎓',
    type: 'challenge',
    metric: 'correctAnswers',
    goal: 50,
    reward: { coins: 150, xp: 75 },
  },
  {
    id: 'ch_foods_20',
    title: 'Kulinarny Mistrz',
    description: 'Odkryj 20 różnych potraw',
    icon: '👨‍🍳',
    type: 'challenge',
    metric: 'discoveredFoods',
    goal: 20,
    reward: { coins: 100, xp: 50 },
  },
  {
    id: 'ch_animals_20',
    title: 'Mistrz Zoologii',
    description: 'Odkryj 20 różnych zwierząt',
    icon: '🦁',
    type: 'challenge',
    metric: 'discoveredAnimals',
    goal: 20,
    reward: { coins: 100, xp: 50 },
  },
  {
    id: 'ch_languages_10',
    title: 'Lingwista',
    description: 'Poznaj frazy w 10 językach',
    icon: '🗣️',
    type: 'challenge',
    metric: 'learnedLanguages',
    goal: 10,
    reward: { coins: 120, xp: 60 },
  },
];

export const ALL_MISSIONS: Mission[] = [
  ...DAILY_MISSIONS,
  ...WEEKLY_MISSIONS,
  ...CHALLENGE_MISSIONS,
];
