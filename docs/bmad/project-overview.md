# Visudrome — aperçu projet

## Objectif

**Visudrome** est un tableau de bord statistique pour [Navidrome](https://www.navidrome.org/) : exploration de la bibliothèque, graphiques, classements, collection filtrable. **Tout s’exécute dans le navigateur** ; aucune donnée utilisateur n’est envoyée à un backend Visudrome (cache et agrégations dans **IndexedDB**).

## Type de dépôt

- **Monolithe** SPA TypeScript.
- **Pas de serveur applicatif** dans le repo : build statique (`dist/`) déployable (ex. Vercel).

## Stack (résumé)

| Catégorie | Technologie |
|-----------|-------------|
| UI | React 19, React Router 7 |
| Build | Vite 8, TypeScript |
| Style | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Données locales | Dexie (IndexedDB) |
| Graphiques | Recharts (lazy load) |
| API distante | REST Subsonic / Navidrome (`fetch` depuis le client) |
| Auth client | Token Subsonic MD5 (`js-md5`), secrets en `sessionStorage` |
| Qualité | ESLint 10, Vitest 4, CI GitHub Actions |
| PWA | `vite-plugin-pwa` (manifest + service worker) |

## Liens utiles

- [Architecture](./architecture.md)
- [Arborescence annotée](./source-tree-analysis.md)
- [Guide développement](./development-guide.md)
- [Déploiement](./deployment-guide.md)
- [Intégration API (Subsonic)](./api-contracts.md)
- [Modèles de données locaux](./data-models.md)
- [Inventaire composants](./component-inventory.md)

## Scan

- **Niveau :** quick (généré en session agent, juin 2026).
- Pour un passage **deep** ou **exhaustive**, relancer le workflow document-project et choisir le niveau correspondant.
