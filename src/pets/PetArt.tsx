import { useId, type ReactNode } from 'react'
import { EGGS, type EggId } from '../game/catalog'
import type { Look, PaintId, Species, Stage } from '../game/types'

const O = '#1E2A4A'
type P = [number, number]

export function bodyPoints(shape: Species['shape']): P[] {
  if (shape === 'tri') return [[100, 38], [172, 168], [28, 168]]
  if (shape === 'square') return [[42, 58], [158, 58], [158, 168], [42, 168]]
  if (shape === 'rhombus') return [[100, 40], [168, 108], [100, 176], [32, 108]]
  if (shape === 'para') return [[68, 60], [172, 60], [132, 168], [28, 168]]
  if (shape === 'trap') return [[66, 70], [134, 70], [172, 168], [28, 168]]
  const n = shape
  return Array.from({ length: n }, (_, k) => {
    const a = Math.PI / 2 + Math.PI / n + (2 * Math.PI * k) / n
    return [100 + 68 * Math.cos(a), 110 + 68 * Math.sin(a)] as P
  })
}
const pp = (pts: P[]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
const mx = (pts: P[]): P[] => pts.map(([x, y]) => [200 - x, y])

function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')
}

interface Paint { fill: string; dark: string; grad?: [string, string]; galactic?: boolean }
export function resolvePaint(sp: Species, paint: PaintId): Paint {
  switch (paint) {
    case 'pastel': return { fill: mix(sp.color, '#ffffff', 0.45), dark: mix(sp.dark, '#ffffff', 0.25) }
    case 'ocean': return { fill: '#5EC8F2', dark: '#2466C9', grad: ['#8FE3FF', '#3B8BFF'] }
    case 'sunset': return { fill: '#FF9F5A', dark: '#D23C7E', grad: ['#FFD23F', '#FF5FA8'] }
    case 'galactic': return { fill: '#6CFFB8', dark: '#7A2FE0', grad: ['#6CFFB8', '#B05CFF'], galactic: true }
    default: return { fill: sp.color, dark: sp.dark }
  }
}

function Poly({ pts, fill, sw = 4 }: { pts: P[]; fill: string; sw?: number }) {
  return <polygon points={pp(pts)} fill={fill} stroke={O} strokeWidth={sw} strokeLinejoin="round" />
}

export interface PetArtProps {
  species: Species
  stage: Stage
  look: Look
  /** Blinking, tail wags and sparkles. Off for small list icons. */
  animated?: boolean
  className?: string
}

export function PetArt({ species: sp, stage, look, animated = false, className }: PetArtProps) {
  const rawId = useId()
  const gid = 'g' + rawId.replace(/[^a-zA-Z0-9_-]/g, '')
  const paint = resolvePaint(sp, look.paint)
  const c = paint.grad ? `url(#${gid})` : paint.fill
  const d = paint.dark
  const pts = bodyPoints(sp.shape)
  const top = Math.min(...pts.map((p) => p[1]))
  const bot = Math.max(...pts.map((p) => p[1]))
  const fy = sp.shape === 'tri' ? 128 : sp.shape === 'rhombus' ? 106 : 112

  let back: ReactNode = null
  let front: ReactNode = null
  let mouth = true
  let eyeR = 11

  switch (sp.kind) {
    case 'pup':
      front = <>
        <g className="pet-ear-l"><ellipse cx={46} cy={fy - 6} rx={14} ry={28} fill={d} stroke={O} strokeWidth={4} transform={`rotate(18 46 ${fy - 6})`} /></g>
        <g className="pet-ear-r"><ellipse cx={154} cy={fy - 6} rx={14} ry={28} fill={d} stroke={O} strokeWidth={4} transform={`rotate(-18 154 ${fy - 6})`} /></g>
        <ellipse cx={100} cy={fy + 8} rx={7} ry={5} fill={O} />
      </>
      break
    case 'cat': {
      const e: P[] = [[48, top + 22], [56, top - 26], [90, top + 6]]
      const inner: P[] = [[57, top + 10], [60, top - 10], [76, top + 6]]
      back = <><Poly pts={e} fill={c} /><Poly pts={mx(e)} fill={c} /><Poly pts={inner} fill="#FFB3CF" sw={0} /><Poly pts={mx(inner)} fill="#FFB3CF" sw={0} /></>
      front = (
        <g stroke={O} strokeWidth={2.5} strokeLinecap="round">
          <line x1={52} y1={fy + 12} x2={30} y2={fy + 8} /><line x1={52} y1={fy + 18} x2={30} y2={fy + 22} />
          <line x1={148} y1={fy + 12} x2={170} y2={fy + 8} /><line x1={148} y1={fy + 18} x2={170} y2={fy + 22} />
        </g>
      )
      break
    }
    case 'bunny':
      back = <>
        <g className="pet-ear-l"><ellipse cx={80} cy={top - 18} rx={14} ry={36} fill={c} stroke={O} strokeWidth={4} transform={`rotate(-12 80 ${top - 18})`} />
          <ellipse cx={80} cy={top - 18} rx={6} ry={24} fill="#fff" transform={`rotate(-12 80 ${top - 18})`} /></g>
        <g className="pet-ear-r"><ellipse cx={120} cy={top - 18} rx={14} ry={36} fill={c} stroke={O} strokeWidth={4} transform={`rotate(12 120 ${top - 18})`} />
          <ellipse cx={120} cy={top - 18} rx={6} ry={24} fill="#fff" transform={`rotate(12 120 ${top - 18})`} /></g>
      </>
      break
    case 'fox':
      back = <>
        <g className="pet-tail"><Poly pts={[[140, 150], [198, 96], [192, 150], [160, 172]]} fill={c} /><Poly pts={[[186, 110], [198, 96], [196, 124]]} fill="#fff" sw={3} /></g>
        <Poly pts={[[76, top + 14], [88, top - 30], [114, top + 4]]} fill={c} />
        <Poly pts={[[124, top + 4], [150, top - 30], [160, top + 14]]} fill={c} />
      </>
      front = <>
        <ellipse cx={100} cy={fy + 14} rx={28} ry={17} fill="#fff" stroke={O} strokeWidth={3} />
        <ellipse cx={100} cy={fy + 7} rx={6} ry={4.5} fill={O} />
      </>
      break
    case 'penguin':
      back = <>
        <g className="pet-wing-l"><ellipse cx={38} cy={fy + 22} rx={14} ry={30} fill={d} stroke={O} strokeWidth={4} transform={`rotate(25 38 ${fy + 22})`} /></g>
        <g className="pet-wing-r"><ellipse cx={162} cy={fy + 22} rx={14} ry={30} fill={d} stroke={O} strokeWidth={4} transform={`rotate(-25 162 ${fy + 22})`} /></g>
      </>
      front = <ellipse cx={100} cy={fy + 26} rx={40} ry={34} fill="#fff" />
      mouth = false
      break
    case 'turtle':
      back = <circle cx={100} cy={top - 14} r={24} fill="#9BE39A" stroke={O} strokeWidth={4} />
      front = <>{([[64, 150], [100, 146], [136, 150]] as P[]).map(([x, y], i) => (
        <Poly key={i} sw={3} fill="rgba(255,255,255,.45)"
          pts={Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 6 + (k * Math.PI) / 3; return [x + 11 * Math.cos(a), y + 11 * Math.sin(a)] as P })} />
      ))}</>
      break
    case 'owl': {
      const tuft: P[] = [[50, top + 34], [46, top - 18], [84, top + 10]]
      back = <><Poly pts={tuft} fill={d} /><Poly pts={mx(tuft)} fill={d} /></>
      front = <ellipse cx={100} cy={fy + 44} rx={32} ry={18} fill="rgba(255,255,255,.55)" />
      eyeR = 14
      mouth = false
      break
    }
    case 'unicorn':
      back = <>
        <circle cx={44} cy={84} r={17} fill="#FF9CCB" stroke={O} strokeWidth={3} />
        <circle cx={36} cy={112} r={16} fill="#C7A6FF" stroke={O} strokeWidth={3} />
        <circle cx={44} cy={140} r={15} fill="#9FE0FF" stroke={O} strokeWidth={3} />
        <Poly pts={[[60, top + 24], [66, top - 10], [86, top + 12]]} fill={c} />
      </>
      front = look.hat === 'none' || look.hat === 'headphones' ? <>
        <Poly pts={[[90, top + 10], [100, top - 42], [110, top + 10]]} fill="#FFD23F" />
        <g stroke="#C98F00" strokeWidth={2.5}><line x1={93} y1={top - 4} x2={107} y2={top - 10} /><line x1={96} y1={top - 18} x2={105} y2={top - 23} /></g>
      </> : null
      break
    case 'dragon': {
      const w: P[] = [[48, 100], [0, 54], [14, 102], [-4, 128], [40, 146]]
      const horn: P[] = [[64, top + 16], [58, top - 24], [86, top + 6]]
      back = <><g className="pet-wing-l"><Poly pts={w} fill={d} /></g><g className="pet-wing-r"><Poly pts={mx(w)} fill={d} /></g><Poly pts={horn} fill="#FFD23F" /><Poly pts={mx(horn)} fill="#FFD23F" /></>
      front = <ellipse cx={100} cy={fy + 42} rx={30} ry={16} fill="rgba(255,255,255,.4)" />
      break
    }
    case 'phoenix': {
      const w: P[] = [[46, 110], [2, 76], [22, 116], [-2, 140], [44, 152]]
      const crest: P[] = [[82, top + 12], [76, top - 30], [96, top + 4]]
      back = <>
        <g className="pet-wing-l"><Poly pts={w} fill="#FFB020" /></g><g className="pet-wing-r"><Poly pts={mx(w)} fill="#FFB020" /></g>
        <Poly pts={crest} fill="#FFD23F" /><Poly pts={[[92, top + 6], [100, top - 44], [108, top + 6]]} fill="#FF8A1F" /><Poly pts={mx(crest)} fill="#FFD23F" />
      </>
      mouth = false
      break
    }
  }

  const beak = sp.kind === 'penguin' || sp.kind === 'owl' || sp.kind === 'phoenix'
  const feetC = sp.kind === 'penguin' ? '#FFB020' : d
  const ny = Math.min(fy + 36, bot - 16)
  const full = stage >= 4

  return (
    <svg viewBox="-12 -56 224 244" role="img" aria-label={sp.name} className={[className, paint.galactic ? 'galactic' : '', animated ? 'pet-anim' : ''].join(' ')}>
      {paint.grad && (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor={paint.grad[0]} /><stop offset="1" stopColor={paint.grad[1]} />
          </linearGradient>
        </defs>
      )}
      {full && <polygon points={pp(pts)} fill="none" stroke="#FFE45C" strokeWidth={16} strokeLinejoin="round" opacity={0.8} className="pet-aura" />}
      {back}
      <ellipse cx={72} cy={bot} rx={17} ry={9} fill={feetC} stroke={O} strokeWidth={4} />
      <ellipse cx={128} cy={bot} rx={17} ry={9} fill={feetC} stroke={O} strokeWidth={4} />
      <polygon points={pp(pts)} fill={c} stroke={O} strokeWidth={5} strokeLinejoin="round" />
      {front}
      <g className="pet-eyes">
        {[-22, 22].map((dx) => (
          <g key={dx}>
            <circle cx={100 + dx} cy={fy} r={eyeR} fill="#fff" stroke={O} strokeWidth={3} />
            <circle cx={100 + dx + 1} cy={fy + 1} r={eyeR * 0.58} fill={O} />
            <circle cx={100 + dx + 3.5} cy={fy - 2.5} r={eyeR * 0.24} fill="#fff" />
          </g>
        ))}
      </g>
      <ellipse cx={62} cy={fy + 15} rx={9} ry={5} fill="#FF7FB0" opacity={0.7} />
      <ellipse cx={138} cy={fy + 15} rx={9} ry={5} fill="#FF7FB0" opacity={0.7} />
      {beak && <Poly pts={[[92, fy + 10], [108, fy + 10], [100, fy + 22]]} fill="#FFB020" sw={3} />}
      {mouth && <path d={`M90 ${fy + 16} q5 6 10 0 q5 6 10 0`} fill="none" stroke={O} strokeWidth={3} strokeLinecap="round" />}
      <Neck id={look.neck} y={ny} />
      <Hat id={look.hat} top={top} fy={fy} />
      {full && (
        <g fill="#FFD23F" stroke={O} strokeWidth={2} className="pet-sparkles">
          {([[18, 40], [182, 30], [8, 150], [190, 160]] as P[]).map(([x, y], i) => (
            <path key={i} style={{ animationDelay: `${i * 0.4}s` }}
              d={`M${x} ${y - 12} L${x + 4} ${y - 4} L${x + 12} ${y} L${x + 4} ${y + 4} L${x} ${y + 12} L${x - 4} ${y + 4} L${x - 12} ${y} L${x - 4} ${y - 4}Z`} />
          ))}
        </g>
      )}
    </svg>
  )
}

function Hat({ id, top, fy }: { id: Look['hat']; top: number; fy: number }) {
  if (id === 'cap') return (
    <g>
      <path d={`M66 ${top + 6} Q100 ${top - 42} 134 ${top + 6} Z`} fill="#FF5A5A" stroke={O} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M120 ${top + 4} q36 -2 46 9 q-24 6 -46 -1Z`} fill="#D93636" stroke={O} strokeWidth={4} strokeLinejoin="round" />
      <circle cx={100} cy={top - 17} r={5} fill="#FFD23F" stroke={O} strokeWidth={2.5} />
    </g>
  )
  if (id === 'headphones') return (
    <g>
      <path d={`M38 ${fy - 4} C38 ${top - 46} 162 ${top - 46} 162 ${fy - 4}`} fill="none" stroke={O} strokeWidth={11} strokeLinecap="round" />
      <path d={`M38 ${fy - 4} C38 ${top - 46} 162 ${top - 46} 162 ${fy - 4}`} fill="none" stroke="#FF5FA8" strokeWidth={5} strokeLinecap="round" />
      <rect x={24} y={fy - 22} width={24} height={34} rx={9} fill="#FF5FA8" stroke={O} strokeWidth={4} />
      <rect x={152} y={fy - 22} width={24} height={34} rx={9} fill="#FF5FA8" stroke={O} strokeWidth={4} />
    </g>
  )
  if (id === 'crown') return (
    <g>
      <polygon points={pp([[68, top + 8], [68, top - 24], [83, top - 8], [100, top - 34], [117, top - 8], [132, top - 24], [132, top + 8]])}
        fill="#FFD23F" stroke={O} strokeWidth={4} strokeLinejoin="round" />
      <circle cx={100} cy={top - 4} r={5} fill="#FF5FA8" stroke={O} strokeWidth={2} />
      <circle cx={81} cy={top} r={4} fill="#3B8BFF" stroke={O} strokeWidth={2} />
      <circle cx={119} cy={top} r={4} fill="#4FD6A5" stroke={O} strokeWidth={2} />
    </g>
  )
  return null
}

function Neck({ id, y }: { id: Look['neck']; y: number }) {
  if (id === 'bib') return (
    <g>
      <path d={`M76 ${y - 6} Q100 ${y + 28} 124 ${y - 6} Z`} fill="#fff" stroke={O} strokeWidth={3} strokeLinejoin="round" />
      <path d={`M100 ${y + 9} l-5 -5 a3 3 0 0 1 5 -3 a3 3 0 0 1 5 3z`} fill="#FF7FB0" />
    </g>
  )
  if (id === 'bowtie') return (
    <g>
      <Poly pts={[[100, y], [76, y - 12], [76, y + 12]]} fill="#FF5FA8" sw={3} />
      <Poly pts={[[100, y], [124, y - 12], [124, y + 12]]} fill="#FF5FA8" sw={3} />
      <rect x={93} y={y - 7} width={14} height={14} rx={3} fill="#FFD23F" stroke={O} strokeWidth={3} />
    </g>
  )
  return null
}

/* ---------- Eggs ---------- */

export function EggShape({ egg }: { egg: EggId }) {
  const E = EGGS[egg]
  const spots: [number, number, 'tri' | 'sq' | 'pent' | 'hex' | 'star'][] =
    E.spots === 'tri' ? [[70, 80, 'tri'], [128, 120, 'tri'], [84, 160, 'sq'], [132, 62, 'sq']]
      : E.spots === 'mixed' ? [[70, 80, 'pent'], [128, 118, 'tri'], [86, 158, 'hex'], [130, 64, 'sq']]
        : [[70, 86, 'star'], [130, 120, 'star'], [90, 160, 'star'], [128, 60, 'star']]
  const shape = (x: number, y: number, t: string): P[] => {
    if (t === 'tri') return [[x, y - 12], [x + 13, y + 10], [x - 13, y + 10]]
    if (t === 'sq') return [[x - 10, y - 10], [x + 10, y - 10], [x + 10, y + 10], [x - 10, y + 10]]
    if (t === 'star') return Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 6 : 14; return [x + r * Math.cos(a), y + r * Math.sin(a)] as P })
    const n = t === 'pent' ? 5 : 6
    return Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [x + 13 * Math.cos(a), y + 13 * Math.sin(a)] as P })
  }
  return (
    <g>
      <path d="M100 22 C148 22 170 104 170 134 C170 176 138 198 100 198 C62 198 30 176 30 134 C30 104 52 22 100 22Z" fill={E.color} stroke={O} strokeWidth={5} />
      {spots.map(([x, y, t], i) => <polygon key={i} points={pp(shape(x, y, t))} fill={E.spot} stroke={O} strokeWidth={2.5} strokeLinejoin="round" />)}
      <ellipse cx={70} cy={60} rx={9} ry={16} fill="#fff" opacity={0.6} transform="rotate(20 70 60)" />
    </g>
  )
}

export function EggArt({ egg }: { egg: EggId }) {
  return <svg viewBox="20 10 160 200" role="img" aria-label={EGGS[egg].name}><EggShape egg={egg} /></svg>
}
