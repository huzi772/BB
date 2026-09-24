import config from '../config';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    this.sfxBuffers = new Map();
    this.missingKeys = new Set();
    this.warnedKeys = new Set();

    this.musicAudio = null;
    this.musicSourceNode = null;
    this.musicVolume = 0.35;

    this.initialized = false;
    this.isTabHidden = false;

    // Bind visibility handler
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }
  }

  /**
   * Initializes the AudioContext synchronously on user gesture.
   */
  init() {
    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(1, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.initialized = true;

      // Asynchronously load sound effects and music setup
      this.loadAllAudio();
    } catch (err) {
      console.warn('Web Audio API not supported or initialization failed:', err);
    }
  }

  /**
   * Loads all audio defined in config.audio asynchronously.
   */
  async loadAllAudio() {
    if (!this.initialized || !config.audio) return;

    for (const [key, path] of Object.entries(config.audio)) {
      if (key === 'background-music') {
        this.setupBackgroundMusic(path);
      } else {
        this.loadSfx(key, path);
      }
    }
  }

  /**
   * Sets up HTMLAudioElement streaming for background music.
   */
  setupBackgroundMusic(path) {
    try {
      this.musicAudio = new Audio();
      this.musicAudio.crossOrigin = 'anonymous';
      this.musicAudio.src = path;
      this.musicAudio.loop = true;

      if (this.ctx && !this.musicSourceNode) {
        this.musicSourceNode = this.ctx.createMediaElementSource(this.musicAudio);
        this.musicSourceNode.connect(this.musicGain);
      }
    } catch (err) {
      this.markMissing('background-music', err);
    }
  }

  /**
   * Loads and decodes short SFX files into AudioBuffers.
   */
  async loadSfx(key, path) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        this.markMissing(key, `HTTP status ${response.status}`);
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        // Vite returns index.html (200 OK) for missing static assets
        this.markMissing(key, 'Received HTML response instead of audio file');
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      if (!this.ctx) return;

      const audioBuffer = await new Promise((resolve, reject) => {
        this.ctx.decodeAudioData(arrayBuffer, resolve, reject);
      });

      this.sfxBuffers.set(key, audioBuffer);
    } catch (err) {
      this.markMissing(key, err);
    }
  }

  markMissing(key, reason) {
    this.missingKeys.add(key);
    if (!this.warnedKeys.has(key)) {
      this.warnedKeys.add(key);
      console.warn(`[AudioManager] Audio asset "${key}" unavailable (${reason}). Operating silently.`);
    }
  }

  /**
   * Plays a decoded sound effect.
   */
  playSound(key, options = {}) {
    return this.play(key, options);
  }

  play(key, options = {}) {
    const { volume = 1, loop = false } = options;

    if (!this.initialized || !this.ctx || this.missingKeys.has(key)) return;

    const buffer = this.sfxBuffers.get(key);
    if (!buffer) return;

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = loop;

      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);

      source.connect(gainNode);
      gainNode.connect(this.sfxGain);

      source.start(0);
      return source;
    } catch (err) {
      console.warn(`[AudioManager] Error playing SFX "${key}":`, err);
    }
  }

  /**
   * Plays background music.
   */
  playMusic() {
    if (!this.initialized || !this.musicAudio || this.missingKeys.has('background-music')) return;

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    this.musicAudio.play().catch((err) => {
      this.markMissing('background-music', err.message || 'Autoplay restricted');
    });
  }

  /**
   * Stops background music.
   */
  stopMusic() {
    if (this.musicAudio) {
      this.musicAudio.pause();
      this.musicAudio.currentTime = 0;
    }
  }

  /**
   * Smoothly fades background music volume in.
   */
  fadeIn(duration = 3, targetVolume = 0.35) {
    if (!this.initialized || !this.ctx || !this.musicGain) return;
    this.playMusic();

    this.musicVolume = targetVolume;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(0.0001, now);
    this.musicGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetVolume), now + duration);
  }

  /**
   * Smoothly fades background music volume out.
   */
  fadeOut(duration = 1.5) {
    if (!this.initialized || !this.ctx || !this.musicGain) return;

    const now = this.ctx.currentTime;
    const currentGain = Math.max(0.0001, this.musicGain.gain.value);
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(currentGain, now);
    this.musicGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    setTimeout(() => {
      if (this.musicGain && this.musicGain.gain.value <= 0.001) {
        this.stopMusic();
      }
    }, duration * 1000);
  }

  setMusicVolume(volume) {
    this.musicVolume = volume;
    if (this.initialized && this.ctx && this.musicGain) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(volume, now);
    }
  }

  duck(volume = 0.1, duration = 0.5) {
    if (!this.initialized || !this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.linearRampToValueAtTime(volume, now + duration);
  }

  unduck(duration = 0.5) {
    if (arguments.length > 1 && typeof arguments[1] === 'number') {
      duration = arguments[1];
    }
    if (!this.initialized || !this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.linearRampToValueAtTime(this.musicVolume, now + duration);
  }

  handleVisibilityChange() {
    if (!this.initialized || !this.ctx) return;

    if (document.hidden) {
      this.isTabHidden = true;
      if (this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      }
    } else {
      this.isTabHidden = false;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }
  }
}

export const audioManager = new AudioManager();
export default audioManager;
