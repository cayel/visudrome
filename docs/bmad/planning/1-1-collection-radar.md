---
baseline_commit: 524dce39a1ba314be58fababa4119fe41ff3b668
story_key: 1-1-collection-radar
title: Radar collection — insights et liens Collection
status: done
---

# Story

En tant qu’utilisateur, je veux voir sur le **dashboard** des **cartes d’insight** (« Radar collection ») basées sur ma bibliothèque locale (**décennies sous-représentées**, **albums sans analyse de notes** complète ou partielle), avec un **lien vers la Collection** préfiltrée quand c’est pertinent.

# Acceptance Criteria

1. Une section **Radar collection** apparaît sur le dashboard lorsque les données agrégées sont disponibles (pas en erreur bloquante) et qu’**au moins une** carte insight est calculée.
2. Les insights sont calculés **côté client** à partir des mêmes agrégats que le dashboard (aucun serveur Visudrome).
3. Un clic sur une carte mène vers **`/collection`** avec des **paramètres d’URL** (`rs`, `yf`, `yt` ; le paramètre `g` reste pris en charge par la page Collection pour d’éventuels liens externes ou manuels) que la page Collection applique **une fois** au chargement sans boucle infinie.
4. Les libellés et textes sont en **français**, accessibles (titres de section, cartes cliquables).
5. **Tests unitaires** sur la logique pure de calcul des insights (`collectionRadar`).

# Tasks / Subtasks

- [x] Étendre `DashboardData` + `buildDashboardData` (snapshot notes, 1 lecture albums)
- [x] Implémenter `src/lib/collectionRadar.ts` + tests
- [x] Composant `CollectionRadar` + styles + intégration `DashboardPage`
- [x] Lecture params URL dans `CollectionPage` (application unique)
- [x] `npm run test` + `npm run lint`

# Dev Notes

- `partial` = `ratingCheckedAt` défini et `fullyRated` false (aligné `search.ts`).
- Limiter le nombre de cartes (max 4) pour lisibilité mobile.
- Les cartes radar n’exploitent plus les genres « singleton » (fonctionnalité retirée comme non pertinente).

# Dev Agent Record

## Implementation Plan

- Agrégats dashboard enrichis sans multiplier les allers-retours Dexie.
- Insights = fonctions pures testables.

## Debug Log

(néant)

## Completion Notes

- `buildDashboardData` charge albums + genreLinks une fois ; calcule `ratingSnapshot` en mémoire.
- Section **Radar collection** sur le dashboard ; liens `/collection?rs=…&yf=…&yt=…` (et `g` toujours hydratable depuis l’URL sur la page Collection) ; hydratation unique via `useRef` + `queueMicrotask` pour ouvrir le panneau filtres avancés sans violation ESLint.
- `setFilters` du hook `useAlbumSearch` accepte désormais `SetStateAction` (aligné React).
- Revue **bmad-checkpoint-preview** : **Approve** (2026-06-21) — livrable validé pour intégration / merge côté git selon votre flux.

# File List

- `src/lib/dashboardTypes.ts`
- `src/lib/db/aggregates.ts`
- `src/lib/collectionRadar.ts`
- `src/lib/collectionRadar.test.ts`
- `src/components/CollectionRadar.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/CollectionPage.tsx`
- `src/hooks/useAlbumSearch.ts`
- `src/index.css`
- `docs/bmad/planning/1-1-collection-radar.md`

# Change Log

- 2026-06-21 : Implémentation initiale radar (story `1-1-collection-radar`).
- 2026-06-21 : Retrait des insights « genres uniques » / `singletonGenres` (hors périmètre produit) ; doc et types alignés.
- 2026-06-21 : Checkpoint preview **Approve** ; statut story → **done**.

### Review Findings

- [x] **patch** — `CollectionPage` : `decodeURIComponent` sur le paramètre `g` peut lever une exception si la chaîne contient une séquence `%` invalide ; entourer d’un `try/catch` et ignorer `g` en cas d’erreur (ou laisser la valeur brute).
- [ ] **defer** — Seuils du radar (`MIN_ALBUMS_DECADE`, `0.32`, 4 cartes max) : pas documentés pour l’équipe produit ; envisager commentaire ou constantes nommées exportées pour tuning.
- [x] **dismiss** — Médiane sur un nombre pair de décennies (demi-somme) : acceptable pour le tri « décennie la plus faible » ; pas d’écart bloquant vs AC.
- [x] **dismiss** — `getAlbumCount` vs `albums.length` dans `buildDashboardData` : cohérent tant que la liste chargée est la bibliothèque complète (pas de filtre intermédiaire).
- [ ] **defer** — Tests E2E (navigation `/collection?…` + état filtres) : hors périmètre AC actuel (tests unitaires `collectionRadar` présents) ; à traiter si régression fréquente sur l’hydratation URL.
