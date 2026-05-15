import type { Country } from '@/types/Country';

export interface GameProps {
  country: Country;
  onComplete: (coinsEarned: number) => void;
  onBack: () => void;
}
