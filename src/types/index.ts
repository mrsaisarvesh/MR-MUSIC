export type RepeatMode = 'OFF' | 'REPEAT_ONE' | 'REPEAT_ALL';

export type ThemeMode = 'DARK' | 'AMOLED' | 'LIGHT' | 'SYSTEM';

export type ScreenType =
  | 'HOME'
  | 'SEARCH'
  | 'LIBRARY'
  | 'SETTINGS'
  | 'ARTIST_DETAIL'
  | 'ALBUM_DETAIL'
  | 'PLAYLIST_DETAIL';

export type DevicePlatform = 'ANDROID' | 'IOS' | 'TABLET_IPAD' | 'TABLET_ANDROID' | 'RESPONSIVE';

export type DownloadStatus = 'QUEUED' | 'DOWNLOADING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album: string;
  albumId?: string;
  duration: number; // in seconds
  artwork: string;
  audioUrl: string;
  genre: string;
  year?: number;
  playCount?: number;
  isFavorite?: boolean;
  isLocal?: boolean;
  isDownloaded?: boolean;
  fileSize?: string;
  lyrics?: LyricLine[];
  plainLyrics?: string;
  blob?: Blob;
  addedAt?: number;
}

export interface Artist {
  id: string;
  name: string;
  artwork: string;
  monthlyListeners: number;
  genres: string[];
  bio: string;
  topSongIds: string[];
  albumIds: string[];
  isFollowed?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  artwork: string;
  year: number;
  genre: string;
  songIds: string[];
  isFavorite?: boolean;
  isDownloaded?: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  artwork: string;
  creator: string;
  songIds: string[];
  isCustom?: boolean;
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DownloadItem {
  songId: string;
  song: Song;
  progress: number; // 0 to 100
  status: DownloadStatus;
  bytesDownloaded: number;
  totalBytes: number;
  error?: string;
}

export interface PlaybackState {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number; // seconds
  duration: number; // seconds
  buffered: number; // seconds
  volume: number; // 0.0 to 1.0
  playbackRate: number; // 0.5 to 2.0
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  isBuffering: boolean;
  equalizerPreset: string;
}

export interface EqualizerBands {
  bass: number; // -12 to 12 dB (60Hz)
  lowMid: number; // -12 to 12 dB (230Hz)
  mid: number; // -12 to 12 dB (910Hz)
  highMid: number; // -12 to 12 dB (3.6kHz)
  treble: number; // -12 to 12 dB (14kHz)
}

export interface UserSettings {
  theme: ThemeMode;
  accentColor: string;
  autoplay: boolean;
  crossfade: number; // in seconds (0 to 10)
  gaplessPlayback: boolean;
  normalizeVolume: boolean;
  audioQuality: 'AUTO' | 'HIGH' | 'LOSSLESS';
  downloadWifiOnly: boolean;
  storageLimitMB: number;
  notificationsEnabled: boolean;
  simulatedDevice: DevicePlatform;
  localMusicEnabled?: boolean;
}

export interface DeviceFolderRecord {
  id: string;
  name: string;
  addedAt: number;
  lastSyncedAt: number;
  trackCount: number;
  handle?: unknown;
}

export type ActiveTab = 'HOME' | 'SEARCH' | 'LIBRARY' | 'SETTINGS';

export type ScreenView = 
  | { type: 'TAB'; tab: ActiveTab }
  | { type: 'ARTIST'; artistId: string }
  | { type: 'ALBUM'; albumId: string }
  | { type: 'PLAYLIST'; playlistId: string };
