# Contrats API — Visudrome (intégration externe)

> Ce dépôt **n’expose pas** d’API REST serveur. Les « contrats » ci-dessous décrivent l’usage **client → Navidrome** (API Subsonic compatible).

## Base URL

`{serverUrl}/rest/{endpoint}.view` avec paramètres query (auth Subsonic, `v`, `c`, `f=json`).

## Auth

- Paramètres **`t`** (token) et **`s`** (salt) construits à partir du mot de passe (MD5) — voir `src/lib/subsonicAuth.ts`.
- Client déclaré : `c=visudrome`, version API `1.16.1` dans `navidrome.ts`.

## Endpoints relevés (implémentation actuelle)

Les noms exacts sont dans `src/lib/navidrome.ts` et `navidromeApi.ts` (ex. `ping.view`, listes d’albums, détail album pour notes, etc.). Quick scan : consulter ces fichiers pour la liste exhaustive des `endpoint` passés à `subsonicRequest` / `buildApiUrl`.

## Navidrome natif (ponctuel)

- Certaines résolutions (ex. genres) peuvent passer par l’API JSON Navidrome (`/auth/login` ou routes documentées dans le code) — voir `navidromeApi.ts`.

## Erreurs & réseau

- `connectionDiagnostics.ts` : préflight URL (mixte HTTPS/HTTP), messages d’échec `fetch`.

Pour une table endpoint ↔ schéma JSON détaillée, lancer un **deep scan** document-project ou lire le code source des modules `lib/`.
