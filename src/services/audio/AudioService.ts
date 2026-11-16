import { Song, RepeatMode, PlaybackState, EqualizerBands } from '../../types';
import { AudioEventEmitter } from './AudioEvents';
import { AudioQueue } from './AudioQueue';
import { AndroidAudioService } from '../platform/AndroidAudioService';
import { IOSAudioService } from '../platform/IOSAudioService';
import { DatabaseService } from '../../database/db';

export const EQUALIZER_PRESETS: Record<string, EqualizerBands> = {
  'Normal': { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0 },
  'Bass Boost': { bass: 7, lowMid: 4, mid: 0, highMid: -1, treble: 1 },
  'Vocal': { bass: -2, lowMid: 1, mid: 5, highMid: 4, treble: 1 },
  'Rock': { bass: 5, lowMid: 3, mid: -1, highMid: 3, treble: 6 },
  'Classical': { bass: 4, lowMid: 2, mid: 0, highMid: 3, treble: 4 },
  'Electronic': { bass: 6, lowMid: 4, mid: 1, highMid: 3, treble: 5 },
};

export class AudioService {
  private static instance: AudioService;
  public events = new AudioEventEmitter();
  public queue = new AudioQueue();

  private audioEl: HTMLAudioElement;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];

  private isPlaying = false;
  private isBuffering = false;
  private currentSong: Song | null = null;
  private volume = 0.85;
  private playbackRate = 1.0;
  private currentPreset = 'Normal';
  private currentBands: EqualizerBands = { ...EQUALIZER_PRESETS['Normal'] };

  private activeBlobUrl: string | null = null;
  private loadSequence = 0;

  // Synth fallback state (used cleanly when offline without cached audio or when remote stream is blocked)
  private isSynthMode = false;
  private synthPosition = 0;
  private synthInterval: number | null = null;
  private synthNoteStep = 0;
  private synthLastNoteMs = 0;

  // Audio ducking state
  private preDuckVolume: number | null = null;
  private duckTimer: number | null = null;

  private constructor() {
    this.audioEl = new Audio();
    this.audioEl.preload = 'auto';
    this.audioEl.crossOrigin = 'anonymous';
    this.audioEl.volume = this.volume;

    this.setupAudioListeners();
    this.setupPlatformBridges();
  }

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private initWebAudio(): void {
    if (this.audioCtx) return;

    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      this.audioCtx = new AudioCtxClass();
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audioEl);

      const freqs = [60, 230, 910, 3600, 14000];
      const types: BiquadFilterType[] = ['lowshelf', 'peaking', 'peaking', 'peaking', 'highshelf'];
      const bandValues = [
        this.currentBands.bass,
        this.currentBands.lowMid,
        this.currentBands.mid,
        this.currentBands.highMid,
        this.currentBands.treble,
      ];

      this.eqFilters = freqs.map((f, i) => {
        const filter = this.audioCtx!.createBiquadFilter();
        filter.type = types[i];
        filter.frequency.value = f;
        filter.gain.value = bandValues[i] ?? 0;
        return filter;
      });

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = this.volume;

      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.analyserNode.smoothingTimeConstant = 0.8;

      let lastNode: AudioNode = this.sourceNode;
      for (const filter of this.eqFilters) {
        lastNode.connect(filter);
        lastNode = filter;
      }
      lastNode.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);
    } catch (e) {
      console.warn('Web Audio API initialized in fallback direct mode:', e);
    }
  }

  private setupAudioListeners(): void {
    this.audioEl.addEventListener('play', () => {
      if (this.isSynthMode) return;
      this.isPlaying = true;
      this.isBuffering = false;
      this.notifyState();
      this.updateNativeMetadata();
    });

    this.audioEl.addEventListener('pause', () => {
      if (this.isSynthMode) return;
      this.isPlaying = false;
      this.notifyState();
      this.updateNativeMetadata();
    });

    this.audioEl.addEventListener('waiting', () => {
      if (this.isSynthMode) return;
      this.isBuffering = true;
      this.notifyState();
    });

    this.audioEl.addEventListener('playing', () => {
      if (this.isSynthMode) return;
      this.isBuffering = false;
      this.notifyState();
    });

    this.audioEl.addEventListener('timeupdate', () => {
      if (this.isSynthMode) return;
      this.events.emit('timeupdate', {
        position: this.audioEl.currentTime || 0,
        duration: Number.isFinite(this.audioEl.duration) && this.audioEl.duration > 0
          ? this.audioEl.duration
          : this.currentSong?.duration || 0,
      });
    });

    this.audioEl.addEventListener('ended', () => {
      if (this.isSynthMode) return;
      if (this.currentSong) {
        DatabaseService.recordPlayback(this.currentSong.id, this.currentSong.duration);
      }
      this.handleTrackEnded();
    });

    this.audioEl.addEventListener('error', () => {
      // Ignore intentional empty src resets
      if (!this.audioEl.getAttribute('src') || !this.currentSong) return;
      console.warn('Audio stream unavailable, activating analog WebAudio synthesizer playback.');
      this.isBuffering = false;
      this.startSynthesizedToneFallback(true);
    });
  }

  private setupPlatformBridges(): void {
    const handleAction = (action: string, value?: number) => {
      switch (action) {
        case 'play':
          this.play();
          break;
        case 'pause':
          this.pause();
          break;
        case 'next':
          this.next();
          break;
        case 'prev':
          this.previous();
          break;
        case 'seek':
        case 'changePosition':
          if (value !== undefined) this.seek(value);
          break;
      }
    };

    AndroidAudioService.getInstance().setNotificationActionListener(handleAction);
    IOSAudioService.getInstance().setRemoteCommandListener(handleAction);
  }

  private updateNativeMetadata(): void {
    const pos = this.getPosition();
    const dur = this.getDuration();
    AndroidAudioService.getInstance().updateNotification(this.currentSong, this.isPlaying);
    IOSAudioService.getInstance().updateNowPlayingInfo(this.currentSong, this.isPlaying, pos, dur);
  }

  private getPosition(): number {
    if (this.isSynthMode) return this.synthPosition;
    return this.audioEl.currentTime || 0;
  }

  private getDuration(): number {
    if (!this.isSynthMode && Number.isFinite(this.audioEl.duration) && this.audioEl.duration > 0) {
      return this.audioEl.duration;
    }
    return this.currentSong?.duration || 0;
  }

  private notifyState(): void {
    this.events.emit<PlaybackState>('stateChange', this.getState());
  }

  private handleTrackEnded(): void {
    this.stopSynthFallback(true);
    const repeatMode = this.queue.getRepeatMode();
    if (repeatMode === 'REPEAT_ONE' && this.currentSong) {
      if (this.isSynthMode) {
        this.synthPosition = 0;
      } else {
        this.audioEl.currentTime = 0;
      }
      this.play(this.currentSong);
      return;
    }

    const nextSong = this.queue.next();
    if (nextSong) {
      this.play(nextSong);
    } else {
      this.isPlaying = false;
      this.notifyState();
    }
  }

  private stopSynthFallback(resetPosition = false): void {
    if (this.synthInterval !== null) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (resetPosition) {
      this.isSynthMode = false;
      this.synthPosition = 0;
      this.synthNoteStep = 0;
      this.synthLastNoteMs = 0;
    }
  }

  async play(song?: Song): Promise<void> {
    this.initWebAudio();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch {
        // Ignore resume errors prior to user gesture
      }
    }

    const targetSong = song || this.currentSong || this.queue.getCurrentSong() || undefined;
    if (!targetSong) return;

    // Keep queue index aligned when playing a song directly
    if (song) {
      const currentInQueue = this.queue.getCurrentSong();
      if (!currentInQueue || currentInQueue.id !== song.id) {
        const foundIdx = this.queue.getQueue().findIndex((s) => s.id === song.id);
        if (foundIdx !== -1) {
          this.queue.jumpToIndex(foundIdx);
        }
      }
    }

    const isSameSong = targetSong.id === this.currentSong?.id;

    // If resuming synth mode for the same song
    if (isSameSong && this.isSynthMode) {
      this.startSynthesizedToneFallback(false);
      AndroidAudioService.getInstance().startForegroundService(targetSong, true);
      IOSAudioService.getInstance().activateAudioSession('playback');
      return;
    }

    const needsSourceLoad = !isSameSong || !this.audioEl.getAttribute('src');

    if (needsSourceLoad) {
      const seq = ++this.loadSequence;
      this.stopSynthFallback(true);
      this.audioEl.pause();
      this.currentSong = targetSong;

      if (this.activeBlobUrl) {
        URL.revokeObjectURL(this.activeBlobUrl);
        this.activeBlobUrl = null;
      }

      const localBlob = await DatabaseService.getAudioBlob(targetSong.id);
      if (seq !== this.loadSequence) return; // Superseded by newer play request

      if (localBlob && localBlob.size > 64) {
        this.activeBlobUrl = URL.createObjectURL(localBlob);
        this.audioEl.src = this.activeBlobUrl;
      } else if (targetSong.audioUrl) {
        this.audioEl.src = targetSong.audioUrl;
      } else {
        this.audioEl.removeAttribute('src');
        this.audioEl.load();
        this.startSynthesizedToneFallback(true);
        AndroidAudioService.getInstance().startForegroundService(targetSong, true);
        IOSAudioService.getInstance().activateAudioSession('playback');
        return;
      }

      this.audioEl.currentTime = 0;
      this.audioEl.playbackRate = this.playbackRate;
      this.audioEl.volume = this.volume;
    }

    try {
      await this.audioEl.play();
      this.isPlaying = true;
      this.isBuffering = false;
      this.notifyState();
      this.updateNativeMetadata();
      AndroidAudioService.getInstance().startForegroundService(this.currentSong!, true);
      IOSAudioService.getInstance().activateAudioSession('playback');
    } catch (err) {
      // If interrupted by AbortError because user quickly picked another track, ignore
      if ((err as Error)?.name === 'AbortError') return;
      console.warn('Audio play request interrupted or blocked, synth fallback initiated:', err);
      this.isBuffering = false;
      this.startSynthesizedToneFallback(false);
    }
  }

  pause(): void {
    if (this.isSynthMode) {
      this.stopSynthFallback(false);
      this.isPlaying = false;
      this.notifyState();
      this.updateNativeMetadata();
      return;
    }
    this.audioEl.pause();
    this.isPlaying = false;
    this.notifyState();
    this.updateNativeMetadata();
  }

  togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  next(): void {
    this.stopSynthFallback(true);
    const nextSong = this.queue.next();
    if (nextSong) {
      this.play(nextSong);
    } else {
      this.pause();
    }
  }

  previous(): void {
    if (this.getPosition() > 3) {
      this.seek(0);
      return;
    }
    this.stopSynthFallback(true);
    const prevSong = this.queue.previous();
    if (prevSong) {
      this.play(prevSong);
    }
  }

  seek(seconds: number): void {
    const maxDur = this.getDuration() || 180;
    const target = Math.max(0, Math.min(seconds, maxDur));

    if (this.isSynthMode) {
      this.synthPosition = target;
      this.events.emit('timeupdate', {
        position: this.synthPosition,
        duration: maxDur,
      });
      this.notifyState();
      this.updateNativeMetadata();
      return;
    }

    if (this.audioEl.getAttribute('src')) {
      this.audioEl.currentTime = target;
    }
    this.events.emit('timeupdate', {
      position: target,
      duration: maxDur,
    });
    this.notifyState();
    this.updateNativeMetadata();
  }

  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(vol, 1));
    this.audioEl.volume = this.volume;
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
    this.notifyState();
  }

  setPlaybackRate(rate: number): void {
    this.playbackRate = Math.max(0.5, Math.min(rate, 2.0));
    this.audioEl.playbackRate = this.playbackRate;
    this.notifyState();
  }

  setShuffle(enabled: boolean): void {
    this.queue.setShuffle(enabled);
    this.notifyState();
  }

  setRepeatMode(mode: RepeatMode): void {
    this.queue.setRepeatMode(mode);
    this.notifyState();
  }

  setQueue(songs: Song[], startIndex = 0): void {
    this.queue.setQueue(songs, startIndex);
    const song = this.queue.getCurrentSong();
    if (song && !this.currentSong) {
      this.currentSong = song;
    }
    this.notifyState();
  }

  setQueueAndPlay(songs: Song[], startIndex = 0): void {
    this.queue.setQueue(songs, startIndex);
    const song = this.queue.getCurrentSong();
    if (song) {
      this.play(song);
    }
  }

  addToQueue(song: Song): void {
    this.queue.addToQueue(song);
    this.notifyState();
  }

  playNext(song: Song): void {
    this.queue.playNext(song);
    this.notifyState();
  }

  removeFromQueue(index: number): void {
    const current = this.queue.getCurrentSong();
    const isRemovingCurrent = index === this.queue.getCurrentIndex();
    this.queue.removeFromQueue(index);
    const nextCurrent = this.queue.getCurrentSong();
    if (isRemovingCurrent && current && nextCurrent && nextCurrent.id !== current.id) {
      if (this.isPlaying) {
        this.play(nextCurrent);
      } else {
        this.currentSong = nextCurrent;
      }
    }
    this.notifyState();
  }

  reorderQueue(from: number, to: number): void {
    this.queue.reorderQueue(from, to);
    this.notifyState();
  }

  clearQueue(): void {
    this.queue.clearQueue();
    this.notifyState();
  }

  syncSongsMetadata(songs: Song[]): void {
    this.queue.syncSongsMetadata(songs);
    if (this.currentSong) {
      const updated = songs.find((s) => s.id === this.currentSong!.id);
      if (updated) {
        this.currentSong = updated;
        this.notifyState();
      } else if (this.currentSong.isLocal) {
        // Local song was deleted while loaded/playing
        const { removedCurrent, nextSong } = this.queue.removeSongById(this.currentSong.id);
        if (removedCurrent) {
          this.stopSynthFallback(true);
          this.audioEl.pause();
          this.audioEl.removeAttribute('src');
          this.audioEl.load();
          this.isPlaying = false;
          this.currentSong = nextSong;
          this.notifyState();
        }
      }
    }
  }

  // Equalizer
  setEqualizerPreset(presetName: string): void {
    if (EQUALIZER_PRESETS[presetName]) {
      this.currentPreset = presetName;
      this.applyEqualizerBands(EQUALIZER_PRESETS[presetName]);
      this.notifyState();
    }
  }

  setEqualizerBands(bands: EqualizerBands): void {
    const matchedPreset = Object.entries(EQUALIZER_PRESETS).find(
      ([, presetBands]) =>
        presetBands.bass === bands.bass &&
        presetBands.lowMid === bands.lowMid &&
        presetBands.mid === bands.mid &&
        presetBands.highMid === bands.highMid &&
        presetBands.treble === bands.treble
    );
    this.currentPreset = matchedPreset ? matchedPreset[0] : 'Custom';
    this.applyEqualizerBands(bands);
    this.notifyState();
  }

  private applyEqualizerBands(bands: EqualizerBands): void {
    this.currentBands = { ...bands };
    if (this.eqFilters.length === 5) {
      const values = [bands.bass, bands.lowMid, bands.mid, bands.highMid, bands.treble];
      const now = this.audioCtx?.currentTime || 0;
      values.forEach((val, i) => {
        this.eqFilters[i].gain.setValueAtTime(val, now);
      });
    }
  }

  getEqualizerBands(): EqualizerBands {
    return { ...this.currentBands };
  }

  getEqualizerPreset(): string {
    return this.currentPreset;
  }

  // Analyser node data for visualizer
  getFrequencyData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(64).fill(this.isPlaying ? 40 : 0);
    }
    const array = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(array);
    return array;
  }

  getWaveformData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(64).fill(128);
    }
    const array = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteTimeDomainData(array);
    return array;
  }

  // Audible melodic WebAudio analog synth fallback for offline/restricted streams
  private playSynthPadNote(): void {
    if (!this.audioCtx || this.audioCtx.state !== 'running' || !this.gainNode) return;
    // Warm analog minor-9th chord progression
    const notes = [220, 261.63, 329.63, 392.0, 493.88, 329.63, 293.66, 392.0];
    const freq = notes[this.synthNoteStep % notes.length];
    this.synthNoteStep++;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const env = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(0.09, now + 0.15);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 1.65);

    osc.connect(env);
    if (this.eqFilters.length > 0) {
      env.connect(this.eqFilters[0]);
    } else {
      env.connect(this.gainNode);
    }

    osc.start(now);
    osc.stop(now + 1.7);
  }

  private startSynthesizedToneFallback(resetPosition: boolean): void {
    if (resetPosition) {
      this.synthPosition = 0;
    }
    this.isSynthMode = true;
    this.isPlaying = true;
    this.isBuffering = false;

    if (this.synthInterval !== null) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }

    this.notifyState();
    this.updateNativeMetadata();

    const tickMs = 250;
    this.playSynthPadNote();
    this.synthLastNoteMs = Date.now();

    this.synthInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.isSynthMode) return;
      const totalDur = this.currentSong?.duration || 180;
      this.synthPosition = Math.min(totalDur, this.synthPosition + (tickMs / 1000) * this.playbackRate);

      const nowMs = Date.now();
      if (nowMs - this.synthLastNoteMs >= 1600 / this.playbackRate) {
        this.playSynthPadNote();
        this.synthLastNoteMs = nowMs;
      }

      this.events.emit('timeupdate', {
        position: this.synthPosition,
        duration: totalDur,
      });

      if (this.synthPosition >= totalDur) {
        if (this.currentSong) {
          DatabaseService.recordPlayback(this.currentSong.id, this.currentSong.duration);
        }
        this.handleTrackEnded();
      }
    }, tickMs);
  }

  // Handle audio interruption from OS / UI events
  handleAudioInterruption(type: string): void {
    if (type === 'BEGAN' || type === 'PHONE_CALL' || type === 'HEADSET_UNPLUG' || type === 'AIRPODS_DISCONNECT') {
      this.pause();
    } else if (type === 'DUCK') {
      if (this.preDuckVolume === null) {
        this.preDuckVolume = this.volume;
      }
      this.setVolume(Math.max(0.05, this.preDuckVolume * 0.2));
    } else if (type === 'UNDUCK') {
      if (this.duckTimer !== null) {
        clearTimeout(this.duckTimer);
        this.duckTimer = null;
      }
      if (this.preDuckVolume !== null) {
        const restore = this.preDuckVolume;
        this.preDuckVolume = null;
        this.setVolume(restore);
      }
    } else if (type === 'ENDED') {
      if (this.preDuckVolume !== null) {
        const restore = this.preDuckVolume;
        this.preDuckVolume = null;
        this.setVolume(restore);
      }
      this.play();
    }
  }

  // Interruption Simulation for testing (Android AudioFocus loss / iOS AirPods disconnect)
  triggerInterruption(type: 'PHONE_CALL' | 'HEADSET_UNPLUG' | 'AIRPODS_DISCONNECT' | 'ALARM_DUCK'): { message: string } {
    if (type === 'PHONE_CALL' || type === 'HEADSET_UNPLUG' || type === 'AIRPODS_DISCONNECT') {
      this.pause();
      return {
        message:
          type === 'PHONE_CALL'
            ? 'Incoming Phone Call simulated. Media playback paused.'
            : 'Headset/AirPods disconnected (Becoming Noisy). Playback paused.',
      };
    } else if (type === 'ALARM_DUCK') {
      if (this.duckTimer !== null) {
        clearTimeout(this.duckTimer);
      }
      this.handleAudioInterruption('DUCK');
      this.duckTimer = window.setTimeout(() => {
        this.handleAudioInterruption('UNDUCK');
      }, 3000);
      return { message: 'System alert notification simulated. Audio ducked for 3 seconds.' };
    }
    return { message: 'Interruption processed.' };
  }

  getState(): PlaybackState {
    return {
      currentSong: this.currentSong,
      isPlaying: this.isPlaying,
      position: this.getPosition(),
      duration: this.getDuration(),
      buffered: !this.isSynthMode && this.audioEl.buffered.length > 0
        ? this.audioEl.buffered.end(this.audioEl.buffered.length - 1)
        : this.getPosition(),
      volume: this.volume,
      playbackRate: this.playbackRate,
      shuffleEnabled: this.queue.isShuffle(),
      repeatMode: this.queue.getRepeatMode(),
      isBuffering: this.isBuffering,
      equalizerPreset: this.currentPreset,
    };
  }
}
