import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Song, Artist, Album, Playlist, DownloadItem, UserSettings, DeviceFolderRecord } from '../types';
import { INITIAL_SONGS, INITIAL_ARTISTS, INITIAL_ALBUMS, INITIAL_PLAYLISTS } from '../data/mockData';
import { RETRO_WALLPAPER, resolveArtworkUrl } from '../assets/artwork';

interface SonoraDB extends DBSchema {
  songs: {
    key: string;
    value: Song;
    indexes: { 'by-artist': string; 'by-album': string; 'by-genre': string; 'by-isFavorite': number };
  };
  artists: {
    key: string;
    value: Artist;
  };
  albums: {
    key: string;
    value: Album;
    indexes: { 'by-artistId': string };
  };
  playlists: {
    key: string;
    value: Playlist;
  };
  favorites: {
    key: string;
    value: { id: string; targetId: string; type: 'SONG' | 'ALBUM' | 'ARTIST' | 'PLAYLIST'; addedAt: number };
    indexes: { 'by-type': string; 'by-targetId': string };
  };
  history: {
    key: string;
    value: { id: string; songId: string; playedAt: number; durationPlayed: number };
    indexes: { 'by-playedAt': number };
  };
  downloads: {
    key: string;
    value: DownloadItem;
    indexes: { 'by-status': string };
  };
  audioBlobs: {
    key: string;
    value: { songId: string; blob: Blob; mimeType: string; size: number; savedAt: number };
  };
  deviceFolders: {
    key: string;
    value: DeviceFolderRecord;
  };
  settings: {
    key: string;
    value: { id: string; data: UserSettings };
  };
}

const DB_NAME = 'sonora_music_db_v1';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<SonoraDB>> | null = null;

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'DARK',
  accentColor: '#DC2626',
  autoplay: true,
  crossfade: 2,
  gaplessPlayback: true,
  normalizeVolume: true,
  audioQuality: 'HIGH',
  downloadWifiOnly: false,
  storageLimitMB: 2048,
  notificationsEnabled: true,
  simulatedDevice: 'RESPONSIVE',
  localMusicEnabled: true,
};

export async function getDB(): Promise<IDBPDatabase<SonoraDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SonoraDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Songs store
        if (!db.objectStoreNames.contains('songs')) {
          const songStore = db.createObjectStore('songs', { keyPath: 'id' });
          songStore.createIndex('by-artist', 'artist');
          songStore.createIndex('by-album', 'album');
          songStore.createIndex('by-genre', 'genre');
          songStore.createIndex('by-isFavorite', 'isFavorite');
        }

        // Artists store
        if (!db.objectStoreNames.contains('artists')) {
          db.createObjectStore('artists', { keyPath: 'id' });
        }

        // Albums store
        if (!db.objectStoreNames.contains('albums')) {
          const albumStore = db.createObjectStore('albums', { keyPath: 'id' });
          albumStore.createIndex('by-artistId', 'artistId');
        }

        // Playlists store
        if (!db.objectStoreNames.contains('playlists')) {
          db.createObjectStore('playlists', { keyPath: 'id' });
        }

        // Favorites store
        if (!db.objectStoreNames.contains('favorites')) {
          const favStore = db.createObjectStore('favorites', { keyPath: 'id' });
          favStore.createIndex('by-type', 'type');
          favStore.createIndex('by-targetId', 'targetId');
        }

        // History store
        if (!db.objectStoreNames.contains('history')) {
          const histStore = db.createObjectStore('history', { keyPath: 'id' });
          histStore.createIndex('by-playedAt', 'playedAt');
        }

        // Downloads store
        if (!db.objectStoreNames.contains('downloads')) {
          const dlStore = db.createObjectStore('downloads', { keyPath: 'songId' });
          dlStore.createIndex('by-status', 'status');
        }

        // Audio Blobs store (offline cached/downloaded/local files)
        if (!db.objectStoreNames.contains('audioBlobs')) {
          db.createObjectStore('audioBlobs', { keyPath: 'songId' });
        }

        // Device Folders store (persistent File System Access directory handles)
        if (!db.objectStoreNames.contains('deviceFolders')) {
          db.createObjectStore('deviceFolders', { keyPath: 'id' });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export class DatabaseService {
  static async requestPersistentStorage(): Promise<boolean> {
    try {
      if (navigator.storage && typeof navigator.storage.persist === 'function') {
        const persisted = await navigator.storage.persisted();
        if (persisted) return true;
        return await navigator.storage.persist();
      }
    } catch {
      // Ignore storage permission errors in restricted contexts
    }
    return false;
  }

  static async initDatabase(): Promise<void> {
    await this.requestPersistentStorage();
    const db = await getDB();
    const [existingSongs, existingArtists, existingAlbums, existingPlaylists, existingSettings] = await Promise.all([
      db.getAll('songs'),
      db.getAll('artists'),
      db.getAll('albums'),
      db.getAll('playlists'),
      db.get('settings', 'user_settings'),
    ]);

    const hasCatalogSongs = existingSongs.some((s) => !s.isLocal);

    if (!hasCatalogSongs || existingArtists.length === 0 || existingAlbums.length === 0 || existingPlaylists.length === 0 || !existingSettings) {
      const tx = db.transaction(['songs', 'artists', 'albums', 'playlists', 'settings'], 'readwrite');
      if (!hasCatalogSongs) {
        for (const song of INITIAL_SONGS) {
          await tx.objectStore('songs').put(song);
        }
      }
      if (existingArtists.length === 0) {
        for (const artist of INITIAL_ARTISTS) {
          await tx.objectStore('artists').put(artist);
        }
      }
      if (existingAlbums.length === 0) {
        for (const album of INITIAL_ALBUMS) {
          await tx.objectStore('albums').put(album);
        }
      }
      if (existingPlaylists.length === 0) {
        for (const playlist of INITIAL_PLAYLISTS) {
          await tx.objectStore('playlists').put(playlist);
        }
      }
      if (!existingSettings) {
        await tx.objectStore('settings').put({ id: 'user_settings', data: DEFAULT_SETTINGS });
      }
      await tx.done;
    }

    // Migrate any legacy /src/assets/images/... paths stored in IndexedDB to Vite-bundled asset URLs
    const needsMigration =
      existingSongs.some((s) => s.artwork.startsWith('/src/assets/')) ||
      existingArtists.some((a) => a.artwork.startsWith('/src/assets/')) ||
      existingAlbums.some((al) => al.artwork.startsWith('/src/assets/')) ||
      existingPlaylists.some((p) => p.artwork.startsWith('/src/assets/'));

    if (needsMigration) {
      const tx = db.transaction(['songs', 'artists', 'albums', 'playlists'], 'readwrite');
      for (const s of existingSongs) {
        if (s.artwork.startsWith('/src/assets/')) {
          await tx.objectStore('songs').put({ ...s, artwork: resolveArtworkUrl(s.artwork) });
        }
      }
      for (const a of existingArtists) {
        if (a.artwork.startsWith('/src/assets/')) {
          await tx.objectStore('artists').put({ ...a, artwork: resolveArtworkUrl(a.artwork) });
        }
      }
      for (const al of existingAlbums) {
        if (al.artwork.startsWith('/src/assets/')) {
          await tx.objectStore('albums').put({ ...al, artwork: resolveArtworkUrl(al.artwork) });
        }
      }
      for (const p of existingPlaylists) {
        if (p.artwork.startsWith('/src/assets/')) {
          await tx.objectStore('playlists').put({ ...p, artwork: resolveArtworkUrl(p.artwork, RETRO_WALLPAPER) });
        }
      }
      await tx.done;
    }
  }

  // Songs
  static async getAllSongs(): Promise<Song[]> {
    const db = await getDB();
    return db.getAll('songs');
  }

  static async getSongById(id: string): Promise<Song | undefined> {
    const db = await getDB();
    return db.get('songs', id);
  }

  static async saveSong(song: Song): Promise<void> {
    const db = await getDB();
    await db.put('songs', song);
  }

  static async toggleSongFavorite(id: string): Promise<boolean> {
    const db = await getDB();
    const song = await db.get('songs', id);
    if (!song) return false;
    const newFavorite = !song.isFavorite;
    song.isFavorite = newFavorite;
    await db.put('songs', song);

    // Update Loved Tracks playlist
    const lovedPlaylist = await db.get('playlists', 'playlist-loved');
    if (lovedPlaylist) {
      if (newFavorite && !lovedPlaylist.songIds.includes(id)) {
        lovedPlaylist.songIds.unshift(id);
      } else if (!newFavorite) {
        lovedPlaylist.songIds = lovedPlaylist.songIds.filter(sId => sId !== id);
      }
      lovedPlaylist.updatedAt = Date.now();
      await db.put('playlists', lovedPlaylist);
    }
    return newFavorite;
  }

  // Artists
  static async getAllArtists(): Promise<Artist[]> {
    const db = await getDB();
    return db.getAll('artists');
  }

  static async getArtistById(id: string): Promise<Artist | undefined> {
    const db = await getDB();
    return db.get('artists', id);
  }

  static async toggleArtistFollow(id: string): Promise<boolean> {
    const db = await getDB();
    const artist = await db.get('artists', id);
    if (!artist) return false;
    artist.isFollowed = !artist.isFollowed;
    await db.put('artists', artist);
    return artist.isFollowed;
  }

  // Albums
  static async getAllAlbums(): Promise<Album[]> {
    const db = await getDB();
    return db.getAll('albums');
  }

  static async getAlbumById(id: string): Promise<Album | undefined> {
    const db = await getDB();
    return db.get('albums', id);
  }

  static async toggleAlbumFavorite(id: string): Promise<boolean> {
    const db = await getDB();
    const album = await db.get('albums', id);
    if (!album) return false;
    album.isFavorite = !album.isFavorite;
    await db.put('albums', album);
    return album.isFavorite;
  }

  // Playlists
  static async getAllPlaylists(): Promise<Playlist[]> {
    const db = await getDB();
    return db.getAll('playlists');
  }

  static async getPlaylistById(id: string): Promise<Playlist | undefined> {
    const db = await getDB();
    return db.get('playlists', id);
  }

  static async createPlaylist(title: string, description: string, artwork?: string): Promise<Playlist> {
    const db = await getDB();
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim() || 'Untitled Mixtape',
      description: description.trim() || 'My custom personal mixtape on Walktone.',
      artwork: resolveArtworkUrl(artwork, RETRO_WALLPAPER),
      creator: 'You',
      songIds: [],
      isCustom: true,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.put('playlists', newPlaylist);
    return newPlaylist;
  }

  static async updatePlaylist(playlist: Playlist): Promise<void> {
    const db = await getDB();
    playlist.updatedAt = Date.now();
    await db.put('playlists', playlist);
  }

  static async deletePlaylist(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('playlists', id);
  }

  static async addSongToPlaylist(playlistId: string, songId: string): Promise<void> {
    const db = await getDB();
    const playlist = await db.get('playlists', playlistId);
    if (playlist && !playlist.songIds.includes(songId)) {
      playlist.songIds.push(songId);
      playlist.updatedAt = Date.now();
      await db.put('playlists', playlist);
    }
  }

  static async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    const db = await getDB();
    const playlist = await db.get('playlists', playlistId);
    if (playlist) {
      playlist.songIds = playlist.songIds.filter(id => id !== songId);
      playlist.updatedAt = Date.now();
      await db.put('playlists', playlist);
    }
  }

  // History
  static async recordPlayback(songId: string, durationPlayed: number): Promise<void> {
    const db = await getDB();
    await db.put('history', {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      songId,
      playedAt: Date.now(),
      durationPlayed,
    });
    // Increment play count
    const song = await db.get('songs', songId);
    if (song) {
      song.playCount = (song.playCount || 0) + 1;
      await db.put('songs', song);
    }
  }

  static async getRecentlyPlayedSongs(limit = 10): Promise<Song[]> {
    const db = await getDB();
    const historyEntries = await db.getAllFromIndex('history', 'by-playedAt');
    const sorted = historyEntries.sort((a, b) => b.playedAt - a.playedAt);
    const seenSongIds = new Set<string>();
    const recentSongs: Song[] = [];

    for (const entry of sorted) {
      if (!seenSongIds.has(entry.songId)) {
        seenSongIds.add(entry.songId);
        const song = await db.get('songs', entry.songId);
        if (song) recentSongs.push(song);
        if (recentSongs.length >= limit) break;
      }
    }
    return recentSongs;
  }

  // Downloads & Offline Blobs
  static async saveAudioBlob(songId: string, blob: Blob, mimeType = 'audio/mp3'): Promise<void> {
    const db = await getDB();
    await db.put('audioBlobs', {
      songId,
      blob,
      mimeType,
      size: blob.size,
      savedAt: Date.now(),
    });
    const song = await db.get('songs', songId);
    if (song) {
      song.isDownloaded = true;
      await db.put('songs', song);
    }
  }

  static async getAudioBlob(songId: string): Promise<Blob | undefined> {
    const db = await getDB();
    const record = await db.get('audioBlobs', songId);
    return record?.blob;
  }

  static async deleteAudioBlob(songId: string): Promise<void> {
    const db = await getDB();
    await db.delete('audioBlobs', songId);
    const song = await db.get('songs', songId);
    if (song) {
      song.isDownloaded = false;
      await db.put('songs', song);
    }
  }

  static async getAllDownloads(): Promise<DownloadItem[]> {
    const db = await getDB();
    return db.getAll('downloads');
  }

  static async saveDownloadItem(item: DownloadItem): Promise<void> {
    const db = await getDB();
    await db.put('downloads', item);
  }

  static async deleteDownloadItem(songId: string): Promise<void> {
    const db = await getDB();
    await db.delete('downloads', songId);
  }

  // Settings
  static async getSettings(): Promise<UserSettings> {
    const db = await getDB();
    const record = await db.get('settings', 'user_settings');
    return {
      ...DEFAULT_SETTINGS,
      ...(record?.data || {}),
      localMusicEnabled: true, // Permanently enabled internal device support
    };
  }

  static async saveSettings(settings: UserSettings): Promise<void> {
    const db = await getDB();
    await db.put('settings', {
      id: 'user_settings',
      data: { ...settings, localMusicEnabled: true },
    });
  }

  // Clear stream cache while preserving catalog metadata, settings, and permanently saved local device tracks
  static async clearAllData(): Promise<void> {
    const db = await getDB();
    const allSongs = await db.getAll('songs');
    const localSongIds = new Set(allSongs.filter((s) => s.isLocal).map((s) => s.id));
    const allBlobs = await db.getAll('audioBlobs');

    const tx = db.transaction(['songs', 'history', 'downloads', 'audioBlobs'], 'readwrite');
    for (const song of allSongs) {
      if (!song.isLocal && song.isDownloaded) {
        await tx.objectStore('songs').put({ ...song, isDownloaded: false });
      }
    }
    for (const blobRec of allBlobs) {
      if (!localSongIds.has(blobRec.songId)) {
        await tx.objectStore('audioBlobs').delete(blobRec.songId);
      }
    }
    await tx.objectStore('history').clear();
    await tx.objectStore('downloads').clear();
    await tx.done;
  }

  static async deleteLocalSong(songId: string): Promise<void> {
    const db = await getDB();
    const [allPlaylists, allHistory] = await Promise.all([
      db.getAll('playlists'),
      db.getAll('history'),
    ]);
    const tx = db.transaction(['songs', 'audioBlobs', 'playlists', 'history'], 'readwrite');
    await tx.objectStore('songs').delete(songId);
    await tx.objectStore('audioBlobs').delete(songId);
    for (const pl of allPlaylists) {
      if (pl.songIds.includes(songId)) {
        await tx.objectStore('playlists').put({
          ...pl,
          songIds: pl.songIds.filter((id) => id !== songId),
          updatedAt: Date.now(),
        });
      }
    }
    for (const hist of allHistory) {
      if (hist.songId === songId) {
        await tx.objectStore('history').delete(hist.id);
      }
    }
    await tx.done;
  }

  static async saveDeviceFolder(folder: DeviceFolderRecord): Promise<void> {
    const db = await getDB();
    await db.put('deviceFolders', folder);
  }

  static async getAllDeviceFolders(): Promise<DeviceFolderRecord[]> {
    const db = await getDB();
    return db.getAll('deviceFolders');
  }

  static async removeDeviceFolder(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('deviceFolders', id);
  }

  static async importLocalSongs(songs: Song[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('songs', 'readwrite');
    for (const song of songs) {
      await tx.store.put(song);
    }
    await tx.done;
  }
}
