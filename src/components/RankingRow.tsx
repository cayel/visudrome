import type { CSSProperties, ReactNode } from 'react'

interface RankingRowProps {
  href?: string
  progress: number
  className?: string
  children: ReactNode
}

export function RankingRow({ href, progress, className = '', children }: RankingRowProps) {
  const style = { '--ranking-pct': `${Math.min(100, Math.max(0, progress))}%` } as CSSProperties
  const rowClassName = `ranking-row ${className}`.trim()

  const content = (
    <>
      <span className="ranking-bar" aria-hidden="true" />
      {children}
    </>
  )

  if (href) {
    return (
      <li className="ranking-item">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${rowClassName} ranking-row-interactive`}
          style={style}
        >
          {content}
        </a>
      </li>
    )
  }

  return (
    <li className="ranking-item">
      <div className={rowClassName} style={style}>
        {content}
      </div>
    </li>
  )
}
