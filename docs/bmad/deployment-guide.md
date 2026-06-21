# Déploiement — Visudrome

## Nature du build

Sortie **`dist/`** : site statique (HTML, JS, CSS, assets). Aucun serveur Node requis en production.

## Vercel

- Fichier **`vercel.json`** : réécritures SPA vers `index.html`, en-têtes `X-Content-Type-Options`, `Referrer-Policy`.
- Projet Vercel : **Build** `npm run build`, **Output** `dist`.
- Chaque utilisateur final configure **son** Navidrome dans l’app ; contrainte HTTPS ↔ HTTP (contenu mixte) documentée dans l’UI.

## CI (GitHub Actions)

Workflow **`.github/workflows/ci.yml`** sur `push`/`pull_request` vers `main` / `master` :

1. `npm ci`
2. `npm run lint`
3. `npm run test`
4. `npm run build`

## PWA

- Build prod : service worker + precache via `vite-plugin-pwa`.
- Hébergement LAN : préférer `npm run start:lan` ou équivalent nginx/Caddy derrière HTTPS si besoin d’installation PWA complète hors localhost.
