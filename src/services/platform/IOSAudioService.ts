import { Song } from '../../types';

export type IOSAudioSessionCategory = 'playback' | 'ambient' | 'soloAmbient';
export type IOSAudioInterruptionType = 'began' | 'ended';

export class IOSAudioService {
  private static instance: IOSAudioService;
  private isAudioSessionActive: boolean = false;
  private currentCategory: IOSAudioSessionCategory = 'playback';
  private onRemoteCommandCallback?: (command: 'play' | 'pause' | 'next' | 'prev' | 'changePosition', value?: number) => void;

  private constructor() {
    this.setupRemoteCommandCenter();
  }

  static getInstance(): IOSAudioService {
    if (!IOSAudioService.instance) {
      IOSAudioService.instance = new IOSAudioService();
    }
    return IOSAudioService.instance;
  }

  activateAudioSession(category: IOSAudioSessionCategory = 'playback'): boolean {
    this.currentCategory = category;
    this.isAudioSessionActive = true;
    return true;
  }

  deactivateAudioSession(): void {
    this.isAudioSessionActive = false;
  }

  updateNowPlayingInfo(song: Song | null, isPlaying: boolean, position: number, duration: number): void {
    if (!song) return;

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album,
        artwork: [
          { src: song.artwork, sizes: '512x512', type: 'image/jpeg' },
        ],
      });
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      if ('setPositionState' in navigator.mediaSession && duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: Math.max(duration, 1),
            playbackRate: 1.0,
            position: Math.min(position, duration),
          });
        } catch (e) {
          // ignore potential clamp error
        }
      }
    }
  }

  simulateInterruption(type: 'AIRPODS_DISCONNECT' | 'FACETIME_CALL' | 'SIRI_ACTIVATION'): { action: 'PAUSE' | 'RESUME' | 'DUCK'; description: string } {
    switch (type) {
      case 'AIRPODS_DISCONNECT':
        return {
          action: 'PAUSE',
          description: 'AVAudioSessionRouteChangeReasonOldDeviceUnavailable (AirPods disconnected). Playback paused.',
        };
      case 'FACETIME_CALL':
        return {
          action: 'PAUSE',
          description: 'AVAudioSessionInterruptionTypeBegan (FaceTime Audio Call). Playback paused.',
        };
      case 'SIRI_ACTIVATION':
        return {
          action: 'DUCK',
          description: 'Siri activation / Voice trigger. Audio session ducking enabled.',
        };
    }
  }

  private setupRemoteCommandCenter(): void {
    // Media keys for iOS Control Center & Lock Screen
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          this.onRemoteCommandCallback?.('play');
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          this.onRemoteCommandCallback?.('pause');
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          this.onRemoteCommandCallback?.('next');
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          this.onRemoteCommandCallback?.('prev');
        });
      } catch (e) {
        console.warn('iOS RemoteCommandCenter registration:', e);
      }
    }
  }

  setRemoteCommandListener(cb: (command: 'play' | 'pause' | 'next' | 'prev' | 'changePosition', value?: number) => void): void {
    this.onRemoteCommandCallback = cb;
  }
}
