# Visudrome

Dashboard statistique pour [Navidrome](https://www.navidrome.org/), entièrement côté client. Aucune donnée utilisateur n’est stockée sur un serveur Visudrome : la bibliothèque et les agrégations vivent dans le navigateur (IndexedDB).

## Prérequis

- Node.js 20+
- Une instance Navidrome accessible depuis le navigateur (CORS activé)

## Installation

```bash
npm install
npm run dev
```

L’application démarre sur [http://localhost:5174](http://localhost:5174).

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualisation du build |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run lint` | ESLint |

## Configuration Navidrome

1. Ouvrir **Paramètres** et renseigner l’URL, l’utilisateur et le mot de passe.
2. Visudrome teste la connexion via l’API Subsonic (`ping.view`).
3. Le profil (URL + utilisateur) est conservé dans `localStorage` ; le mot de passe reste dans `sessionStorage` (session du navigateur).

### CORS

Les appels API partent directement du navigateur vers Navidrome. Si la connexion échoue malgré des identifiants corrects, vérifiez la configuration CORS de Navidrome pour autoriser l’origine de Visudrome (ex. `http://localhost:5174`).

### Authentification Subsonic

Les requêtes REST utilisent l’auth par token (`t` + `s`, MD5) — le mot de passe n’apparaît pas dans les URLs. L’API native Navidrome (`/auth/login`) est utilisée uniquement pour résoudre les liens profonds vers les genres.

## Stockage local (IndexedDB)

Base Dexie `visudrome` :

| Table | Rôle |
|-------|------|
| `albums` | Bibliothèque synchronisée, notes par album |
| `syncState` | Horodatages de sync (bibliothèque, notes, genres) |
| `genreLinks` | Correspondance nom de genre → ID Navidrome |

### Politique de synchronisation

- **Bibliothèque et genres** : resync automatique si le cache a plus de 6 h, ou sur **Actualiser**.
- **Notes** : analyse incrémentale (reprise possible) ; resync complet uniquement sur **Actualiser**.
- **Déconnexion** : efface la config et vide IndexedDB.

## Limites connues

- Première analyse des notes : un appel `getAlbum.view` par album (barre de progression affichée).
- Données locales liées au navigateur et à l’origine du site ; vider les données du site supprime le cache.
- Seuls les albums **100 % notés** entrent dans le classement « Meilleurs disques ».
- En cas d’égalité de note, le disque avec le **plus de titres** est classé devant.

## Stack

React 19, Vite, TypeScript, Dexie (IndexedDB), Recharts, React Router.

## Déploiement sur Vercel

Visudrome est une **SPA statique** : aucun backend à héberger. Vercel convient parfaitement.

### Étapes

1. Pousser le dépôt sur GitHub (ou GitLab / Bitbucket).
2. Sur [vercel.com](https://vercel.com), **Add New Project** → importer le dépôt.
3. Vercel détecte Vite automatiquement. Sinon :
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
4. Déployer. Vous obtenez une URL du type `https://visudrome.vercel.app`.

Le fichier `vercel.json` à la racine configure le routage SPA (`/collection`, `/parametres`) et quelques en-têtes de sécurité.

### Domaine personnalisé

Dans Vercel → **Settings → Domains**, ajoutez votre domaine (ex. `visudrome.example.com`). Le HTTPS est provisionné automatiquement.

### CORS Navidrome (important pour les utilisateurs)

Chaque visiteur connecte **son propre** Navidrome à Visudrome hébergé sur Vercel. Les appels API partent du navigateur vers le serveur Navidrome de l'utilisateur.

- Navidrome autorise **toutes les origines** par défaut (`Access-Control-Allow-Origin: *`) — cela fonctionne en général sans configuration.
- Si la connexion échoue avec une erreur CORS, la cause est souvent un **reverse proxy** (Nginx, Traefik, Cloudflare…) qui supprime ou duplique les en-têtes CORS. L'administrateur Navidrome doit autoriser l'origine Visudrome, par exemple `https://visudrome.vercel.app` ou votre domaine custom.

Visudrome affiche l'origine exacte dans la page **Paramètres** pour faciliter la configuration.

### Ce que Vercel ne stocke pas

Aucune donnée utilisateur (bibliothèque, notes, mot de passe) ne transite par Vercel : seuls les fichiers HTML/JS/CSS sont servis. Les identifiants restent dans le navigateur de chaque visiteur.

### CI recommandée

Un workflow GitHub Actions (`.github/workflows/ci.yml`) exécute `lint`, `test` et `build` à chaque push. Activez-le avant d'ouvrir le dépôt au public.

### Checklist avant lancement public

- [ ] Tester la connexion depuis l'URL Vercel vers **votre** Navidrome
- [ ] Vérifier dashboard + collection + sync notes sur une vraie bibliothèque
- [ ] Configurer un domaine custom (optionnel)
- [ ] Mentionner dans une page d'accueil ou README que le mot de passe est conservé **le temps de la session** du navigateur
