# Architecture — Visudrome

## Vue d’ensemble

Application **SPA** chargée une fois ; la logique métier vit dans `src/`. Les appels réseau ciblent **uniquement l’instance Navidrome** configurée par l’utilisateur (API compatible **Subsonic** en JSON). La persistance est **locale** (IndexedDB via Dexie).

## Flux principal

1. **Paramètres** (`/parametres`) : URL serveur, utilisateur, mot de passe → test `ping.view` → stockage profil (`localStorage`) et mot de passe session (`sessionStorage`).
2. **Contexte** `NavidromeProvider` : expose config, sync, état « configuré ».
3. **Routes protégées** : `/` (dashboard), `/collection` — redirection vers paramètres si non configuré.
4. **Synchronisation** : modules sous `src/lib/sync/` alimentent Dexie ; hooks (`useDashboardData`, etc.) lisent agrégations / classements.
5. **PWA** : en production, enregistrement SW + manifest ; pas de backend Visudrome.

## Couches

| Couche | Rôle |
|--------|------|
| `pages/` | Compositions écran (Dashboard, Collection, Settings) |
| `components/` | UI réutilisable (graphiques, rankings, layout) |
| `hooks/` | Données et thème |
| `context/` | Navidrome, thème clair/sombre |
| `lib/` | API Subsonic, IndexedDB, utilitaires, diagnostics réseau |
| `types/` | Types Navidrome partagés |

## Patterns

- **Auth Subsonic** : paramètres `t` + `s` (salt + MD5 du mot de passe) — voir `subsonicAuth.ts`.
- **Charts** : import dynamique Recharts pour limiter le bundle principal.
- **Erreurs** : `ErrorBoundary`, messages CORS / contenu mixte via `connectionDiagnostics.ts`.

## Contraintes sécurité / déploiement

- Page **HTTPS** (ex. Vercel) ne peut pas appeler Navidrome **HTTP** (contenu mixte) : documenté côté utilisateur dans les paramètres.
- CORS : Navidrome doit autoriser l’origine du client (ex. `http://localhost:5174`).

## Tests

- Tests unitaires ciblés `src/**/*.test.ts` (Vitest, `fake-indexeddb` pour Dexie).
