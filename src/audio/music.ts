/**
 * Original background music for Polypet Paradise, synthesized live with the Web Audio API.
 * A cozy, slow loop in C major: warm pad, soft bell melody, plucked arpeggio, round bass, light shaker.
 * No audio files are downloaded; everything is generated in the browser.
 */

const BPM = 92
const STEP = 60 / BPM / 2 // one eighth note, in seconds
const STEPS_PER_BAR = 8

const NOTE: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 }
/** "E5" → frequency in Hz. */
function hz(name: string): number {
  const m = name.match(/^([A-G]#?)(\d)$/)!
  const midi = 12 * (+m[2] + 1) + NOTE[m[1]]
  return 440 * Math.pow(2, (midi - 69) / 12)
}

/** Chord per bar (root first), 16 bars: A section then B section. */
const CHORDS: string[][] = [
  ['C3', 'E3', 'G3'], ['A2', 'C3', 'E3'], ['F2', 'A2', 'C3'], ['G2', 'B2', 'D3'],
  ['C3', 'E3', 'G3'], ['A2', 'C3', 'E3'], ['D3', 'F3', 'A3'], ['G2', 'B2', 'D3'],
  ['F2', 'A2', 'C3'], ['G2', 'B2', 'D3'], ['E2', 'G2', 'B2'], ['A2', 'C3', 'E3'],
  ['F2', 'A2', 'C3'], ['G2', 'B2', 'D3'], ['C3', 'E3', 'G3'], ['C3', 'E3', 'G3'],
]

/** Melody per bar: [start step within bar, note, length in steps]. Original tune. */
const MELODY: [number, string, number][][] = [
  [[0, 'E5', 2], [2, 'G5', 2], [4, 'A5', 1], [5, 'G5', 1], [6, 'E5', 2]],
  [[0, 'C5', 3], [3, 'D5', 1], [4, 'E5', 4]],
  [[0, 'F5', 2], [2, 'A5', 2], [4, 'C6', 2], [6, 'A5', 2]],
  [[0, 'G5', 4], [4, 'D5', 3]],
  [[0, 'E5', 2], [2, 'G5', 2], [4, 'C6', 3], [7, 'B5', 1]],
  [[0, 'A5', 2], [2, 'G5', 2], [4, 'E5', 4]],
  [[0, 'F5', 2], [2, 'E5', 2], [4, 'D5', 2], [6, 'F5', 2]],
  [[0, 'E5', 3], [3, 'D5', 1], [4, 'D5', 4]],
  [[0, 'A5', 2], [2, 'C6', 2], [4, 'A5', 2], [6, 'G5', 2]],
  [[0, 'B5', 2], [2, 'D6', 2], [4, 'B5', 2], [6, 'G5', 2]],
  [[0, 'G5', 3], [3, 'E5', 1], [4, 'B4', 4]],
  [[0, 'C5', 2], [2, 'E5', 2], [4, 'A5', 4]],
  [[0, 'A5', 2], [2, 'G5', 1], [3, 'F5', 1], [4, 'E5', 2], [6, 'F5', 2]],
  [[0, 'G5', 2], [2, 'A5', 2], [4, 'B5', 2], [6, 'D6', 2]],
  [[0, 'C6', 6]],
  [[4, 'G5', 1], [5, 'E5', 1], [6, 'D5', 2]],
]
/** Arpeggio pattern over each chord: index into [root, third, fifth] plus octave shifts. */
const ARP: [number, number][] = [[0, 1], [2, 1], [1, 2], [2, 1], [0, 2], [2, 1], [1, 2], [2, 1]]

export const LOOP_STEPS = CHORDS.length * STEPS_PER_BAR
export const LOOP_SECONDS = LOOP_STEPS * STEP

interface Bus { ctx: BaseAudioContext; out: AudioNode; reverb: AudioNode; noise: AudioBuffer }

/** Builds the effects chain (gentle reverb) feeding `dest`. */
export function makeBus(ctx: BaseAudioContext, dest: AudioNode): Bus {
  const out = ctx.createGain()
  out.gain.value = 1
  const dry = ctx.createGain(); dry.gain.value = 0.8
  const wet = ctx.createGain(); wet.gain.value = 0.35
  const conv = ctx.createConvolver()
  const len = Math.floor(ctx.sampleRate * 2.4)
  const ir = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
  }
  conv.buffer = ir
  out.connect(dry).connect(dest)
  out.connect(conv).connect(wet).connect(dest)
  const noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate)
  const nd = noise.getChannelData(0)
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1
  return { ctx, out, reverb: conv, noise }
}

function env(g: GainNode, t: number, peak: number, attack: number, decayTo: number, decay: number, release: number, end: number) {
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + attack)
  g.gain.exponentialRampToValueAtTime(Math.max(decayTo, 0.0001), t + attack + decay)
  g.gain.setValueAtTime(Math.max(decayTo, 0.0001), end)
  g.gain.exponentialRampToValueAtTime(0.0001, end + release)
}

function bell(b: Bus, f: number, t: number, dur: number, vol: number) {
  const { ctx } = b
  const g = ctx.createGain()
  const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = f
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2.001
  const g2 = ctx.createGain(); g2.gain.value = 0.18
  const lfo = ctx.createOscillator(); lfo.frequency.value = 5.2
  const lfoG = ctx.createGain(); lfoG.gain.value = f * 0.004
  lfo.connect(lfoG).connect(o1.frequency)
  o1.connect(g); o2.connect(g2).connect(g); g.connect(b.out)
  env(g, t, vol, 0.012, vol * 0.45, 0.35, 0.35, t + dur)
  for (const o of [o1, o2, lfo]) { o.start(t); o.stop(t + dur + 0.5) }
}

function pluck(b: Bus, f: number, t: number, vol: number) {
  const { ctx } = b
  const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200
  const g = ctx.createGain()
  o.connect(lp).connect(g).connect(b.out)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55)
  o.start(t); o.stop(t + 0.6)
}

function pad(b: Bus, notes: string[], t: number, dur: number) {
  const { ctx } = b
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 800; lp.Q.value = 0.4
  const g = ctx.createGain()
  lp.connect(g).connect(b.out)
  env(g, t, 0.05, 0.6, 0.04, 0.5, 0.8, t + dur - 0.3)
  for (const n of notes) {
    for (const det of [-6, 6]) {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(n) * 2; o.detune.value = det
      o.connect(lp); o.start(t); o.stop(t + dur + 0.6)
    }
  }
}

function bass(b: Bus, f: number, t: number, dur: number) {
  const { ctx } = b
  const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f
  const g = ctx.createGain()
  o.connect(g).connect(b.out)
  env(g, t, 0.16, 0.02, 0.07, 0.5, 0.2, t + dur)
  o.start(t); o.stop(t + dur + 0.3)
}

function shaker(b: Bus, t: number, vol: number) {
  const { ctx } = b
  const s = ctx.createBufferSource(); s.buffer = b.noise
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000
  const g = ctx.createGain()
  s.connect(hp).connect(g).connect(b.out)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
  s.start(t); s.stop(t + 0.1)
}

/**
 * Schedules one eighth-note step of the song at time `t`.
 * `loop` counts full passes; the melody rests during the first half of every other pass so it never gets tiring.
 */
export function playStep(b: Bus, step: number, loop: number, t: number) {
  const bar = Math.floor(step / STEPS_PER_BAR) % CHORDS.length
  const s = step % STEPS_PER_BAR
  const chord = CHORDS[bar]
  if (s === 0) {
    pad(b, chord, t, STEP * STEPS_PER_BAR)
    bass(b, hz(chord[0]), t, STEP * 3)
  }
  if (s === 4) bass(b, hz(chord[2]), t, STEP * 3)
  const [idx, oct] = ARP[s]
  const base = chord[idx]
  const arpNote = base.slice(0, -1) + (+base.slice(-1) + oct)
  pluck(b, hz(arpNote), t, s % 2 ? 0.035 : 0.05)
  if (s % 2 === 1) shaker(b, t, bar >= 8 ? 0.03 : 0.018)
  const restMelody = loop % 2 === 1 && bar < 8
  if (!restMelody) {
    for (const [at, note, len] of MELODY[bar]) if (at === s) bell(b, hz(note), t, len * STEP * 0.95, 0.11)
  }
}

/** Plays the loop on a live AudioContext with a small look-ahead scheduler. */
export class MusicPlayer {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private bus: Bus | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private step = 0
  private nextTime = 0
  playing = false

  start() {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0
      this.master.connect(this.ctx.destination)
      this.bus = makeBus(this.ctx, this.master)
    }
    const ctx = this.ctx
    void ctx.resume()
    if (this.playing) return
    this.playing = true
    this.nextTime = ctx.currentTime + 0.1
    this.master!.gain.cancelScheduledValues(ctx.currentTime)
    this.master!.gain.setValueAtTime(this.master!.gain.value, ctx.currentTime)
    this.master!.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 2)
    this.timer = setInterval(() => this.tick(), 50)
  }

  stop() {
    if (!this.ctx || !this.playing) return
    this.playing = false
    const now = this.ctx.currentTime
    this.master!.gain.cancelScheduledValues(now)
    this.master!.gain.setValueAtTime(this.master!.gain.value, now)
    this.master!.gain.linearRampToValueAtTime(0, now + 0.6)
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  /** Pause audio processing entirely (e.g. when the tab is hidden). */
  suspend() { void this.ctx?.suspend() }
  resume() { if (this.playing) void this.ctx?.resume() }

  private tick() {
    const ctx = this.ctx!
    while (this.nextTime < ctx.currentTime + 0.25) {
      playStep(this.bus!, this.step % LOOP_STEPS, Math.floor(this.step / LOOP_STEPS), this.nextTime)
      this.step++
      this.nextTime += STEP
    }
  }
}

export const music = new MusicPlayer()
