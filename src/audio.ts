import type { SoundEvent } from './game/sounds';

/** The classic four-note descending bass loop (A1, G#1, G1, F#1), in Hz. */
export const MARCH_NOTES = [55, 51.91, 49, 46.25] as const;

/** Web Audio synth for the game's sound effects. All sounds are generated, no asset files. */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private marchIndex = 0;
  muted = false;

  /** Creates/resumes the AudioContext. Must be called from a user gesture. */
  unlock(): void {
    if (typeof AudioContext === 'undefined') return;
    this.ctx ??= new AudioContext();
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  play(events: readonly SoundEvent[]): void {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    for (const e of events) this.playOne(this.ctx, e);
  }

  private playOne(ctx: AudioContext, event: SoundEvent): void {
    switch (event) {
      case 'march': {
        const note = MARCH_NOTES[this.marchIndex++ % MARCH_NOTES.length] ?? 55;
        this.tone(ctx, note, 0.12, 'square', 0.25);
        break;
      }
      case 'shoot':
        this.tone(ctx, 1100, 0.15, 'square', 0.12, 180);
        break;
      case 'invaderKilled':
        this.noise(ctx, 0.18, 0.25);
        this.tone(ctx, 300, 0.18, 'sawtooth', 0.1, 60);
        break;
      case 'playerHit':
        this.noise(ctx, 0.7, 0.4);
        this.tone(ctx, 160, 0.7, 'sawtooth', 0.2, 30);
        break;
      case 'levelUp':
        [440, 554, 659, 880].forEach((f, i) =>
          this.tone(ctx, f, 0.12, 'square', 0.12, undefined, i * 0.1),
        );
        break;
      case 'gameOver':
        [330, 277, 220, 165].forEach((f, i) =>
          this.tone(ctx, f, 0.3, 'square', 0.15, undefined, i * 0.3),
        );
        break;
    }
  }

  private tone(
    ctx: AudioContext,
    freq: number,
    duration: number,
    type: OscillatorType,
    gain: number,
    endFreq?: number,
    delay = 0,
  ): void {
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  }

  private noise(ctx: AudioContext, duration: number, gain: number): void {
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    src.buffer = buffer;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    src.connect(g).connect(ctx.destination);
    src.start();
  }
}
