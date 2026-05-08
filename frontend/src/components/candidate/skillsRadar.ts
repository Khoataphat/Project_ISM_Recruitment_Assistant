export type RadarAxis = { label: string; value: number }

function flattenNumericRadar(obj: unknown, prefix = ''): Record<string, number> {
  const out: Record<string, number> = {}
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return out

  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix} · ${k}` : k
    if (typeof v === 'number' && Number.isFinite(v)) {
      out[key] = v
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flattenNumericRadar(v, key))
    }
  }
  return out
}

/** Normalize JSON `skills_radar` into axis data; returns [] if empty or invalid for a radar (need ≥3 axes). */
export function parseSkillsRadar(data: unknown): RadarAxis[] {
  const flat = flattenNumericRadar(data)
  const entries = Object.entries(flat)
  if (entries.length < 3) return []

  const raw = entries.map(([label, v]) => {
    const labelNice = label.replace(/_/g, ' ')
    return { label: labelNice, value: v }
  })

  const maxV = Math.max(...raw.map((r) => r.value))
  const scaled = raw.map((r) => ({
    label: r.label,
    // Treat 0–1 scale as percentages
    value: maxV <= 1 ? r.value * 100 : r.value,
  }))

  const maxScaled = Math.max(...scaled.map((r) => r.value), 1)
  const denom = Math.max(100, maxScaled)

  return scaled.map((r) => ({
    label: r.label,
    value: Math.min(100, (r.value / denom) * 100),
  }))
}
