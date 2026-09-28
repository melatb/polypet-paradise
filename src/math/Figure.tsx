import type { FigureSpec, MiniShape, Pt } from './types'

export const INK = '#1E2A4A'
export const HELP = '#E0287D'
export const SHAPE = '#FFD1E6'
export const SHAPE2 = '#CDEBFF'

const U = 30
const PAD = 26

export function figureScale(spec: Pick<FigureSpec, 'x0' | 'y1'>) {
  return {
    X: (x: number) => PAD + (x - spec.x0) * U,
    Y: (y: number) => PAD + (spec.y1 - y) * U,
  }
}

export function Figure({ spec }: { spec: FigureSpec }) {
  const { x0, x1, y0, y1 } = spec
  const { X, Y } = figureScale(spec)
  const W = (x1 - x0) * U + PAD * 2
  const H = (y1 - y0) * U + PAD * 2
  const pts = (p: Pt[]) => p.map((q) => `${X(q[0]).toFixed(1)},${Y(q[1]).toFixed(1)}`).join(' ')
  const gx: number[] = []
  const gy: number[] = []
  if (spec.grid) {
    for (let x = Math.ceil(x0); x <= x1; x++) gx.push(x)
    for (let y = Math.ceil(y0); y <= y1; y++) gy.push(y)
  }
  return (
    <svg className="figsvg" viewBox={`0 0 ${W} ${H}`} width={Math.max(W, Math.min(360, W * 1.8))} role="img" aria-label={spec.alt}>
      {spec.grid && (
        <g stroke="#CFE3F3" strokeWidth={1.2}>
          {gx.map((x) => <line key={'x' + x} x1={X(x)} y1={Y(y0)} x2={X(x)} y2={Y(y1)} />)}
          {gy.map((y) => <line key={'y' + y} x1={X(x0)} y1={Y(y)} x2={X(x1)} y2={Y(y)} />)}
        </g>
      )}
      {spec.polys?.map((p, i) => (
        <polygon key={'p' + i} points={pts(p.pts)} fill={p.fill ?? SHAPE} stroke={p.stroke ?? INK}
          strokeWidth={p.sw ?? 3} strokeLinejoin="round" strokeDasharray={p.dash ? '7 6' : undefined} />
      ))}
      {spec.segs?.map((g, i) => (
        <line key={'s' + i} x1={X(g.a[0])} y1={Y(g.a[1])} x2={X(g.b[0])} y2={Y(g.b[1])} stroke={g.color ?? HELP}
          strokeWidth={3} strokeDasharray={g.solid ? undefined : '7 6'} strokeLinecap="round" />
      ))}
      {spec.marks?.map((m, i) => {
        const k = 0.38
        const a: Pt = [m.p[0] + m.dx[0] * k, m.p[1] + m.dx[1] * k]
        const b: Pt = [a[0] + m.dy[0] * k, a[1] + m.dy[1] * k]
        const d: Pt = [m.p[0] + m.dy[0] * k, m.p[1] + m.dy[1] * k]
        return <polyline key={'m' + i} points={pts([a, b, d])} fill="none" stroke={m.color ?? INK} strokeWidth={2.2} />
      })}
      {spec.labels?.map((l, i) => (
        <text key={'l' + i} x={X(l.x)} y={Y(l.y)} textAnchor="middle" dominantBaseline="middle" className="flabel"
          fill={l.color ?? INK} paintOrder="stroke" stroke="#fff" strokeWidth={5} strokeLinejoin="round">{l.t}</text>
      ))}
    </svg>
  )
}

export function Mini({ shape }: { shape: MiniShape }) {
  let body
  switch (shape.kind) {
    case 'polygon':
      body = <polygon points={shape.pts.map((p) => p.join(',')).join(' ')} fill={SHAPE} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      break
    case 'curve':
      body = <path d="M22 18 L22 74 Q84 74 76 44 Q70 18 22 18Z" fill={SHAPE2} stroke={INK} strokeWidth={3} />
      break
    case 'open':
      body = <polyline points="18,72 28,20 66,26 74,72" fill="none" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      break
    case 'bowtie':
      body = <polygon points="18,20 72,72 72,20 18,72" fill={SHAPE2} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      break
    default:
      body = <circle cx={45} cy={46} r={28} fill={SHAPE2} stroke={INK} strokeWidth={3} />
  }
  return <svg viewBox="0 0 90 92" role="img" aria-label={shape.kind === 'polygon' ? 'polygon' : shape.kind}>{body}</svg>
}
