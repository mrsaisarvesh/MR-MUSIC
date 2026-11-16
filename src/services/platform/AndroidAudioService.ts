import { Song, PlaybackState } from '../../types';

export interface AndroidMediaNotificationData {
  title: string;
  artist: string;
  album: string;
  artwork: string;
  isPlaying: boolean;
  duration: number;
  position: number;
}

export type AndroidAudioFocusState = 'GAIN' | 'LOSS_TRANSIENT' | 'LOSS_TRANSIENT_CAN_DUCK' | 'LOSS';

export class AndroidAudioService {
  private static instance: AndroidAudioService;
  private isForegroundServiceActive: boolean = false;
  private currentAudioFocus: AndroidAudioFocusState = 'GAIN';
  private onNotificationActionCallback?: (action: 'play' | 'pause' | 'next' | 'prev' | 'seek', value?: number) => void;

  private constructor() {
    this.setupHardwareListeners();
  }

  static getInstance(): AndroidAudioService {
    if (!AndroidAudioService.instance) {
      AndroidAudioService.instance = new AndroidAudioService();
    }
    return AndroidAudioService.instance;
  }

  startForegroundService(song: Song, isPlaying: boolean): void {
    this.isForegroundServiceActive = true;
    this.updateNotification(song, isPlaying);
  }

  stopForegroundService(): void {
    this.isForegroundServiceActive = false;
  }

  updateNotification(song: Song | null, isPlaying: boolean): void {
    if (!song) return;

    // Synchronize with native Navigator MediaSession (Real Lock screen + Android notification tray)
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album,
        artwork: [
          { src: song.artwork, sizes: '96x96', type: 'image/jpeg' },
          { src: song.artwork, sizes: '128x128', type: 'image/jpeg' },
          { src: song.artwork, sizes: '256x256', type: 'image/jpeg' },
          { src: song.artwork, sizes: '512x512', type: 'image/jpeg' },
        ],
      });
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }

  requestAudioFocus(): AndroidAudioFocusState {
    this.currentAudioFocus = 'GAIN';
    return this.currentAudioFocus;
  }

  abandonAudioFocus(): void {
    this.currentAudioFocus = 'LOSS';
  }

  simulateInterruption(type: 'PHONE_CALL' | 'HEADSET_UNPLUG' | 'ALARM_DUCK'): { action: 'PAUSE' | 'DUCK' | 'RESUME'; reason: string } {
    switch (type) {
      case 'PHONE_CALL':
        this.currentAudioFocus = 'LOSS_TRANSIENT';
        return { action: 'PAUSE', reason: 'Incoming phone call received. Media paused.' };
      case 'HEADSET_UNPLUG':
        this.currentAudioFocus = 'LOSS';
        return { action: 'PAUSE', reason: 'Audio route changed (Headset unplugged - Becoming Noisy). Media paused safely.' };
      case 'ALARM_DUCK':
        this.currentAudioFocus = 'LOSS_TRANSIENT_CAN_DUCK';
        return { action: 'DUCK', reason: 'System notification fired. Ducking audio volume to 20%.' };
    }
  }

  private setupHardwareListeners(): void {
    // Bluetooth / Wired headset media keys & physical keys via MediaSession
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          this.onNotificationActionCallback?.('play');
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          this.onNotificationActionCallback?.('pause');
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          this.onNotificationActionCallback?.('next');
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          this.onNotificationActionCallback?.('prev');
        });
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) {
            this.onNotificationActionCallback?.('seek', details.seekTime);
          }
        });
      } catch (e) {
        console.warn('MediaSession handler registration:', e);
      }
    }
  }

  setNotificationActionListener(cb: (action: 'play' | 'pause' | 'next' | 'prev' | 'seek', value?: number) => void): void {
    this.onNotificationActionCallback = cb;
  }

  isServiceRunning(): boolean {
    return this.isForegroundServiceActive;
  }
}
