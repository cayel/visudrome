# Inventaire composants (quick scan)

## Layout & navigation

| Composant | Rôle |
|-----------|------|
| `Layout.tsx` | En-tête, navigation (dashboard / collection / paramètres), thème |
| `ThemeToggle.tsx` | Bascule clair / sombre |
| `ErrorBoundary.tsx` | Capture erreurs React |

## Pages

| Page | Rôle |
|------|------|
| `DashboardPage.tsx` | KPI, graphiques année/décennie, classements |
| `CollectionPage.tsx` | Filtres locaux, liste / mosaïque |
| `SettingsPage.tsx` | Connexion Navidrome, PWA install card |

## Visualisation & données

| Composant | Rôle |
|-----------|------|
| `AlbumsByYearChart.tsx`, `AlbumsByDecadeChart.tsx` | Recharts (lazy) |
| `TemporalDistributionChart.tsx` | Distribution temporelle |
| `TopArtistsRanking.tsx`, `TopGenresRanking.tsx`, `TopAlbumsRanking.tsx` | Classements |
| `RankingRow.tsx`, `RankingExpandButton.tsx` | Lignes de classement |
| `RatingSyncProgressBar.tsx` | Progression sync notes |
| `AlbumSearchResults.tsx`, `CollectionViewToggle.tsx` | Collection |

## PWA

| Composant | Rôle |
|-----------|------|
| `PwaInstallCard.tsx` | Instructions + `beforeinstallprompt` Android |

## Autres

- Hooks : `useDashboardData`, `useTopRatedAlbums`, `useThemeColors`, `useAlbumSearch`, `useRankingLimit`
- Contextes : `NavidromeContext`, `ThemeContext`
