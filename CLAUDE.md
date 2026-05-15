# AntekG — instrukcje dla Claude Code

## Opis projektu

AntekG to osobiste środowisko pracy z Claude Code, wyposażone w zestaw oficjalnych skilli Anthropic do obsługi dokumentów, projektowania UI i tworzenia własnych narzędzi.

## Struktura projektu

```
AntekG/
├── .claude/
│   └── skills/          # Oficjalne skille Anthropic
├── src/                 # Kod źródłowy
├── tests/               # Testy
├── docs/                # Dokumentacja
├── CLAUDE.md            # Ten plik
├── README.md
└── LICENSE
```

## Dostępne skille i kiedy ich używać

| Skill | Kiedy używać |
|-------|-------------|
| `skill-creator` | Tworzenie nowych skilli, modyfikacja istniejących, uruchamianie ewaluacji |
| `docx` | Tworzenie, czytanie, edytowanie plików Word (.docx) |
| `pdf` | Czytanie, łączenie, dzielenie, tworzenie plików PDF |
| `pptx` | Tworzenie i edytowanie prezentacji PowerPoint (.pptx) |
| `xlsx` | Praca z arkuszami kalkulacyjnymi Excel (.xlsx, .csv) |
| `frontend-design` | Projektowanie interfejsów UI, komponenty, layouty |

## Konwencje kodowania

- Komentarze i dokumentacja: **po polsku lub po angielsku** (konsekwentnie w pliku)
- Nazwy zmiennych/funkcji: `snake_case` (Python) lub `camelCase` (JS/TS)
- Brak zbędnych komentarzy — kod powinien być samodokumentujący
- Testy dla każdego nowego modułu w `tests/`
- Nie commitować plików `.env` ani poufnych danych

## Wskazówki dla Claude

- Używaj skilli z `.claude/skills/` gdy zadanie pasuje do ich opisu
- Przed instalacją zależności zapytaj o preferowany stack
- Sprawdzaj `src/` przed tworzeniem nowych plików — może już istnieje odpowiedni moduł
- Commity powinny być małe i opisowe
