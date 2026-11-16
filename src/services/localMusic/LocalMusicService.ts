import { Song, DeviceFolderRecord } from '../../types';
import { DatabaseService } from '../../database/db';

const AUDIO_FILE_REGEX = /\.(mp3|wav|ogg|m4a|aac|flac|opus|webm)$/i;
const LOCAL_ARTWORK = '/src/assets/images/sonora_vinyl_cover_1794856590606.jpg';

interface FileSystemHandleWithPerm {
  kind: 'file' | 'directory';
  name: string;
  queryPermission?: (desc?: { mode?: 'read' | 'readwrite' }) => Promise<'granted' | 'denied' | 'prompt'>;
  requestPermission?: (desc?: { mode?: 'read' | 'readwrite' }) => Promise<'granted' | 'denied' | 'prompt'>;
  getFile?: () => Promise<File>;
  values?: () => AsyncIterable<FileSystemHandleWithPerm>;
}

export class LocalMusicService {
  static supportsDirectoryPicker(): boolean {
    return typeof window !== 'undefined' && typeof (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker === 'function';
  }

  private static createDeterministicSongId(file: File): string {
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 28);
    return `local-${safeName}-${file.size}-${file.lastModified}`;
  }

  private static parseTrackMetadata(file: File): { title: string; artist: string; format: string } {
    const extMatch = file.name.match(/\.([^/.]+)$/);
    const format = extMatch ? extMatch[1].toUpperCase() : 'AUDIO';
    let baseName = file.name.replace(/\.[^/.]+$/, '').trim();

    // Strip leading track numbers like "01 - " or "01. "
    baseName = baseName.replace(/^\d{1,3}\s*[-._]\s*/, '').trim();

    let title = baseName || 'Untitled Track';
    let artist = 'Device Audio';

    if (baseName.includes(' - ')) {
      const parts = baseName.split(' - ');
      if (parts.length >= 2) {
        artist = parts[0].trim() || 'Device Audio';
        title = parts.slice(1).join(' - ').trim() || baseName;
      }
    }

    return { title, artist, format };
  }

  /**
   * Import files selected by the user via file picker or folder input and store permanently in IndexedDB
   */
  static async importAudioFiles(files: FileList | File[], folderName = 'Local Device Music'): Promise<Song[]> {
    await DatabaseService.requestPersistentStorage();
    const importedSongs: Song[] = [];
    const existingSongs = await DatabaseService.getAllSongs();
    const existingIds = new Set(existingSongs.map((s) => s.id));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/') && !AUDIO_FILE_REGEX.test(file.name)) {
        continue;
      }

      const songId = this.createDeterministicSongId(file);
      const existingBlob = await DatabaseService.getAudioBlob(songId);
      if (existingIds.has(songId) && existingBlob) {
        const existingSong = existingSongs.find((s) => s.id === songId);
        if (existingSong) importedSongs.push(existingSong);
        continue;
      }

      const { title, artist, format } = this.parseTrackMetadata(file);
      const duration = await this.getAudioDuration(file);
      const sizeMB = Math.max(0.1, file.size / (1024 * 1024)).toFixed(1);

      const newSong: Song = {
        id: songId,
        title,
        artist,
        album: folderName,
        duration: Math.round(duration) || 180,
        artwork: LOCAL_ARTWORK,
        audioUrl: '',
        genre: `Local · ${format}`,
        year: new Date(file.lastModified || Date.now()).getFullYear(),
        playCount: 0,
        isFavorite: false,
        isLocal: true,
        isDownloaded: true,
        fileSize: `${sizeMB} MB`,
        addedAt: Date.now(),
      };

      await DatabaseService.saveAudioBlob(songId, file, file.type || 'audio/mpeg');
      await DatabaseService.saveSong(newSong);
      existingIds.add(songId);
      importedSongs.push(newSong);
    }

    return importedSongs;
  }

  private static async collectAudioFilesFromHandle(
    dirHandle: FileSystemHandleWithPerm,
    maxDepth = 4,
    depth = 0
  ): Promise<File[]> {
    const files: File[] = [];
    if (depth > maxDepth || !dirHandle.values) return files;

    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file' && entry.getFile) {
        const file = await entry.getFile();
        if (file.type.startsWith('audio/') || AUDIO_FILE_REGEX.test(file.name)) {
          files.push(file);
        }
      } else if (entry.kind === 'directory') {
        const subFiles = await this.collectAudioFilesFromHandle(entry, maxDepth, depth + 1);
        files.push(...subFiles);
      }
    }
    return files;
  }

  /**
   * Link a device music folder using File System Access API and persist handle in IndexedDB
   */
  static async pickAndSaveDeviceFolder(): Promise<{ folder: DeviceFolderRecord; songs: Song[] } | null> {
    if (!this.supportsDirectoryPicker()) return null;

    const picker = (window as unknown as { showDirectoryPicker: (opts?: { mode?: 'read' }) => Promise<FileSystemHandleWithPerm> }).showDirectoryPicker;
    const dirHandle = await picker({ mode: 'read' });
    const files = await this.collectAudioFilesFromHandle(dirHandle);
    const songs = await this.importAudioFiles(files, dirHandle.name);

    const folderRecord: DeviceFolderRecord = {
      id: `folder-${dirHandle.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: dirHandle.name,
      addedAt: Date.now(),
      lastSyncedAt: Date.now(),
      trackCount: songs.length,
      handle: dirHandle,
    };

    await DatabaseService.saveDeviceFolder(folderRecord);
    return { folder: folderRecord, songs };
  }

  /**
   * Re-sync linked device folders stored in IndexedDB (runs silently on startup if permission is granted)
   */
  static async syncSavedFolders(promptIfNeeded = false): Promise<{
    syncedCount: number;
    needsPermissionCount: number;
  }> {
    const folders = await DatabaseService.getAllDeviceFolders();
    let syncedCount = 0;
    let needsPermissionCount = 0;

    for (const folder of folders) {
      const handle = folder.handle as FileSystemHandleWithPerm | undefined;
      if (!handle || !handle.queryPermission) continue;

      try {
        let perm = await handle.queryPermission({ mode: 'read' });
        if (perm !== 'granted' && promptIfNeeded && handle.requestPermission) {
          perm = await handle.requestPermission({ mode: 'read' });
        }

        if (perm === 'granted') {
          const files = await this.collectAudioFilesFromHandle(handle);
          const imported = await this.importAudioFiles(files, folder.name);
          syncedCount += imported.length;
          await DatabaseService.saveDeviceFolder({
            ...folder,
            lastSyncedAt: Date.now(),
            trackCount: imported.length,
          });
        } else {
          needsPermissionCount += 1;
        }
      } catch {
        needsPermissionCount += 1;
      }
    }

    return { syncedCount, needsPermissionCount };
  }

  private static getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      try {
        const url = URL.createObjectURL(file);
        const tempAudio = new Audio();
        tempAudio.preload = 'metadata';
        tempAudio.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          resolve(tempAudio.duration || 180);
        };
        tempAudio.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(180);
        };
        tempAudio.src = url;
      } catch {
        resolve(180);
      }
    });
  }
}
