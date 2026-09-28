export const randInt = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))

export const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]

export function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Formats 7.5 as "7.5" and 12 as "12", rounding to 2 decimals. */
export const fmt = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100))

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
