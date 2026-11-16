import React from 'react';
import { ArrowLeft, Play, Shuffle, Heart } from 'lucide-react';
import { Album, Song } from '../../types';

interface AlbumScreenProps {
  album: Album;
  songs: Song[];
  onBack: () => void;
  onPlaySong: (song: Song, queue?: Song[]) => void;
  onPlayAll: (songs: Song[]) => void;
  onShuffleAll: (songs: Song[]) => void;
  onToggleFavorite: (songId: string) => void;
  onToggleFavoriteAlbum: (albumId: string) => void;
  onDownloadSong?: (song: Song) => void;
  themeMode?: string;
}

export const AlbumScreen: React.FC<AlbumScreenProps> = ({
  album,
  songs,
  onBack,
  onPlaySong,
  onPlayAll,
  onShuffleAll,
  onToggleFavorite,
  onToggleFavoriteAlbum,
  themeMode,
}) => {
  const albumSongs = songs.filter((s) => album.songIds.includes(s.id) || s.albumId === album.id);
  const totalDuration = albumSongs.reduce((acc, s) => acc + s.duration, 0);

  const isLight = themeMode === 'LIGHT';
  const isAmoled = themeMode === 'AMOLED';

  const bgClass = isLight
    ? 'bg-[#F5EFEA] text-[#140E10]'
    : isAmoled
    ? 'bg-[#030203] text-[#FAF5F2]'
    : 'bg-[#0A0809] text-[#FAF5F2]';

  const rowSurface = isLight
    ? 'bg-[#FFFDFB] hover:bg-[#ECE2DC] border border-red-900/10 shadow-sm'
    : 'bg-[#141012] hover:bg-[#201619] border border-red-500/15';

  const mutedText = isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]';

  return (
    <div className={`w-full h-full overflow-y-auto select-none pb-12 transition-colors ${bgClass}`}>
      {/* Header Info */}
      <div className="p-6 pb-4 relative">
        <button
          onClick={onBack}
          className={`mb-4 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full transition-colors ${
            isLight ? 'bg-red-900/10 hover:bg-red-900/15 text-[#140E10]' : 'bg-white/5 hover:bg-white/10 text-[#FAF5F2]'
          }`}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl shadow-red-950/60 border border-red-500/20 shrink-0">
            <img
              src={album.artwork}
              alt={album.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <span className="text-[11px] font-bold text-[#EF4444] uppercase tracking-wider">
              ALBUM
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight mt-1">
              {album.title}
            </h1>
            <p className={`text-sm font-semibold mt-1 ${isLight ? 'text-[#5F4E53]' : 'text-[#E6DADA]'}`}>
              {album.artist}
            </p>
            <p className={`text-xs mt-1 tabular-nums ${mutedText}`}>
              {album.year} · {albumSongs.length} songs, {Math.floor(totalDuration / 60)} min {totalDuration % 60} sec
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div
        className={`px-6 py-4 flex items-center justify-between border-y ${
          isLight ? 'border-red-900/10 bg-[#FFFDFB]/80' : 'border-red-500/15 bg-[#120E10]/90'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPlayAll(albumSongs)}
            disabled={albumSongs.length === 0}
            className="w-12 h-12 rounded-full bg-[#DC2626] hover:bg-[#EF4444] hover:scale-105 active:scale-95 disabled:opacity-50 text-white flex items-center justify-center shadow-lg shadow-red-950/60 transition-transform"
            aria-label="Play Album"
          >
            <Play size={22} className="ml-1 fill-white" />
          </button>

          <button
            onClick={() => onShuffleAll(albumSongs)}
            disabled={albumSongs.length === 0}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full disabled:opacity-50 transition-colors ${
              isLight ? 'bg-red-900/10 hover:bg-red-900/15 text-[#5F4E53] hover:text-[#140E10]' : 'bg-white/5 hover:bg-white/10 text-[#B8A9AD] hover:text-[#FAF5F2]'
            }`}
            title="Shuffle"
          >
            <Shuffle size={20} />
          </button>

          <button
            onClick={() => onToggleFavoriteAlbum(album.id)}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:text-[#EF4444] transition-colors ${
              isLight ? 'bg-red-900/10 hover:bg-red-900/15 text-[#5F4E53]' : 'bg-white/5 hover:bg-white/10 text-[#B8A9AD]'
            }`}
            aria-label="Favorite Album"
          >
            <Heart
              size={20}
              className={album.isFavorite ? 'text-[#DC2626] fill-[#DC2626]' : ''}
            />
          </button>
        </div>
      </div>

      {/* Track List */}
      <div className="px-6 py-4 space-y-1.5">
        {albumSongs.length === 0 ? (
          <div className={`p-4 rounded-2xl text-xs text-center ${rowSurface} ${mutedText}`}>
            No tracks found in this album.
          </div>
        ) : (
          albumSongs.map((song, idx) => (
            <div
              key={song.id}
              onClick={() => onPlaySong(song, albumSongs)}
              className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all group ${rowSurface}`}
            >
              <span className={`font-mono text-xs w-5 text-center tabular-nums ${mutedText}`}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs sm:text-sm truncate group-hover:text-[#EF4444]">
                  {song.title}
                </h4>
                <p className={`text-[11px] truncate ${mutedText}`}>{song.artist}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(song.id);
                  }}
                  className={`p-2 rounded-full hover:text-[#EF4444] ${mutedText} ${
                    isLight ? 'hover:bg-red-900/10' : 'hover:bg-white/10'
                  }`}
                  aria-label="Favorite"
                >
                  <Heart
                    size={16}
                    className={song.isFavorite ? 'text-[#DC2626] fill-[#DC2626]' : ''}
                  />
                </button>
                <span className={`text-xs font-mono tabular-nums ${mutedText}`}>
                  {Math.floor(song.duration / 60)}:
                  {(song.duration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
