import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatDecadeRange } from '../lib/decades'
import { getDecadeBarColor } from '../lib/chartColors'
import { useThemeColors } from '../hooks/useThemeColors'
import type { DecadeCount } from '../types/navidrome'

interface AlbumsByDecadeChartProps {
  data: DecadeCount[]
  loading: boolean
  error: string | null
}

interface TooltipPayload {
  payload: DecadeCount
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null

  const { decade, count } = payload[0].payload

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-year">{formatDecadeRange(decade)}</p>
      <p className="chart-tooltip-count">
        {count} {count === 1 ? 'disque' : 'disques'}
      </p>
    </div>
  )
}

export function AlbumsByDecadeChart({ data, loading, error }: AlbumsByDecadeChartProps) {
  const colors = useThemeColors()

  if (loading) {
    return (
      <div className="chart-loading" aria-label="Chargement du graphique">
        <div className="skeleton chart-skeleton" />
      </div>
    )
  }

  if (error) {
    return <p className="alert alert-error">{error}</p>
  }

  if (data.length === 0) {
    return <p className="chart-empty">Aucune année de sortie disponible dans votre collection.</p>
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="decade"
            tick={{ fill: colors.tick, fontSize: 11 }}
            axisLine={{ stroke: colors.grid }}
            tickLine={{ stroke: colors.grid }}
            tickFormatter={(value) => `${value.toLocaleString('fr-FR')}s`}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: colors.tick, fontSize: 11 }}
            axisLine={{ stroke: colors.grid }}
            tickLine={{ stroke: colors.grid }}
            width={40}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: colors.cursor }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.decade} fill={getDecadeBarColor(colors.bar, index, data.length)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
