# Construction Management App

Aplikacja do zarządzania budowami i materiałami budowlanymi. System umożliwia kompleksowe zarządzanie projektami budowlanymi, materiałami, magazynem oraz zamówieniami.

## Funkcjonalności

### Zarządzanie budowami

- Tworzenie, edycja i usuwanie budów
- Lista wszystkich budów z możliwością wyszukiwania i filtrowania
- Statusy budów: Planowana, W trakcie, Zakończona
- Szczegółowy dashboard dla każdej budowy
- Informacje o budowie: nazwa, opis, adres, data rozpoczęcia, status

### Zarządzanie materiałami

- Katalog materiałów budowlanych
- Kategorie materiałów (Materiały podstawowe, Wykończeniowe, Instalacyjne, Narzędzia, Bezpieczeństwo)
- Dodawanie i edycja materiałów
- Różne jednostki miary: metry, kilogramy, metry sześcienne, litry, sztuki, itp.
- Filtrowanie i sortowanie materiałów

### Magazyn

- Zarządzanie stanem magazynowym materiałów na budowie
- Wyświetlanie dostępnych materiałów z ilościami
- Aktualizacja stanów magazynowych

### Zamówienia

- Tworzenie zamówień materiałów
- Statusy zamówień: Oczekujące, Zamówione, Dostarczone
- Zarządzanie zamówieniami dla każdej budowy

### Import dokumentów

- Import dokumentów dostaw (delivery notes)
- Automatyczna aktualizacja stanów magazynowych po imporcie

### Interfejs użytkownika

- Wielojęzyczność (Polski, Angielski)
- Nowoczesny, responsywny interfejs
- Komponenty UI oparte na Radix UI i shadcn/ui
- Ciemny/jasny motyw (next-themes)

## Technologie

- **Framework**: Next.js 16 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5.4.0
- **Styling**: Tailwind CSS 3.4.4
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: TanStack React Query 5.90.10
- **Form Handling**: React Hook Form 7.55.0
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Theming**: next-themes

## Wymagania

- Node.js 18+
- npm, yarn lub pnpm

## Instalacja

1. Sklonuj repozytorium:

```bash
git clone <repository-url>
cd construction-front
```

2. Zainstaluj zależności:

```bash
npm install
# lub
yarn install
# lub
pnpm install
```

3. Skonfiguruj zmienne środowiskowe (jeśli wymagane):
   Utwórz plik `.env.local` i dodaj niezbędne konfiguracje (np. URL API backendu).

4. Uruchom serwer deweloperski:

```bash
npm run dev
# lub
yarn dev
# lub
pnpm dev
```

## Dostępne skrypty

- `npm run dev` - Uruchamia serwer deweloperski
- `npm run build` - Buduje aplikację produkcyjną
- `npm run start` - Uruchamia zbudowaną aplikację produkcyjną
- `npm run lint` - Uruchamia linter ESLint

## Struktura projektu

```
construction-front/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/[id]/     # Dashboard budowy
│   │   ├── materials/          # Zarządzanie materiałami
│   │   └── page.tsx            # Strona główna (lista budów)
│   ├── components/             # Komponenty React
│   │   ├── materials/          # Komponenty materiałów
│   │   ├── shared/             # Współdzielone komponenty
│   │   └── ui/                 # Komponenty UI (shadcn/ui)
│   ├── contexts/               # React Contexts
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Biblioteki i utilities
│   │   └── api/                # API clients
│   ├── types/                  # TypeScript types
│   └── config/                 # Konfiguracja aplikacji
├── public/                     # Statyczne pliki
└── package.json
```

## API Integration

Aplikacja komunikuje się z backendem przez API endpoints zdefiniowane w:

- `src/lib/api/constructions.ts` - Endpointy budów
- `src/lib/api/materials.ts` - Endpointy materiałów
- `src/lib/api/categories.ts` - Endpointy kategorii
- `src/lib/api/storage-items.ts` - Endpointy magazynu

## Wielojęzyczność

Aplikacja obsługuje dwa języki:

- Polski (domyślny)
- Angielski

Tłumaczenia znajdują się w `src/config/translations.ts`. Przełączanie języka odbywa się przez kontekst `LanguageContext`.

## Stylowanie

Aplikacja używa Tailwind CSS z niestandardową konfiguracją. Komponenty UI są oparte na shadcn/ui i Radix UI.

## Typy danych

Główne typy TypeScript zdefiniowane w `src/types/index.ts`:

- `Construction` - Budowa
- `Material` - Materiał
- `Category` - Kategoria
- `StorageItem` - Element magazynowy
- `Order` - Zamówienie
