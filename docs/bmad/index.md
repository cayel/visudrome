# Index documentation projet — Visudrome

**Type :** monolithe SPA (1 partie `main`, `project_type_id`: web)  
**Langage principal :** TypeScript / React  
**Dernière génération (quick scan) :** 2026-06-21

## Référence rapide

- **Stack :** React 19, Vite 8, Tailwind 4, Dexie, Recharts, React Router 7, vite-plugin-pwa  
- **Entrée :** `src/main.tsx` → `App.tsx`  
- **Persistance :** IndexedDB (Dexie) ; API distante Navidrome (Subsonic)

## Documentation générée

- [Aperçu projet](./project-overview.md)
- [Architecture](./architecture.md)
- [Arborescence source](./source-tree-analysis.md)
- [Guide développement](./development-guide.md)
- [Déploiement](./deployment-guide.md)
- [Inventaire composants](./component-inventory.md)
- [Intégration API (Subsonic / Navidrome)](./api-contracts.md)
- [Modèles de données locaux (Dexie)](./data-models.md)

## Documentation existante (repo)

- [README principal](../../README.md) — utilisateur, CORS, IndexedDB, Vercel, BMad

## État du scan

- Fichier d’état : [project-scan-report.json](./project-scan-report.json) (`scan_level`: **quick**)
- Pour aller plus loin : relancer **bmad-document-project**, choisir **deep** ou **exhaustive**, ou lancer **`bmad-generate-project-context`** pour un `project-context.md` orienté agents.

## Pour un PRD brownfield

Pointer le workflow PRD vers ce fichier **`docs/bmad/index.md`** comme entrée contexte.
