import React, { useState } from 'react';
import { Play, Pause, Heart, ChevronRight, ListMusic, Disc, User, HardDrive, FolderPlus, RefreshCw } from 'lucide-react';
import { Song, Artist, Album, Playlist } from '../../types';
import { SonoraLogo } from '../brand/SonoraLogo';

interface HomeScreenProps {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
  recentSongs: Song[];
  onPlaySong: (song: Song, queue?: Song[]) => void;
  onSelectArtist: (artistId: string) => void;
  onSelectAlbum: (albumId: string) => void;
  onSelectPlaylist: (playlistId: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenImportModal?: () => void;
  onResyncFolders?: () => void;
  folderPermissionNeeded?: boolean;
  currentSongId?: string;
  isPlaying?: boolean;
  themeMode?: string;
}

type HomeFeedTab = 'TRACKS' | 'LOCAL' | 'RECENT' | 'PLAYLISTS' | 'ARTISTS';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  songs,
  artists,
  playlists,
  recentSongs,
  onPlaySong,
  onSelectArtist,
  onSelectPlaylist,
  onToggleFavorite,
  onOpenImportModal,
  onResyncFolders,
  folderPermissionNeeded,
  currentSongId,
  isPlaying,
  themeMode,
}) => {
  const [activeTab, setActiveTab] = useState<HomeFeedTab>('TRACKS');

  const isLight = themeMode === 'LIGHT';
  const isAmoled = themeMode === 'AMOLED';

  const localSongs = songs.filter((s) => s.isLocal);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const bgClass = isLight
    ? 'bg-[#F5EFEA] text-[#140E10]'
    : isAmoled
    ? 'bg-[#030203] text-[#FAF5F2]'
    : 'bg-[#0A0809] text-[#FAF5F2]';

  const rowSurface = isLight
    ? 'bg-[#FFFDFB] shadow-sm hover:bg-[#ECE2DC] border border-red-900/10'
    : 'bg-[#141012] hover:bg-[#201619] border border-red-500/10';

  const activeRowSurface = isLight
    ? 'bg-[#FDE2E4] border border-[#DC2626]/50 shadow-sm'
    : 'bg-[#260E12] border border-[#EF4444]/45 shadow-lg shadow-red-950/40';

  const mutedText = isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]';

  const feedTabs: { id: HomeFeedTab; label: string }[] = [
    { id: 'TRACKS', label: 'All Tracks' },
    { id: 'LOCAL', label: `On Device (${localSongs.length})` },
    { id: 'RECENT', label: 'Recent' },
    { id: 'PLAYLISTS', label: 'Playlists' },
    { id: 'ARTISTS', label: 'Artists' },
  ];

  const renderTrackRow = (song: Song, index: number, queueList: Song[]) => {
    const isCurrent = currentSongId === song.id;
    return (
      <div
        key={song.id}
        onClick={() => onPlaySong(song, queueList)}
        className={`snap-start flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all min-h-[64px] active:scale-[0.99] ${
          isCurrent ? activeRowSurface : rowSurface
        }`}
      >
        <div className="w-6 shrink-0 flex items-center justify-center">
          {isCurrent && isPlaying ? (
            <div className="flex items-end gap-[2px] h-3.5">
              <span className="w-[3px] bg-[#EF4444] rounded-full animate-music-bar-1" />
              <span className="w-[3px] bg-[#DC2626] rounded-full animate-music-bar-2" />
              <span className="w-[3px] bg-[#F87171] rounded-full animate-music-bar-3" />
            </div>
          ) : (
            <span
              className={`text-xs font-mono tabular-nums ${
                isCurrent ? 'text-[#EF4444] font-bold' : mutedText
              }`}
            >
              {(index + 1).toString().padStart(2, '0')}
            </span>
          )}
        </div>

        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#1B1316]">
          <img
            src={song.artwork}
            alt={song.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          {isCurrent && (
            <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
              {isPlaying ? (
                <Pause size={15} className="text-[#FAF5F2]" />
              ) : (
                <Play size={15} className="text-[#FAF5F2] ml-0.5 fill-[#FAF5F2]" />
              )}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-[#EF4444]' : ''}`}>
            {song.title}
          </p>
          <p className={`text-xs truncate mt-0.5 tabular-nums ${mutedText}`}>
            {song.artist} · {formatDuration(song.duration)}
            {song.isLocal ? ' · Tape' : ''}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(song.id);
          }}
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full ${mutedText} hover:text-[#EF4444] transition-colors`}
          aria-label="Favorite"
        >
          <Heart
            size={18}
            className={song.isFavorite ? 'text-[#DC2626] fill-[#DC2626]' : ''}
          />
        </button>
      </div>
    );
  };

  return (
    <div
      className={`w-full h-full overflow-y-auto scroll-smooth snap-y snap-proximity px-4 pt-4 pb-6 space-y-5 select-none transition-colors ${bgClass}`}
    >
      {/* Retro Red & Black Brand Header */}
      <header className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-3.5 min-w-0">
          <SonoraLogo size={42} roundedClass="rounded-2xl" />
          <div className="min-w-0">
            <h1
              className={`text-xl font-extrabold font-display tracking-[0.16em] uppercase leading-none bg-clip-text text-transparent ${
                isLight
                  ? 'bg-gradient-to-r from-[#450A0A] via-[#DC2626] to-[#991B1B]'
                  : 'bg-gradient-to-r from-[#FAF5F2] via-[#FCA5A5] to-[#DC2626]'
              }`}
            >
              WALKTONE
            </h1>
            <p className={`text-[10px] font-mono tracking-[0.18em] uppercase mt-1 ${mutedText}`}>
              Analog Hi-Fi
            </p>
          </div>
        </div>
      </header>

      {/* Vertical Feed Selector */}
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {feedTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 min-h-[36px] rounded-full text-xs font-semibold shrink-0 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#DC2626] text-white shadow-md shadow-red-950/45'
                : isLight
                ? 'bg-[#FFFDFB] text-[#5F4E53] hover:text-[#140E10] border border-red-900/10'
                : 'bg-[#141012] text-[#B8A9AD] hover:text-[#FAF5F2] border border-red-500/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vertical Sliding Music List Body */}
      {activeTab === 'TRACKS' && (
        <section className="space-y-2 pb-2">
          <div className="flex items-center justify-between px-0.5 mb-1">
            <h3 className="text-sm font-bold font-display flex items-center gap-1.5">
              <ListMusic size={15} className="text-[#EF4444]" />
              <span>Tape Deck Feed</span>
            </h3>
            <span className={`text-[11px] font-mono tabular-nums ${mutedText}`}>
              {songs.length} tracks
            </span>
          </div>
          <div className="flex flex-col space-y-2">
            {songs.map((song, idx) => renderTrackRow(song, idx, songs))}
          </div>
        </section>
      )}

      {activeTab === 'LOCAL' && (
        <section className="space-y-3 pb-2">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <div>
              <h3 className="text-sm font-bold font-display flex items-center gap-1.5">
                <HardDrive size={15} className="text-[#EF4444]" />
                <span>Device Music</span>
              </h3>
              <p className={`text-[11px] ${mutedText}`}>
                Permanently enabled · Stored offline
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {folderPermissionNeeded && onResyncFolders && (
                <button
                  onClick={onResyncFolders}
                  className={`min-h-[36px] px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 ${rowSurface}`}
                >
                  <RefreshCw size={13} className="text-[#EF4444]" />
                  <span>Sync</span>
                </button>
              )}
              {onOpenImportModal && (
                <button
                  onClick={onOpenImportModal}
                  className="min-h-[36px] px-3.5 rounded-full bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-950/45"
                >
                  <FolderPlus size={14} />
                  <span>Add Local</span>
                </button>
              )}
            </div>
          </div>

          {localSongs.length === 0 ? (
            <div className={`text-center py-10 px-4 rounded-2xl space-y-3 ${rowSurface}`}>
              <HardDrive size={28} className="mx-auto text-[#EF4444] opacity-80" />
              <div>
                <p className="text-sm font-semibold">No device tracks added yet</p>
                <p className={`text-xs mt-1 ${mutedText}`}>
                  Add MP3, WAV, M4A, FLAC, or scan a music folder to keep tracks permanently offline.
                </p>
              </div>
              {onOpenImportModal && (
                <button
                  onClick={onOpenImportModal}
                  className="min-h-[42px] px-5 rounded-full bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-semibold inline-flex items-center gap-2"
                >
                  <FolderPlus size={15} />
                  <span>Add Music from Device</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              {localSongs.map((song, idx) => renderTrackRow(song, idx, localSongs))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'RECENT' && (
        <section className="space-y-2 pb-2">
          <div className="flex items-center justify-between px-0.5 mb-1">
            <h3 className="text-sm font-bold font-display">Recently Played</h3>
            <span className={`text-[11px] font-mono tabular-nums ${mutedText}`}>
              {recentSongs.length} tracks
            </span>
          </div>
          {recentSongs.length === 0 ? (
            <div className={`text-center py-10 px-4 rounded-2xl space-y-2 ${rowSurface}`}>
              <Disc size={26} className="mx-auto text-[#EF4444] opacity-80" />
              <p className="text-sm font-semibold">No listening history yet</p>
              <p className={`text-xs ${mutedText}`}>
                Play any track and your recently spun tapes will appear here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              {recentSongs.map((song, idx) => renderTrackRow(song, idx, recentSongs))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'PLAYLISTS' && (
        <section className="space-y-2 pb-2">
          <div className="flex items-center justify-between px-0.5 mb-1">
            <h3 className="text-sm font-bold font-display flex items-center gap-1.5">
              <Disc size={15} className="text-[#EF4444]" />
              <span>Playlists</span>
            </h3>
            <span className={`text-[11px] font-mono tabular-nums ${mutedText}`}>
              {playlists.length} mixes
            </span>
          </div>
          <div className="flex flex-col space-y-2">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => onSelectPlaylist(pl.id)}
                className={`snap-start w-full flex items-center gap-3.5 p-2.5 rounded-2xl text-left transition-all min-h-[68px] active:scale-[0.99] ${rowSurface}`}
              >
                <img
                  src={pl.artwork}
                  alt={pl.title}
                  referrerPolicy="no-referrer"
                  className="w-13 h-13 rounded-xl object-cover shrink-0 bg-[#1B1316]"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{pl.title}</h4>
                  <p className={`text-xs truncate mt-0.5 ${mutedText}`}>
                    {pl.songIds.length} songs · {pl.description}
                  </p>
                </div>
                <ChevronRight size={18} className={`${mutedText} shrink-0`} />
              </button>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'ARTISTS' && (
        <section className="space-y-2 pb-2">
          <div className="flex items-center justify-between px-0.5 mb-1">
            <h3 className="text-sm font-bold font-display flex items-center gap-1.5">
              <User size={15} className="text-[#EF4444]" />
              <span>Artists</span>
            </h3>
            <span className={`text-[11px] font-mono tabular-nums ${mutedText}`}>
              {artists.length} artists
            </span>
          </div>
          <div className="flex flex-col space-y-2">
            {artists.map((artist) => (
              <button
                key={artist.id}
                onClick={() => onSelectArtist(artist.id)}
                className={`snap-start w-full flex items-center gap-3.5 p-2.5 rounded-2xl text-left transition-all min-h-[68px] active:scale-[0.99] ${rowSurface}`}
              >
                <img
                  src={artist.artwork}
                  alt={artist.name}
                  referrerPolicy="no-referrer"
                  className="w-13 h-13 rounded-full object-cover shrink-0 border border-red-500/25"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{artist.name}</h4>
                  <p className={`text-xs truncate mt-0.5 tabular-nums ${mutedText}`}>
                    {(artist.monthlyListeners / 1000000).toFixed(1)}M listeners · {artist.genres.slice(0, 2).join(', ')}
                  </p>
                </div>
                <ChevronRight size={18} className={`${mutedText} shrink-0`} />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
