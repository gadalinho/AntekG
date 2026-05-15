import { z } from 'zod';

export type Continent =
  | 'Europa'
  | 'Azja'
  | 'Afryka'
  | 'Ameryka Północna'
  | 'Ameryka Południowa'
  | 'Australia i Oceania';

export const PhraseSchema = z.object({
  local: z.string().min(1),
  polish: z.string().min(1),
  phonetic: z.string().min(1),
});

export const QuizQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
});

export const FamousPlaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

export const CountrySchema = z.object({
  id: z.string().min(2).max(3),
  namePL: z.string().min(1),
  nameLocal: z.string().min(1),
  isoCode: z.string().length(2),
  continent: z.enum([
    'Europa',
    'Azja',
    'Afryka',
    'Ameryka Północna',
    'Ameryka Południowa',
    'Australia i Oceania',
  ]),
  capital: z.string().min(1),
  population: z.number().int().positive(),
  languages: z.array(z.string()).min(1),
  currency: z.string().min(1),
  facts: z.array(z.string()).min(3).max(6),
  foods: z.array(z.string()).min(2).max(5),
  animals: z.array(z.string()).min(1).max(4),
  famousPlace: FamousPlaceSchema,
  phrases: z.array(PhraseSchema).min(3).max(6),
  quizQuestions: z.array(QuizQuestionSchema).min(3).max(6),
  flagEmoji: z.string().min(1),
  available: z.boolean(),
});

export type Phrase = z.infer<typeof PhraseSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type FamousPlace = z.infer<typeof FamousPlaceSchema>;
export type Country = z.infer<typeof CountrySchema>;

export function validateCountries(data: unknown[]): Country[] {
  const results: Country[] = [];
  const errors: string[] = [];

  data.forEach((item, index) => {
    const parsed = CountrySchema.safeParse(item);
    if (parsed.success) {
      results.push(parsed.data);
    } else {
      const id =
        typeof item === 'object' && item !== null && 'id' in item ? String(item.id) : String(index);
      errors.push(`Kraj [${id}]: ${parsed.error.issues.map(i => i.message).join(', ')}`);
    }
  });

  if (errors.length > 0) {
    console.error('Błędy walidacji danych krajów:\n' + errors.join('\n'));
  }

  return results;
}
