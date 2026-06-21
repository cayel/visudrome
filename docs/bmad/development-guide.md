# Guide développement — Visudrome

## Prérequis

- **Node.js 20+**
- **npm** (lockfile présent)

## Installation

```bash
npm install
```

## Commandes courantes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Vite dev server (port **5174**) |
| `npm run build` | `tsc -b` + build production |
| `npm run preview` | Servir `dist/` localement |
| `npm run preview:lan` | Preview écoutant `0.0.0.0:5174` (LAN) |
| `npm run start:lan` | `build` puis `preview:lan` |
| `npm run test` | Vitest une fois |
| `npm run test:watch` | Vitest watch |
| `npm run lint` | ESLint |
| `npm run generate:icons` | PNG PWA depuis `public/app-icon.svg` |
| `npm run bmad:catalog` | Régénère `_bmad/_config/bmad-help.csv` |

## Tests

- Fichiers : `src/**/*.test.ts`
- IndexedDB en test : `fake-indexeddb`

## Navidrome local

Configurer dans l’app une URL joignable depuis le navigateur (ex. `http://192.168.x.x:4533`). Vérifier CORS côté Navidrome pour l’origine utilisée (`localhost:5174`, IP LAN, etc.).

## Structure à respecter

- Logique API Navidrome : `src/lib/navidrome*.ts`, `subsonicAuth.ts`
- Persistance : `src/lib/db/`, `src/lib/sync/`
- UI : composants sous `components/`, pages sous `pages/`
