# BMad — configuration du projet Visudrome

Ce dossier active les skills BMad qui attendent des chemins et un catalogue central.

## Fichiers

| Chemin | Rôle |
|--------|------|
| `_config/bmad-help.csv` | Catalogue des skills (régénérer avec `npm run bmad:catalog` à la racine du repo). |
| `config.yaml` | Paramètres projet (langue, chemins de sortie). |
| `user-config.yaml` | Surcharges personnelles (optionnel, peut être versionné ou ignoré). |
| `bmm/config.yaml` | Config « BMM » lue par certains workflows (ex. `bmad-prd`). |
| `config.toml` / `config.user.toml` | Config lue par `bmad-customize` (TOML). |
| `custom/*.toml` | Overrides d’équipe par skill ; `*.user.toml` = perso (voir `.gitignore`). |
| `scripts/resolve_customization.py` | Fusion `customize.toml` + `_bmad/custom/` (vérif post-override). |

## Skills installées

Les définitions des prompts vivent dans **`.agents/skills/`** (hors `_bmad`). Le CSV duplique le routage pour l’aide et la détection d’artefacts.

## Sorties suggérées

Par défaut : `docs/bmad/` (briefs, PRD, specs, contexte). Crée des sous-dossiers au fil des workflows ; le CSV pointe des motifs `outputs` pour repérer l’avancement.

## Langue

`communication_language` et `document_output_language` sont en **français** dans `config.yaml`. Adapte `user_name` si tu veux que les agents te saluent par ton prénom.

## Documentation BMad

Guide officiel (personnalisation, méthode) : [docs.bmad-method.org](https://docs.bmad-method.org/how-to/customize-bmad/)
