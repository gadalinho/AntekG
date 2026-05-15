import type { Badge } from '@/types/GameState';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_step',
    namePL: 'Pierwszy krok',
    description: 'Odwiedź swój pierwszy kraj',
    icon: '👣',
    earned: false,
  },
  {
    id: 'europe_explorer',
    namePL: 'Odkrywca Europy',
    description: 'Odwiedź wszystkie 5 europejskich krajów',
    icon: '🏰',
    earned: false,
  },
  {
    id: 'foodie',
    namePL: 'Smakosz',
    description: 'Odkryj 10 różnych potraw',
    icon: '🍽️',
    earned: false,
  },
  {
    id: 'linguist',
    namePL: 'Lingwista',
    description: 'Naucz się zwrotów z 5 języków',
    icon: '💬',
    earned: false,
  },
  {
    id: 'zoologist',
    namePL: 'Zoolog',
    description: 'Odkryj 15 różnych zwierząt',
    icon: '🦁',
    earned: false,
  },
  {
    id: 'quiz_master',
    namePL: 'Mistrz quizu',
    description: 'Odpowiedz poprawnie na 20 pytań',
    icon: '🏆',
    earned: false,
  },
  {
    id: 'world_traveler',
    namePL: 'Podróżnik świata',
    description: 'Odwiedź kraje na 4 różnych kontynentach',
    icon: '✈️',
    earned: false,
  },
  {
    id: 'curious_mind',
    namePL: 'Ciekawski umysł',
    description: 'Zbierz 25 ciekawostek',
    icon: '🔍',
    earned: false,
  },
];
