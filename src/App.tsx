import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useDatabase } from './hooks/useDatabase';
import {
  ScreenType,
  DevicePlatform,
  Song,
  ThemeMode,
} from './types';
import { THEME_COLORS } from './theme';

// Mobile OS Shell
import { MobileOSShell, OSViewMode } from './components/os/MobileOSShell';

// Navigation Components
import { BottomNavigation } from './components/navigation/BottomNavigation';
import { TabletSidebar } from './components/navigation/TabletSidebar';

// Player Components
import { MiniPlayer } from './components/player/MiniPlayer';
import { FullPlayer } from './components/player/FullPlayer';
import { EqualizerModal } from './components/player/EqualizerModal';

// Screen Components
import { HomeScreen } from './components/screens/HomeScreen';
import { SearchScreen } from './components/screens/SearchScreen';
import { LibraryScreen } from './components/screens/LibraryScreen';
import { ArtistScreen } from './components/screens/ArtistScreen';
import { AlbumScreen } from './components/screens/AlbumScreen';
import { PlaylistScreen } from './components/screens/PlaylistScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

// Brand & PWA
import { AppSplashOverlay } from './components/brand/AppSplashOverlay';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

// Modals
import { LocalImportModal } from './components/modals/LocalImportModal';
import { CreatePlaylistModal } from './components/modals/CreatePlaylistModal';
import { InterruptionSimulatorModal } from './components/modals/InterruptionSimulatorModal';

export default function App() {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('HOME');
  const [returnScreen, setReturnScreen] = useState<'HOME' | 'SEARCH' | 'LIBRARY'>('HOME');
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Mobile OS Environment State
  const [platform, setPlatform] = useState<DevicePlatform>('ANDROID');
  const [osView, setOsView] = useState<OSViewMode>('APP');
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [incomingCallActive, setIncomingCallActive] = useState(false);
  const [wasPlayingBeforeCall, setWasPlayingBeforeCall] = useState(false);

  // Player & Modals
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isOsEqualizerOpen, setIsOsEqualizerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isInterruptionModalOpen, setIsInterruptionModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current !== null) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3000);
  }, []);

  // Audio Engine Hook
  const audio = useAudioPlayer();

  // Database Hook
  const db = useDatabase();

  // Handle Theme
  const themeMode: ThemeMode = db.settings?.theme || 'DARK';
  const themeColors = THEME_COLORS[themeMode] || THEME_COLORS.DARK;

  // Sync initial queue and keep audio engine metadata synced with database updates
  useEffect(() => {
    if (db.songs.length > 0) {
      if (!audio.currentSong) {
        audio.setQueue(db.songs, 0);
      } else {
        audio.syncSongsMetadata(db.songs);
      }
    }
  }, [db.songs]);

  // Screen Navigation Helpers
  const rememberTabOrigin = () => {
    if (currentScreen === 'HOME' || currentScreen === 'SEARCH' || currentScreen === 'LIBRARY') {
      setReturnScreen(currentScreen);
    }
  };

  const navigateToArtist = (artistId: string) => {
    rememberTabOrigin();
    setSelectedArtistId(artistId);
    setCurrentScreen('ARTIST_DETAIL');
  };

  const navigateToAlbum = (albumId: string) => {
    rememberTabOrigin();
    setSelectedAlbumId(albumId);
    setCurrentScreen('ALBUM_DETAIL');
  };

  const navigateToPlaylist = (playlistId: string) => {
    rememberTabOrigin();
    setSelectedPlaylistId(playlistId);
    setCurrentScreen('PLAYLIST_DETAIL');
  };

  const exitDetailScreen = () => {
    setCurrentScreen(returnScreen);
    setSelectedArtistId(null);
    setSelectedAlbumId(null);
    setSelectedPlaylistId(null);
  };

  const handleNavigateBack = () => {
    if (isFullPlayerOpen) {
      setIsFullPlayerOpen(false);
      return;
    }
    if (
      currentScreen === 'ARTIST_DETAIL' ||
      currentScreen === 'ALBUM_DETAIL' ||
      currentScreen === 'PLAYLIST_DETAIL'
    ) {
      exitDetailScreen();
      return;
    }
    if (osView === 'APP' && currentScreen !== 'HOME') {
      setCurrentScreen('HOME');
      return;
    }
    if (osView === 'RECENTS') {
      setOsView('APP');
      return;
    }
    setOsView('HOME');
  };

  // Audio Actions
  const handlePlaySong = (song: Song, newQueue?: Song[]) => {
    if (newQueue) {
      const index = newQueue.findIndex((s) => s.id === song.id);
      audio.playSong(song, newQueue, index >= 0 ? index : 0);
    } else {
      audio.playSong(song);
    }
    db.incrementPlayCount(song.id);
  };

  const handlePlayAll = (songsToPlay: Song[]) => {
    if (songsToPlay.length > 0) {
      audio.playSong(songsToPlay[0], songsToPlay, 0);
      db.incrementPlayCount(songsToPlay[0].id);
      showToast(`Playing ${songsToPlay.length} tracks`);
    }
  };

  const handleShuffleAll = (songsToShuffle: Song[]) => {
    if (songsToShuffle.length > 0) {
      const shuffled = [...songsToShuffle];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      if (!audio.shuffleEnabled) {
        audio.toggleShuffle();
      }
      audio.playSong(shuffled[0], shuffled, 0);
      db.incrementPlayCount(shuffled[0].id);
      showToast(`Shuffling ${songsToShuffle.length} tracks`);
    }
  };

  const handleToggleFavorite = async (songId: string) => {
    const targetSong = db.songs.find((s) => s.id === songId);
    const isNowFavorite = await db.toggleFavorite(songId);
    if (targetSong) {
      showToast(
        isNowFavorite ? `Added "${targetSong.title}" to Favorites` : 'Removed from Favorites'
      );
    }
  };

  const handleCycleTheme = () => {
    const order: ThemeMode[] = ['DARK', 'AMOLED', 'LIGHT'];
    const idx = order.indexOf(themeMode);
    const nextTheme = order[(idx + 1) % order.length];
    db.updateSettings({ theme: nextTheme });
    showToast(`OS Theme: ${nextTheme}`);
  };

  // Interruption simulator handler
  const handleTriggerInterruption = (
    type: 'PHONE_CALL' | 'HEADSET_UNPLUG' | 'AIRPODS_DISCONNECT' | 'ALARM_DUCK'
  ) => {
    if (type === 'PHONE_CALL') {
      setWasPlayingBeforeCall(audio.isPlaying);
      audio.handleAudioInterruption('BEGAN');
      setIsInterruptionModalOpen(false);
      setIncomingCallActive(true);
    } else if (type === 'HEADSET_UNPLUG') {
      audio.handleAudioInterruption('BEGAN');
      showToast('Headset Unplugged: Audio paused immediately');
    } else if (type === 'AIRPODS_DISCONNECT') {
      audio.handleAudioInterruption('BEGAN');
      showToast('Bluetooth Disconnected: Playback stopped');
    } else if (type === 'ALARM_DUCK') {
      audio.triggerInterruption('ALARM_DUCK');
      showToast('System Alert: Audio ducked to 20% for 3s');
    }
  };

  const handleAnswerCall = () => {
    audio.handleAudioInterruption('BEGAN');
  };

  const handleDeclineCall = () => {
    setIncomingCallActive(false);
    if (wasPlayingBeforeCall) {
      audio.handleAudioInterruption('ENDED');
    }
    setWasPlayingBeforeCall(false);
  };

  // Selected Artist / Album / Playlist objects
  const selectedArtist = db.artists.find((a) => a.id === selectedArtistId);
  const selectedAlbum = db.albums.find((a) => a.id === selectedAlbumId);
  const selectedPlaylist = db.playlists.find((p) => p.id === selectedPlaylistId);

  return (
    <MobileOSShell
      platform={platform}
      onSelectPlatform={(p) => {
        setPlatform(p);
        showToast(
          p === 'ANDROID'
            ? 'Switched to Android 15 OS'
            : p === 'IOS'
            ? 'Switched to iOS 18'
            : 'Expanded Full Screen'
        );
      }}
      osView={osView}
      onChangeOsView={(v) => {
        setOsView(v);
        setIsControlCenterOpen(false);
      }}
      isControlCenterOpen={isControlCenterOpen}
      onToggleControlCenter={setIsControlCenterOpen}
      incomingCallActive={incomingCallActive}
      onAnswerCall={handleAnswerCall}
      onDeclineCall={handleDeclineCall}
      currentSong={audio.currentSong}
      isPlaying={audio.isPlaying}
      position={audio.position}
      duration={audio.duration}
      volume={audio.volume}
      equalizerPreset={audio.equalizerPreset}
      themeMode={themeMode}
      onTogglePlay={audio.togglePlay}
      onNext={audio.next}
      onPrevious={audio.previous}
      onSetVolume={audio.setVolume}
      onCycleTheme={handleCycleTheme}
      onOpenAppScreen={(screen) => {
        if (osView !== 'APP') {
          setIsSplashVisible(true);
        }
        setCurrentScreen(screen);
        setSelectedArtistId(null);
        setSelectedAlbumId(null);
        setSelectedPlaylistId(null);
        setOsView('APP');
      }}
      onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
      onOpenEqualizer={() => setIsOsEqualizerOpen(true)}
      onOpenImport={() => setIsImportModalOpen(true)}
      onOpenInterruptionLab={() => setIsInterruptionModalOpen(true)}
      onTriggerCall={() => handleTriggerInterruption('PHONE_CALL')}
      onNavigateBack={handleNavigateBack}
    >
      <div
        className="w-full h-full flex flex-col justify-between overflow-hidden transition-colors duration-300 relative"
        style={{
          backgroundColor: themeColors.background,
          color: themeColors.textPrimary,
        }}
      >
        {/* Main App Container */}
        <div className="flex-1 flex overflow-hidden relative min-h-0">
          {/* Tablet Sidebar only in Expanded Full Screen Desktop Mode */}
          {platform === 'RESPONSIVE' && (
            <TabletSidebar
              currentScreen={currentScreen}
              onNavigate={(screen) => {
                setCurrentScreen(screen);
                setSelectedArtistId(null);
                setSelectedAlbumId(null);
                setSelectedPlaylistId(null);
              }}
              playlists={db.playlists}
              onSelectPlaylist={navigateToPlaylist}
              onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
              themeMode={themeMode}
            />
          )}

          {/* Dynamic Screen View */}
          <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
            {currentScreen === 'HOME' && (
              <HomeScreen
                songs={db.songs}
                artists={db.artists}
                albums={db.albums}
                playlists={db.playlists}
                recentSongs={db.recentSongs}
                onPlaySong={handlePlaySong}
                onSelectArtist={navigateToArtist}
                onSelectAlbum={navigateToAlbum}
                onSelectPlaylist={navigateToPlaylist}
                onToggleFavorite={handleToggleFavorite}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onResyncFolders={async () => {
                  const res = await db.resyncDeviceFolders();
                  showToast(`Synced ${res.syncedCount} local track(s)`);
                }}
                folderPermissionNeeded={db.folderPermissionNeeded}
                currentSongId={audio.currentSong?.id}
                isPlaying={audio.isPlaying}
                themeMode={themeMode}
              />
            )}

            {currentScreen === 'SEARCH' && (
              <SearchScreen
                songs={db.songs}
                artists={db.artists}
                albums={db.albums}
                playlists={db.playlists}
                onPlaySong={handlePlaySong}
                onSelectArtist={navigateToArtist}
                onSelectAlbum={navigateToAlbum}
                onSelectPlaylist={navigateToPlaylist}
                themeMode={themeMode}
              />
            )}

            {currentScreen === 'LIBRARY' && (
              <LibraryScreen
                songs={db.songs}
                artists={db.artists}
                albums={db.albums}
                playlists={db.playlists}
                downloads={db.downloads}
                onPlaySong={handlePlaySong}
                onSelectArtist={navigateToArtist}
                onSelectAlbum={navigateToAlbum}
                onSelectPlaylist={navigateToPlaylist}
                onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onToggleFavorite={handleToggleFavorite}
                onDeleteLocalSong={async (id) => {
                  await db.deleteLocalSong(id);
                  showToast('Removed local track from device library');
                }}
                onResyncFolders={async () => {
                  const res = await db.resyncDeviceFolders();
                  showToast(`Synced ${res.syncedCount} local track(s)`);
                }}
                folderPermissionNeeded={db.folderPermissionNeeded}
                themeMode={themeMode}
              />
            )}

            {currentScreen === 'SETTINGS' && (
              <SettingsScreen
                settings={db.settings}
                onUpdateSettings={db.updateSettings}
                onTriggerInterruption={handleTriggerInterruption}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onClearCache={async () => {
                  await db.clearAllData();
                  showToast('Stream cache cleared (local music kept)');
                }}
                localSongsCount={db.songs.filter((s) => s.isLocal).length}
                deviceFoldersCount={db.deviceFolders.length}
                themeMode={themeMode}
              />
            )}

            {currentScreen === 'ARTIST_DETAIL' && selectedArtist && (
              <ArtistScreen
                artist={selectedArtist}
                songs={db.songs}
                albums={db.albums}
                onBack={exitDetailScreen}
                onPlaySong={handlePlaySong}
                onPlayAll={handlePlayAll}
                onShuffleAll={handleShuffleAll}
                onSelectAlbum={navigateToAlbum}
                onToggleFollow={db.toggleFollowArtist}
                onToggleFavorite={handleToggleFavorite}
                themeMode={themeMode}
              />
            )}

            {currentScreen === 'ALBUM_DETAIL' && selectedAlbum && (
              <AlbumScreen
                album={selectedAlbum}
                songs={db.songs}
                onBack={exitDetailScreen}
                onPlaySong={handlePlaySong}
                onPlayAll={handlePlayAll}
                onShuffleAll={handleShuffleAll}
                onToggleFavorite={handleToggleFavorite}
                onToggleFavoriteAlbum={db.toggleFavoriteAlbum}
                themeMode={themeMode}
              />
            )}

            {currentScreen === 'PLAYLIST_DETAIL' && selectedPlaylist && (
              <PlaylistScreen
                playlist={selectedPlaylist}
                allSongs={db.songs}
                onBack={exitDetailScreen}
                onPlaySong={handlePlaySong}
                onPlayAll={handlePlayAll}
                onShuffleAll={handleShuffleAll}
                onRemoveSongFromPlaylist={db.removeSongFromPlaylist}
                onAddSongToPlaylist={db.addSongToPlaylist}
                onDeletePlaylist={db.deletePlaylist}
                onToggleFavorite={handleToggleFavorite}
                themeMode={themeMode}
              />
            )}
          </main>
        </div>

        {/* Floating MiniPlayer & Bottom Navigation */}
        <div className="w-full flex flex-col items-center shrink-0">
          <MiniPlayer
            currentSong={audio.currentSong}
            isPlaying={audio.isPlaying}
            position={audio.position}
            duration={audio.duration}
            onTogglePlay={audio.togglePlay}
            onNext={audio.next}
            onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
            onToggleFavorite={handleToggleFavorite}
            themeMode={themeMode}
          />

          <BottomNavigation
            currentScreen={currentScreen}
            onNavigate={(screen) => {
              setCurrentScreen(screen);
              setSelectedArtistId(null);
              setSelectedAlbumId(null);
              setSelectedPlaylistId(null);
            }}
            favoritesCount={db.songs.filter((s) => s.isFavorite).length}
            themeMode={themeMode}
          />
        </div>

        {/* Full-Screen Immersive Player */}
        <FullPlayer
          isOpen={isFullPlayerOpen}
          onClose={() => setIsFullPlayerOpen(false)}
          currentSong={audio.currentSong}
          currentIndex={audio.currentIndex}
          isPlaying={audio.isPlaying}
          position={audio.position}
          duration={audio.duration}
          volume={audio.volume}
          playbackRate={audio.playbackRate}
          shuffleEnabled={audio.shuffleEnabled}
          repeatMode={audio.repeatMode}
          equalizerPreset={audio.equalizerPreset}
          queue={audio.queue}
          upNext={audio.upNext}
          onTogglePlay={audio.togglePlay}
          onNext={audio.next}
          onPrevious={audio.previous}
          onSeek={audio.seek}
          onSetVolume={audio.setVolume}
          onSetPlaybackRate={audio.setPlaybackRate}
          onToggleShuffle={audio.toggleShuffle}
          onCycleRepeatMode={audio.cycleRepeatMode}
          onToggleFavorite={handleToggleFavorite}
          onPlaySong={(s) => audio.playSong(s)}
          onRemoveFromQueue={audio.removeFromQueue}
          onReorderQueue={audio.reorderQueue}
          onClearQueue={audio.clearQueue}
          onSelectEqualizerPreset={audio.setEqualizerPreset}
          onUpdateEqualizerBands={audio.setEqualizerBands}
          getEqualizerBands={audio.getEqualizerBands}
          getFrequencyData={audio.getFrequencyData}
          getWaveformData={audio.getWaveformData}
          onShowToast={showToast}
          themeMode={themeMode}
        />

        {/* Standalone OS Launcher Equalizer Modal */}
        <EqualizerModal
          isOpen={isOsEqualizerOpen}
          onClose={() => setIsOsEqualizerOpen(false)}
          currentPreset={audio.equalizerPreset}
          onSelectPreset={audio.setEqualizerPreset}
          getBands={audio.getEqualizerBands}
          onUpdateBands={audio.setEqualizerBands}
          themeMode={themeMode}
        />

        {/* Modals */}
        <LocalImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportComplete={async (newSongs) => {
            await db.refreshData();
            if (newSongs.length > 0) {
              showToast(`Saved ${newSongs.length} local audio track(s)`);
            }
          }}
          onFolderScanComplete={() => db.refreshData()}
          themeMode={themeMode}
        />

        <CreatePlaylistModal
          isOpen={isCreatePlaylistOpen}
          onClose={() => setIsCreatePlaylistOpen(false)}
          onCreate={(title, desc, artwork) => {
            db.createPlaylist(title, desc, artwork);
            showToast(`Mixtape "${title}" created`);
          }}
          themeMode={themeMode}
        />

        <InterruptionSimulatorModal
          isOpen={isInterruptionModalOpen}
          onClose={() => setIsInterruptionModalOpen(false)}
          currentSong={audio.currentSong}
          isPlaying={audio.isPlaying}
          position={audio.position}
          duration={audio.duration}
          activePlatform={platform}
          onTogglePlay={audio.togglePlay}
          onNext={audio.next}
          onPrevious={audio.previous}
          onTriggerInterruption={handleTriggerInterruption}
        />

        {/* Animated Logo Launch Screen */}
        <AppSplashOverlay
          visible={isSplashVisible}
          onComplete={() => setIsSplashVisible(false)}
          themeMode={themeMode}
        />

        {/* Offline Mode Indicator */}
        <OfflineIndicator />

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[75] max-w-[90%] px-4 py-2 rounded-2xl bg-[#DC2626] text-white font-medium text-xs shadow-2xl shadow-red-950/80 border border-red-400/30 animate-fade-in flex items-center gap-2 whitespace-nowrap truncate">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </MobileOSShell>
  );
}
