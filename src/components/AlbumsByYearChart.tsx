import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useThemeColors } from '../hooks/useThemeColors'
import type { YearCount } from '../types/navidrome'

interface AlbumsByYearChartProps {
  data: YearCount[]
  loading: boolean
  error: string | null
}

interface TooltipPayload {
  payload: YearCount
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null

  const { year, count } = payload[0].payload

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-year">{year}</p>
      <p className="chart-tooltip-count">
        {count} {count === 1 ? 'disque' : 'disques'}
      </p>
    </div>
  )
}

export function AlbumsByYearChart({ data, loading, error }: AlbumsByYearChartProps) {
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
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: data.length > 20 ? 48 : 24 }}>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: colors.tick, fontSize: 10 }}
            axisLine={{ stroke: colors.grid }}
            tickLine={{ stroke: colors.grid }}
            minTickGap={12}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: colors.tick, fontSize: 11 }}
            axisLine={{ stroke: colors.grid }}
            tickLine={{ stroke: colors.grid }}
            width={40}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: colors.cursor }} />
          <Bar dataKey="count" fill={colors.bar} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
