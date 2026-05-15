# AntekG

Osobiste środowisko pracy z Claude Code — zestaw narzędzi i skilli do efektywnej pracy z dokumentami, kodem i projektowaniem UI.

## Wymagania

- [Claude Code](https://claude.ai/code) (CLI lub aplikacja desktopowa)
- Git 2.x+
- Python 3.10+ lub Node.js 18+ (w zależności od projektu)

## Instalacja

```bash
git clone https://github.com/<twój-username>/AntekG.git
cd AntekG
```

## Użycie

Otwórz katalog w Claude Code — skille zostaną automatycznie wykryte z `.claude/skills/`.

Wywołaj skill przez `/nazwa-skilla` w interfejsie Claude Code.

## Zainstalowane skille

| Skill | Opis |
|-------|------|
| `skill-creator` | Tworzenie i optymalizacja własnych skilli, uruchamianie ewaluacji |
| `docx` | Tworzenie, czytanie i edytowanie dokumentów Word (.docx) z pełnym formatowaniem |
| `pdf` | Obsługa plików PDF — czytanie, łączenie, dzielenie, tworzenie, OCR |
| `pptx` | Tworzenie i edytowanie prezentacji PowerPoint (.pptx) |
| `xlsx` | Praca z arkuszami Excel (.xlsx, .csv, .tsv) — formuły, formatowanie, wykresy |
| `frontend-design` | Projektowanie interfejsów UI — komponenty, layouty, systemy designu |

## Struktura projektu

```
AntekG/
├── .claude/skills/   # Skille Claude Code
├── src/              # Kod źródłowy
├── tests/            # Testy
├── docs/             # Dokumentacja
└── ...
```

## Licencja

MIT — szczegóły w pliku [LICENSE](LICENSE).
