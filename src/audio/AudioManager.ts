import { Howl, Howler, type HowlOptions } from 'howler';

export type SynthSoundType = 'hover' | 'click' | 'transition' | 'success' | 'boot' | 'tick';

export interface SoundAssetConfig {
  id: string;
  src: string | string[];
  volume?: number;
  loop?: boolean;
  rate?: number;
}

export interface AudioManagerOptions {
  persistKey?: string | null;
  defaultMuted?: boolean;
  defaultVolume?: number;
}

type AudioStateListener = () => void;

export interface AudioSnapshot {
  isMuted: boolean;
  masterVolume: number;
  isUnlocked: boolean;
}

const DEFAULT_PERSIST_KEY = 'creative-engine:audio-muted';

export class AudioManager {
  private static instance: AudioManager | null = null;

  private sounds = new Map<string, Howl>();
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private isMuted: boolean;
  private masterVolume: number;
  private isUnlocked = false;
  private persistKey: string | null;

  private listeners = new Set<AudioStateListener>();
  private snapshot: AudioSnapshot;
  private unlockBound = false;
  private lastSynthTime = new Map<SynthSoundType, number>();

  private constructor(options: AudioManagerOptions = {}) {
    this.persistKey = options.persistKey === undefined ? DEFAULT_PERSIST_KEY : options.persistKey;
    this.masterVolume = this.clamp(options.defaultVolume ?? 0.72, 0, 1);
    this.isMuted = this.readPersistedMute(options.defaultMuted ?? false);

    Howler.volume(this.masterVolume);
    Howler.mute(this.isMuted);

    this.snapshot = {
      isMuted: this.isMuted,
      masterVolume: this.masterVolume,
      isUnlocked: this.isUnlocked,
    };

    this.bindFirstInteractionUnlock();
  }

  public static getInstance(options?: AudioManagerOptions): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager(options);
    }
    return AudioManager.instance;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private readPersistedMute(fallback: boolean): boolean {
    if (!this.persistKey || typeof window === 'undefined') return fallback;
    try {
      const stored = window.localStorage.getItem(this.persistKey);
      if (stored === 'true') return true;
      if (stored === 'false') return false;
    } catch {
      // Ignore storage errors in restricted environments
    }
    return fallback;
  }

  private writePersistedMute(muted: boolean): void {
    if (!this.persistKey || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(this.persistKey, String(muted));
    } catch {
      // Ignore storage errors in restricted environments
    }
  }

  private emitChange(): void {
    this.snapshot = {
      isMuted: this.isMuted,
      masterVolume: this.masterVolume,
      isUnlocked: this.isUnlocked,
    };
    this.listeners.forEach((listener) => listener());
  }

  public subscribe = (listener: AudioStateListener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): AudioSnapshot => {
    return this.snapshot;
  };

  private ensureAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioCtx) {
      const AudioContextCtor =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextCtor) return null;

      this.audioCtx = new AudioContextCtor();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.connect(this.audioCtx.destination);
    }

    return this.audioCtx;
  }

  private bindFirstInteractionUnlock(): void {
    if (this.unlockBound || typeof window === 'undefined') return;
    this.unlockBound = true;

    const unlock = async () => {
      await this.unlockAudio();
      if (this.isUnlocked) {
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      }
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  public async unlockAudio(): Promise<void> {
    const ctx = this.ensureAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // Browser may still require a direct gesture
      }
    }

    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      try {
        await Howler.ctx.resume();
      } catch {
        // Ignore resume rejection
      }
    }

    if (!this.isUnlocked && (!ctx || ctx.state === 'running')) {
      this.isUnlocked = true;
      this.emitChange();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    if (this.isMuted === muted) return;
    this.isMuted = muted;
    Howler.mute(muted);

    if (this.audioCtx && this.masterGain) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.masterVolume, now, 0.015);
    }

    this.writePersistedMute(muted);
    this.emitChange();
  }

  public toggleMute(): boolean {
    void this.unlockAudio();
    const nextMuted = !this.isMuted;
    this.setMuted(nextMuted);
    if (!nextMuted) {
      this.playSynth('click', 0.85);
    }
    return nextMuted;
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public setMasterVolume(volume: number): void {
    const clamped = this.clamp(volume, 0, 1);
    this.masterVolume = clamped;
    Howler.volume(clamped);

    if (this.audioCtx && this.masterGain && !this.isMuted) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(clamped, now, 0.015);
    }

    this.emitChange();
  }

  private resolveSoundPaths(src: string | string[]): string[] {
    const list = Array.isArray(src) ? src : [src];
    return list.map((item) =>
      item.startsWith('/') || item.startsWith('http://') || item.startsWith('https://')
        ? item
        : `/sounds/${item}`,
    );
  }

  public preload(config: SoundAssetConfig, extraOptions?: Omit<HowlOptions, 'src'>): Howl {
    const existing = this.sounds.get(config.id);
    if (existing) return existing;

    const howl = new Howl({
      src: this.resolveSoundPaths(config.src),
      volume: config.volume ?? 1,
      loop: config.loop ?? false,
      rate: config.rate ?? 1,
      preload: true,
      ...extraOptions,
    });

    this.sounds.set(config.id, howl);
    return howl;
  }

  public preloadAll(configs: SoundAssetConfig[]): void {
    configs.forEach((config) => this.preload(config));
  }

  public play(id: string, options?: { volume?: number; rate?: number }): number | null {
    if (this.isMuted) return null;
    const sound = this.sounds.get(id);
    if (!sound) return null;

    void this.unlockAudio();
    const soundId = sound.play();

    if (options?.volume !== undefined) {
      sound.volume(this.clamp(options.volume, 0, 1), soundId);
    }
    if (options?.rate !== undefined) {
      sound.rate(options.rate, soundId);
    }

    return soundId;
  }

  public stop(id: string): void {
    this.sounds.get(id)?.stop();
  }

  public unload(id: string): void {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.unload();
      this.sounds.delete(id);
    }
  }

  public unloadAll(): void {
    this.sounds.forEach((sound) => sound.unload());
    this.sounds.clear();
  }

  /**
   * Native Web Audio API retrofuturistic procedural micro-synthesizer.
   * Respects masterGain, isMuted, AudioContext unlock, and per-type anti-spam cooldowns.
   */
  public playSynth(type: SynthSoundType, volumeScale = 1): void {
    if (this.isMuted) return;

    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const cooldowns: Record<SynthSoundType, number> = {
      hover: 45,
      tick: 38,
      click: 30,
      transition: 480,
      boot: 600,
      success: 180,
    };
    const prev = this.lastSynthTime.get(type) ?? 0;
    if (nowMs - prev < cooldowns[type]) return;
    this.lastSynthTime.set(type, nowMs);

    const ctx = this.ensureAudioContext();
    if (!ctx || !this.masterGain) return;

    if (ctx.state === 'suspended') {
      // Avoid queuing sounds before user gesture if triggered automatically by scroll/boot
      if (type === 'transition' || type === 'boot') return;
      void ctx.resume();
    }

    const now = ctx.currentTime;
    const scale = this.clamp(volumeScale, 0, 1);

    switch (type) {
      case 'hover': {
        // Crisp retro-digital micro chirp
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.028);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1600, now);
        filter.Q.value = 1.6;

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.045 * scale, now + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.036);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.042);
        break;
      }

      case 'tick': {
        // Subtle animation keyframe detent click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(1480, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.016);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.026 * scale, now + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.024);
        break;
      }

      case 'click': {
        // Dry analog relay mechanical snap
        const osc = ctx.createOscillator();
        const sub = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(115, now + 0.042);

        sub.type = 'triangle';
        sub.frequency.setValueAtTime(190, now);
        sub.frequency.exponentialRampToValueAtTime(68, now + 0.05);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now);
        filter.frequency.exponentialRampToValueAtTime(360, now + 0.05);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.11 * scale, now + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.058);

        osc.connect(filter);
        sub.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        sub.start(now);
        osc.stop(now + 0.064);
        sub.stop(now + 0.064);
        break;
      }

      case 'transition': {
        // Deep retrofuturistic synth sweep with resonant lowpass
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(110, now);
        osc1.frequency.exponentialRampToValueAtTime(220, now + 0.24);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(165, now);
        osc2.frequency.exponentialRampToValueAtTime(330, now + 0.24);

        filter.type = 'lowpass';
        filter.Q.value = 3.2;
        filter.frequency.setValueAtTime(260, now);
        filter.frequency.exponentialRampToValueAtTime(1850, now + 0.16);
        filter.frequency.exponentialRampToValueAtTime(340, now + 0.28);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.065 * scale, now + 0.045);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.29);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.31);
        osc2.stop(now + 0.31);
        break;
      }

      case 'boot': {
        // Compact retro synth power-on chord (A3 -> E4 -> A4)
        const chord = [220, 329.63, 440];
        chord.forEach((freq, idx) => {
          const start = now + idx * 0.055;
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq * 0.96, start);
          osc.frequency.exponentialRampToValueAtTime(freq, start + 0.08);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1900, start);

          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.linearRampToValueAtTime(0.06 * scale, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(start);
          osc.stop(start + 0.34);
        });
        break;
      }

      case 'success': {
        // Neon 3-note ascending synth arpeggio (D5 -> A5 -> D6)
        const notes = [587.33, 880, 1174.66];
        notes.forEach((freq, idx) => {
          const start = now + idx * 0.055;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.linearRampToValueAtTime(0.085 * scale, start + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.21);

          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(start);
          osc.stop(start + 0.23);
        });
        break;
      }
    }
  }
}

export const audioManager = AudioManager.getInstance();
