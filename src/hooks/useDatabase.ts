import { useState, useEffect, useCallback } from 'react';
import { DatabaseService, DEFAULT_SETTINGS } from '../database/db';
import { Song, Artist, Album, Playlist, DownloadItem, UserSettings, DeviceFolderRecord } from '../types';
import { DownloadManager } from '../services/download/DownloadManager';
import { LocalMusicService } from '../services/localMusic/LocalMusicService';

export function useDatabase() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [deviceFolders, setDeviceFolders] = useState<DeviceFolderRecord[]>([]);
  const [folderPermissionNeeded, setFolderPermissionNeeded] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      await DatabaseService.initDatabase();
      const [
        allSongs,
        allArtists,
        allAlbums,
        allPlaylists,
        allDownloads,
        recents,
        folders,
        userSettings,
      ] = await Promise.all([
        DatabaseService.getAllSongs(),
        DatabaseService.getAllArtists(),
        DatabaseService.getAllAlbums(),
        DatabaseService.getAllPlaylists(),
        DatabaseService.getAllDownloads(),
        DatabaseService.getRecentlyPlayedSongs(10),
        DatabaseService.getAllDeviceFolders(),
        DatabaseService.getSettings(),
      ]);

      setSongs(allSongs);
      setArtists(allArtists);
      setAlbums(allAlbums);
      setPlaylists(allPlaylists);
      setDownloads(allDownloads);
      setRecentSongs(recents);
      setDeviceFolders(folders);
      setSettings(userSettings);
    } catch (err) {
      console.error('Error loading database:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      await loadData();
      // Silently sync any saved device folders if browser permission is already granted
      try {
        const syncRes = await LocalMusicService.syncSavedFolders(false);
        if (!mounted) return;
        setFolderPermissionNeeded(syncRes.needsPermissionCount > 0);
        if (syncRes.syncedCount > 0) {
          await loadData();
        }
      } catch {
        // Ignore silent folder sync issues
      }
    };

    bootstrap();

    // Listen for download updates
    const downloadManager = DownloadManager.getInstance();
    const unsub = downloadManager.events.on('downloadUpdate', () => {
      loadData();
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [loadData]);

  const toggleFavoriteSong = useCallback(
    async (songId: string) => {
      await DatabaseService.toggleSongFavorite(songId);
      await loadData();
    },
    [loadData]
  );

  const toggleFavoriteAlbum = useCallback(
    async (albumId: string) => {
      await DatabaseService.toggleAlbumFavorite(albumId);
      await loadData();
    },
    [loadData]
  );

  const toggleFollowArtist = useCallback(
    async (artistId: string) => {
      await DatabaseService.toggleArtistFollow(artistId);
      await loadData();
    },
    [loadData]
  );

  const createPlaylist = useCallback(
    async (title: string, description: string, artwork?: string) => {
      const newPl = await DatabaseService.createPlaylist(title, description, artwork);
      await loadData();
      return newPl;
    },
    [loadData]
  );

  const addSongToPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      await DatabaseService.addSongToPlaylist(playlistId, songId);
      await loadData();
    },
    [loadData]
  );

  const removeSongFromPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      await DatabaseService.removeSongFromPlaylist(playlistId, songId);
      await loadData();
    },
    [loadData]
  );

  const deletePlaylist = useCallback(
    async (playlistId: string) => {
      await DatabaseService.deletePlaylist(playlistId);
      await loadData();
    },
    [loadData]
  );

  const incrementPlayCount = useCallback(
    async (songId: string) => {
      await DatabaseService.recordPlayback(songId, 1);
      await loadData();
    },
    [loadData]
  );

  const importLocalSongs = useCallback(
    async (imported: Song[]) => {
      await DatabaseService.importLocalSongs(imported);
      await loadData();
    },
    [loadData]
  );

  const deleteLocalSong = useCallback(
    async (songId: string) => {
      await DatabaseService.deleteLocalSong(songId);
      await loadData();
    },
    [loadData]
  );

  const scanDeviceFolder = useCallback(async () => {
    const res = await LocalMusicService.pickAndSaveDeviceFolder();
    if (res) {
      setFolderPermissionNeeded(false);
      await loadData();
    }
    return res;
  }, [loadData]);

  const resyncDeviceFolders = useCallback(async () => {
    const res = await LocalMusicService.syncSavedFolders(true);
    setFolderPermissionNeeded(res.needsPermissionCount > 0);
    await loadData();
    return res;
  }, [loadData]);

  const clearAllData = useCallback(async () => {
    await DatabaseService.clearAllData();
    await DatabaseService.initDatabase();
    await loadData();
  }, [loadData]);

  const updateSettings = useCallback(
    async (newSettings: Partial<UserSettings>) => {
      if (!settings) return;
      const merged = { ...settings, ...newSettings, localMusicEnabled: true };
      setSettings(merged);
      await DatabaseService.saveSettings(merged);
    },
    [settings]
  );

  return {
    songs,
    artists,
    albums,
    playlists,
    downloads,
    recentSongs,
    deviceFolders,
    folderPermissionNeeded,
    settings,
    isLoading,
    refreshData: loadData,
    toggleFavoriteSong,
    toggleFavorite: toggleFavoriteSong,
    toggleFavoriteAlbum,
    toggleFollowArtist,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    incrementPlayCount,
    importLocalSongs,
    deleteLocalSong,
    scanDeviceFolder,
    resyncDeviceFolders,
    clearAllData,
    updateSettings,
  };
}
