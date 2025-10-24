# Önskelistan

En delbar önskelista-app med realtidssynkning byggd med TypeScript och Supabase.

## Funktioner

- ✅ Skapa önskelistor med UUID-baserade URLs
- ✅ Organisera önskningar per person/kategori
- ✅ "Paxa" önskningar så andra ser vad som är taget
- ✅ **Realtidssynkning** - flera användare kan ha samma lista öppen samtidigt
- ✅ Dela listor genom att kopiera URL:en
- ✅ **Handskriven stil** med lined paper-bakgrund
- ✅ **Ljust/mörkt tema** med smooth transitions
- ✅ **Flerspråk** - Svenska/Engelska
- ✅ **Exportera/Importera** - Spara listor som JSON
- ✅ **Automatisk städning** - Listor raderas efter 30 dagar utan åtkomst

## Datamodell

```
WishList (UUID)
  ├── id: uuid
  ├── name: string
  └── sublists: Sublist[]
       ├── id: number
       ├── name: string (person/kategori)
       └── items: WishItem[]
            ├── id: number
            ├── text: string
            ├── claimed: boolean
            └── claimed_by: string | null
```

## Setup

### 1. Installera dependencies

```bash
npm install
```

### 2. Konfigurera Supabase

Du behöver ett Supabase-projekt (gratis tier räcker). Följ instruktionerna i [supabase/README.md](supabase/README.md):

1. Skapa projekt på [app.supabase.com](https://app.supabase.com)
2. Kör SQL-migrationen i SQL Editor:
   - `migrations/001_initial_schema.sql` - Grundläggande schema
   - `migrations/002_add_last_accessed.sql` - Automatisk städning
3. Kopiera API credentials
4. Uppdatera `src/config/supabase.config.ts` med dina credentials

Se [supabase/MIGRATION_GUIDE.md](supabase/MIGRATION_GUIDE.md) för mer info om migrationer.

### 3. Kompilera TypeScript

```bash
npm run build
```

### 4. Kör lokalt

Öppna `index.html` i en webbläsare (behöver en lokal server för ES modules):

```bash
# Med Python
python -m http.server 8000

# Med Node
npx serve

# Med VS Code Live Server
# Högerklicka på index.html → "Open with Live Server"
```

Gå till `http://localhost:8000`

### 5. Utvecklingsläge

```bash
npm run dev  # Starta development server med Vite
```

### 6. Tester

Projektet använder Vitest för enhetstester.

```bash
# Kör alla tester
npm test

# Kör tester med UI (visuell testrunner)
npm run test:ui

# Kör tester med coverage report
npm run test:coverage
```

**Test coverage:**
- ✅ Services (wishlistService, themeService, languageService, router, etc.)
- ✅ Mocked Supabase client för snabba tester
- ✅ Helper functions och utilities

Tester körs i jsdom-miljö och mockar alla external dependencies.

## Deployment till Vercel

1. Pusha koden till GitHub
2. Gå till [vercel.com](https://vercel.com) och importera projektet
3. Inga environment variables behövs (credentials finns i `supabase.config.ts`)
4. Deployn händer automatiskt

Din app blir tillgänglig på: `https://your-app.vercel.app`

## Hur det fungerar

### URL-routing
- `/` - Startsida för att skapa ny lista
- `/{uuid}` - Specifik önskelista (delbar)

### Realtid
När en användare uppdaterar listan (lägger till önskning, paxar, etc.) syns ändringen direkt hos alla andra som har samma UUID öppen. Detta fungerar via Supabase Realtime subscriptions.

### Automatisk Städning
Önskelistor som inte öppnats på 30 dagar raderas automatiskt från databasen. Detta:
- Håller databasen ren
- Säkerställer att oanvända listor inte tar upp utrymme
- `last_accessed_at` uppdateras varje gång någon öppnar en lista

För att köra städning manuellt (eller sätta upp automatisk scheduling):
```sql
SELECT cleanup_old_wishlists();
```

Se [supabase/MIGRATION_GUIDE.md](supabase/MIGRATION_GUIDE.md) för mer info.

### Export/Import
- **Exportera**: Spara din lista som JSON-fil (från vänster verktygslåda)
- **Importera**: Ladda en sparad lista från JSON (från startsidan med "Ladda"-knappen)
  - Om listan redan finns i databasen → navigerar till den befintliga (visar senaste versionen)
  - Om listan har raderats (30+ dagar) → återskapas med samma UUID
  - JSON-filen fungerar som både backup och permanent länk till listan

## Projektstruktur

```
onskelistan/
├── src/
│   ├── config/
│   │   └── supabase.config.ts       # Supabase credentials
│   ├── services/
│   │   ├── supabaseClient.ts        # Supabase client singleton
│   │   ├── wishlistService.ts       # CRUD operations
│   │   ├── realtimeService.ts       # Realtime subscriptions
│   │   ├── router.ts                # Client-side routing
│   │   ├── themeService.ts          # Light/dark theme management
│   │   ├── languageService.ts       # Swedish/English translations
│   │   └── listActionsService.ts    # Export/import JSON
│   ├── styles/
│   │   ├── theme.css                # CSS variables for themes
│   │   └── main.css                 # Main styles
│   └── app.ts                       # Main application
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql   # Base database schema
│   │   └── 002_add_last_accessed.sql # Auto-cleanup functionality
│   ├── MIGRATION_GUIDE.md           # Migration instructions
│   └── README.md                    # Supabase setup guide
├── dist/                            # Compiled JavaScript
├── index.html
├── vercel.json                      # Vercel deployment config
└── README.md
```

## Troubleshooting

**"Supabase är inte konfigurerad"**
- Uppdatera `src/config/supabase.config.ts` med dina Supabase credentials
- Se [supabase/README.md](supabase/README.md) för instruktioner

**Routing fungerar inte lokalt**
- ES modules kräver en HTTP server, öppna inte `index.html` direkt
- Använd Python http.server, VS Code Live Server eller liknande

**Realtime fungerar inte**
- Kontrollera att du kört hela SQL-migrationen
- Verifiera att Realtime är aktiverat i Supabase dashboard

## Teknisk stack

- **Frontend**: TypeScript, Vanilla JS (ingen framework), CSS med variables
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Styling**: Patrick Hand font (Google Fonts), CSS custom properties
- **Build**: Vite
- **Testing**: Vitest med jsdom, mocked Supabase
- **Hosting**: Vercel (eller vilken static host som helst)
- **Cost**: Gratis (Supabase Free tier + Vercel Hobby)

## Användning

### Tema och Språk
- Byt mellan ljust/mörkt tema med knapparna i höger verktygslåda
- Välj språk (Svenska/Engelska) i samma verktygslåda
- Inställningar sparas i localStorage

### Export/Import
1. **Spara lista**: Öppna en lista → Klicka "💾 Spara JSON" i vänster verktygslåda
2. **Ladda lista**: På startsidan → Klicka "Ladda" → Välj JSON-fil
   - Om listan finns kvar i databasen → öppnar den befintliga listan
   - Om listan har raderats → återskapas med samma UUID från JSON-filen
   - Alla personer/kategorier och önskningar importeras vid återställning

### Automatisk Städning
- Listor som inte öppnas på 30 dagar raderas automatiskt
- Detta håller databasen ren och respekterar free tier-begränsningar
- Du kan alltid exportera viktiga listor som backup
- Om du laddar en raderad lista från JSON återskapas den med samma UUID
