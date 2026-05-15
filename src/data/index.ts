import { validateCountries } from '@/types/Country';
import type { Country } from '@/types/Country';
import { COUNTRIES_RAW } from './countries';

export const COUNTRIES: Country[] = validateCountries(COUNTRIES_RAW);

export function getCountryById(id: string): Country | undefined {
  return COUNTRIES.find(c => c.id === id);
}

export function getCountriesByContinent(continent: Country['continent']): Country[] {
  return COUNTRIES.filter(c => c.continent === continent);
}

export const CONTINENTS = [
  'Europa',
  'Azja',
  'Afryka',
  'Ameryka Północna',
  'Ameryka Południowa',
  'Australia i Oceania',
] as const satisfies Country['continent'][];
