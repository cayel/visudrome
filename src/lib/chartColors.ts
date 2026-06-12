function parseHexColor(hex: string): [number, number, number] | null {
  const normalized = hex.trim().replace('#', '')
  if (normalized.length !== 6) return null

  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)

  if ([r, g, b].some((value) => Number.isNaN(value))) return null
  return [r, g, b]
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) =>
    Math.round(Math.min(255, Math.max(0, value)))
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function mixColors(
  base: [number, number, number],
  target: [number, number, number],
  ratio: number,
): string {
  const weight = Math.min(1, Math.max(0, ratio))
  return rgbToHex(
    base[0] + (target[0] - base[0]) * weight,
    base[1] + (target[1] - base[1]) * weight,
    base[2] + (target[2] - base[2]) * weight,
  )
}

export function getDecadeBarColor(baseColor: string, index: number, total: number): string {
  const baseRgb = parseHexColor(baseColor)
  if (!baseRgb || total <= 1) return baseColor

  const position = index / (total - 1)
  const lighter: [number, number, number] = [114, 137, 194]
  const darker: [number, number, number] = [61, 82, 136]

  if (position <= 0.5) {
    return mixColors(baseRgb, lighter, position * 2)
  }

  return mixColors(baseRgb, darker, (position - 0.5) * 2)
}
