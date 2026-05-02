import { useMemo, type ReactNode } from 'react'

import { parseSkillsRadar } from '@/components/candidate/skillsRadar'

type SkillsRadarChartProps = {
  skillsRadar: unknown
  /** CSS color for stroke/fill */
  accentColor?: string
  /** Muted grid/axis color */
  gridColor?: string
  className?: string
}

const VIEW = 220
const CX = VIEW / 2
const CY = VIEW / 2
const R = 72

export function SkillsRadarChart({
  skillsRadar,
  accentColor = 'var(--candidate-primary, #1677ff)',
  gridColor = 'color-mix(in srgb, var(--candidate-text, #0f172a) 18%, transparent)',
  className,
}: SkillsRadarChartProps) {
  const axes = useMemo(() => parseSkillsRadar(skillsRadar), [skillsRadar])

  const { polygonPoints, labelEls, gridPolygons } = useMemo(() => {
    const n = axes.length
    const angleAt = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n

    const gridPolygonsInner: string[] = []
    for (let ring = 1; ring <= 4; ring++) {
      const t = ring / 4
      const pts: string[] = []
      for (let i = 0; i < n; i++) {
        const a = angleAt(i)
        const x = CX + R * t * Math.cos(a)
        const y = CY + R * t * Math.sin(a)
        pts.push(`${x.toFixed(2)},${y.toFixed(2)}`)
      }
      gridPolygonsInner.push(pts.join(' '))
    }

    const poly: string[] = []
    for (let i = 0; i < n; i++) {
      const a = angleAt(i)
      const t = axes[i].value / 100
      const x = CX + R * t * Math.cos(a)
      const y = CY + R * t * Math.sin(a)
      poly.push(`${x.toFixed(2)},${y.toFixed(2)}`)
    }

    const labels: ReactNode[] = []
    const lr = R + 26
    for (let i = 0; i < n; i++) {
      const a = angleAt(i)
      const x = CX + lr * Math.cos(a)
      const y = CY + lr * Math.sin(a)
      const text = axes[i].label
      const short = text.length > 14 ? `${text.slice(0, 12)}…` : text
      labels.push(
        <text
          key={i}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: 9,
            fontWeight: 650,
            fill: 'color-mix(in srgb, var(--candidate-text, #0f172a) 72%, transparent)',
          }}
        >
          {short}
        </text>
      )
    }

    return { polygonPoints: poly.join(' '), labelEls: labels, gridPolygons: gridPolygonsInner }
  }, [axes])

  if (axes.length < 3) return null

  return (
    <svg
      className={className}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width="100%"
      height="auto"
      style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
      role="img"
      aria-label="Skills radar chart"
    >
      {gridPolygons.map((pts, idx) => (
        <polygon
          key={idx}
          points={pts}
          fill="none"
          stroke={gridColor}
          strokeWidth={idx === 3 ? 1.25 : 0.75}
        />
      ))}
      {axes.map((_, i) => {
        const a = -Math.PI / 2 + (2 * Math.PI * i) / axes.length
        const x2 = CX + R * Math.cos(a)
        const y2 = CY + R * Math.sin(a)
        return (
          <line
            key={`spoke-${i}`}
            x1={CX}
            y1={CY}
            x2={x2}
            y2={y2}
            stroke={gridColor}
            strokeWidth={0.75}
          />
        )
      })}
      <polygon
        points={polygonPoints}
        fill={accentColor}
        fillOpacity={0.22}
        stroke={accentColor}
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
      {labelEls}
    </svg>
  )
}
