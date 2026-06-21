# Arborescence source (annotée) — quick scan

Racine du dépôt : **Visudrome** (monolithe).

```
visudrome/
├── .agents/skills/          # Skills Cursor BMad (hors scope runtime app)
├── .github/workflows/       # CI : npm ci → lint → test → build
├── _bmad/                   # Config BMad + catalogue bmad-help + resolver Python
├── docs/bmad/               # Documentation générée (ce dossier)
├── public/                  # Assets statiques (favicon, icônes PWA, SVG)
├── scripts/                 # generate-pwa-icons, generate-bmad-help-csv, bmad-help-hint
├── src/
│   ├── App.tsx              # Routes + ThemeProvider + NavidromeProvider
│   ├── main.tsx             # Bootstrap React, PWA registerSW en prod
│   ├── index.css            # Thème CSS variables + Tailwind
│   ├── pages/               # DashboardPage, CollectionPage, SettingsPage
│   ├── components/          # Layout, graphiques, rankings, PWA card, ErrorBoundary…
│   ├── context/             # NavidromeContext, ThemeContext
│   ├── hooks/               # useDashboardData, useThemeColors, useAlbumSearch…
│   ├── lib/
│   │   ├── navidrome.ts     # Client Subsonic principal
│   │   ├── navidromeApi.ts  # Appels complémentaires (ex. genres)
│   │   ├── subsonicAuth.ts  # Construction token / salt
│   │   ├── storage.ts       # Profil localStorage / session
│   │   ├── connectionDiagnostics.ts
│   │   ├── db/              # Dexie : schema, index, search, aggregates
│   │   └── sync/            # library, ratings, genres
│   └── types/               # navidrome.ts types
├── index.html               # Shell HTML + meta PWA + fonts
├── vite.config.ts           # Vite + React + Tailwind + Vitest + PWA
├── vercel.json              # SPA rewrites + headers sécurité
├── package.json
└── README.md                # Doc utilisateur principale
```

**Points d’entrée applicatifs :** `index.html` → `src/main.tsx` → `App.tsx`.

**Exclus du scan détaillé :** `node_modules/`, `dist/`.
