import React, { useState, useMemo } from 'react';
import { FolderPlus, Upload, Heart, ChevronRight, HardDrive, RefreshCw, Trash2 } from 'lucide-react';
import { Song, Artist, Album, Playlist, DownloadItem } from '../../types';

interface LibraryScreenProps {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
  downloads: DownloadItem[];
  onPlaySong: (song: Song, queue?: Song[]) => void;
  onSelectArtist: (artistId: string) => void;
  onSelectAlbum: (albumId: string) => void;
  onSelectPlaylist: (playlistId: string) => void;
  onOpenCreatePlaylist: () => void;
  onOpenImportModal: () => void;
  onToggleFavorite: (id: string) => void;
  onDeleteLocalSong?: (id: string) => void;
  onResyncFolders?: () => void;
  folderPermissionNeeded?: boolean;
  themeMode?: string;
}

type LibraryFilter = 'ALL' | 'FAVORITES' | 'PLAYLISTS' | 'ALBUMS' | 'LOCAL';

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  songs,
  albums,
  playlists,
  onPlaySong,
  onSelectAlbum,
  onSelectPlaylist,
  onOpenCreatePlaylist,
  onOpenImportModal,
  onToggleFavorite,
  onDeleteLocalSong,
  onResyncFolders,
  folderPermissionNeeded,
  themeMode,
}) => {
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>('ALL');

  const isLight = themeMode === 'LIGHT';
  const isAmoled = themeMode === 'AMOLED';

  const bgClass = isLight
    ? 'bg-[#F5EFEA] text-[#140E10]'
    : isAmoled
    ? 'bg-[#030203] text-[#FAF5F2]'
    : 'bg-[#0A0809] text-[#FAF5F2]';

  const rowSurface = isLight
    ? 'bg-[#FFFDFB] shadow-sm hover:bg-[#ECE2DC] border border-red-900/10'
    : 'bg-[#141012] hover:bg-[#201619] border border-red-500/10';

  const mutedText = isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]';

  const localCount = useMemo(() => songs.filter((s) => s.isLocal).length, [songs]);

  const filterTabs: { id: LibraryFilter; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'FAVORITES', label: 'Favorites' },
    { id: 'PLAYLISTS', label: 'Playlists' },
    { id: 'ALBUMS', label: 'Albums' },
    { id: 'LOCAL', label: `Local (${localCount})` },
  ];

  const displayedSongs = useMemo(() => {
    if (activeFilter === 'FAVORITES') return songs.filter((s) => s.isFavorite);
    if (activeFilter === 'LOCAL') return songs.filter((s) => s.isLocal);
    return songs;
  }, [songs, activeFilter]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-full h-full overflow-y-auto scroll-smooth snap-y snap-proximity px-4 pt-4 pb-6 space-y-5 select-none transition-colors ${bgClass}`}>
      {/* Header & Clean Actions */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display">Library</h1>
          <p className={`text-xs mt-0.5 tabular-nums ${mutedText}`}>
            {playlists.length} playlists · {songs.length} tracks · {localCount} local
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenImportModal}
            className={`min-w-[44px] min-h-[40px] px-3 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-colors ${rowSurface}`}
            title="Add Local Device Music"
          >
            <Upload size={14} className="text-[#EF4444]" />
            <span>Device</span>
          </button>

          <button
            onClick={onOpenCreatePlaylist}
            className="min-h-[40px] px-3.5 rounded-full bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-950/45 active:scale-95 transition-all"
          >
            <FolderPlus size={14} />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3.5 min-h-[36px] rounded-full text-xs font-semibold shrink-0 whitespace-nowrap transition-all ${
              activeFilter === tab.id
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

      {/* Playlists Vertical Sliding List */}
      {(activeFilter === 'ALL' || activeFilter === 'PLAYLISTS') && (
        <section>
          <h3 className="text-sm font-bold font-display mb-2.5">Playlists</h3>
          <div className="flex flex-col space-y-2">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => onSelectPlaylist(pl.id)}
                className={`snap-start w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all min-h-[64px] active:scale-[0.99] ${rowSurface}`}
              >
                <img
                  src={pl.artwork}
                  alt={pl.title}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover shrink-0 bg-[#1B1316]"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{pl.title}</h4>
                  <p className={`text-xs truncate mt-0.5 tabular-nums ${mutedText}`}>
                    Playlist · {pl.songIds.length} songs
                  </p>
                </div>
                <ChevronRight size={18} className={`${mutedText} shrink-0`} />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Albums Vertical Sliding List */}
      {(activeFilter === 'ALL' || activeFilter === 'ALBUMS') && (
        <section>
          <h3 className="text-sm font-bold font-display mb-2.5">Albums</h3>
          <div className="flex flex-col space-y-2">
            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => onSelectAlbum(album.id)}
                className={`snap-start w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all min-h-[64px] active:scale-[0.99] ${rowSurface}`}
              >
                <img
                  src={album.artwork}
                  alt={album.title}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover shrink-0 bg-[#1B1316]"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{album.title}</h4>
                  <p className={`text-xs truncate mt-0.5 tabular-nums ${mutedText}`}>
                    {album.artist} · {album.year}
                  </p>
                </div>
                <ChevronRight size={18} className={`${mutedText} shrink-0`} />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Songs Vertical Sliding List */}
      {(activeFilter === 'ALL' || activeFilter === 'FAVORITES' || activeFilter === 'LOCAL') && (
        <section className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold font-display">
                {activeFilter === 'FAVORITES'
                  ? 'Favorite Tracks'
                  : activeFilter === 'LOCAL'
                  ? 'Local Device Tracks'
                  : 'All Tracks'}
              </h3>
              {activeFilter === 'LOCAL' && (
                <p className={`text-[11px] ${mutedText}`}>
                  Permanently enabled · Stored offline in device database
                </p>
              )}
            </div>

            {activeFilter === 'LOCAL' && (
              <div className="flex items-center gap-2">
                {folderPermissionNeeded && onResyncFolders && (
                  <button
                    onClick={onResyncFolders}
                    className={`min-h-[34px] px-2.5 rounded-full text-xs font-semibold flex items-center gap-1 ${rowSurface}`}
                  >
                    <RefreshCw size={12} className="text-[#EF4444]" />
                    <span>Sync</span>
                  </button>
                )}
                <button
                  onClick={onOpenImportModal}
                  className="min-h-[34px] px-3 rounded-full bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Upload size={12} />
                  <span>Add</span>
                </button>
              </div>
            )}
          </div>

          {displayedSongs.length === 0 ? (
            <div className={`text-center py-10 px-4 text-xs rounded-2xl space-y-2 ${rowSurface} ${mutedText}`}>
              <HardDrive size={24} className="mx-auto text-[#EF4444] opacity-80" />
              <p>
                {activeFilter === 'LOCAL'
                  ? 'No local files added yet. Tap Add above to load MP3, WAV, M4A, or FLAC files permanently.'
                  : 'No tracks in this view yet.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              {displayedSongs.map((song, idx) => (
                <div
                  key={song.id}
                  onClick={() => onPlaySong(song, displayedSongs)}
                  className={`snap-start flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-colors min-h-[62px] active:scale-[0.99] ${rowSurface}`}
                >
                  <span className={`w-5 text-center text-xs font-mono tabular-nums shrink-0 ${mutedText}`}>
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <img
                    src={song.artwork}
                    alt={song.title}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{song.title}</h4>
                    <p className={`text-xs truncate tabular-nums ${mutedText}`}>
                      {song.artist} · {formatDuration(song.duration)}
                      {song.isLocal ? ` · ${song.fileSize || 'Local'}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center">
                    {song.isLocal && onDeleteLocalSong && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLocalSong(song.id);
                        }}
                        className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full ${mutedText} hover:text-rose-400`}
                        aria-label="Remove local track"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(song.id);
                      }}
                      className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full ${mutedText} hover:text-[#EF4444]`}
                      aria-label="Favorite"
                    >
                      <Heart
                        size={17}
                        className={song.isFavorite ? 'text-[#DC2626] fill-[#DC2626]' : ''}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
