# Modèles de données — Visudrome

## IndexedDB (Dexie)

Base **`visudrome`** — définition dans `src/lib/db/schema.ts` et initialisation `src/lib/db/index.ts`.

### Tables / stores (concepts)

| Concept | Rôle |
|---------|------|
| **Albums** | Méta albums synchronisés + champs de notes (`averageRating`, `trackCount`, `fullyRated`, etc.) |
| **syncState** | Horodatages de sync par domaine (bibliothèque, notes, genres) |
| **genreLinks** | Correspondance nom de genre → identifiant Navidrome |

### Clés composées

- `buildAlbumKey(configKey, albumId)`
- `buildGenreLinkKey(configKey, genreName)`

`configKey` permet de séparer les données par profil Navidrome.

## Pas de serveur SQL

Aucune migration SQL dans le repo : le modèle « données métier » distant est celui de **Navidrome** ; localement seule la **projection** pour l’UI et les stats est stockée dans IndexedDB.
