import React, { useState } from 'react';
import { ArrowLeft, Play, Shuffle, Trash2, Plus, Music2, Heart } from 'lucide-react';
import { Playlist, Song } from '../../types';

interface PlaylistScreenProps {
  playlist: Playlist;
  allSongs: Song[];
  onBack: () => void;
  onPlaySong: (song: Song, queue?: Song[]) => void;
  onPlayAll: (songs: Song[]) => void;
  onShuffleAll: (songs: Song[]) => void;
  onRemoveSongFromPlaylist: (playlistId: string, songId: string) => void;
  onAddSongToPlaylist: (playlistId: string, songId: string) => void;
  onDeletePlaylist?: (playlistId: string) => void;
  onToggleFavorite: (songId: string) => void;
  themeMode?: string;
}

export const PlaylistScreen: React.FC<PlaylistScreenProps> = ({
  playlist,
  allSongs,
  onBack,
  onPlaySong,
  onPlayAll,
  onShuffleAll,
  onRemoveSongFromPlaylist,
  onAddSongToPlaylist,
  onDeletePlaylist,
  onToggleFavorite,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const playlistSongs = playlist.songIds
    .map((id) => allSongs.find((s) => s.id === id))
    .filter((s): s is Song => Boolean(s));

  const candidateSongs = allSongs.filter((s) => !playlist.songIds.includes(s.id));

  return (
    <div className="w-full h-full overflow-y-auto select-none pb-12 bg-[#0A0809] text-[#FAF5F2]">
      {/* Header */}
      <div className="p-5 pb-4 relative">
        <button
          onClick={onBack}
          className="mb-4 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-[#FAF5F2] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-2xl shadow-red-950/60 border border-red-500/20 shrink-0">
            <img
              src={playlist.artwork}
              alt={playlist.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <span className="text-[11px] font-bold text-[#EF4444] uppercase tracking-wider">
              Mixtape
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#FAF5F2] tracking-tight mt-1">
              {playlist.title}
            </h1>
            <p className="text-xs text-[#B8A9AD] mt-1">{playlist.description}</p>
            <p className="text-xs text-[#7A6A6E] mt-1">
              Created by {playlist.creator} · {playlistSongs.length} tracks
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-5 py-3.5 flex items-center justify-between border-y border-red-500/15 bg-[#120E10]/90">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPlayAll(playlistSongs)}
            disabled={playlistSongs.length === 0}
            className="w-12 h-12 rounded-full bg-[#DC2626] hover:bg-[#EF4444] hover:scale-105 active:scale-95 disabled:opacity-50 text-white flex items-center justify-center shadow-lg shadow-red-950/60 transition-transform"
            aria-label="Play Playlist"
          >
            <Play size={22} className="ml-1 fill-white" />
          </button>

          <button
            onClick={() => onShuffleAll(playlistSongs)}
            disabled={playlistSongs.length === 0}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-50 text-[#B8A9AD] hover:text-[#FAF5F2] transition-colors"
            title="Shuffle"
          >
            <Shuffle size={20} />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 min-h-[40px] rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#EF4444] hover:text-red-300 transition-colors"
          >
            <Plus size={16} />
            <span>Add Songs</span>
          </button>
        </div>

        {playlist.isCustom && onDeletePlaylist && (
          confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  onDeletePlaylist(playlist.id);
                  onBack();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1.5 rounded-lg bg-white/10 text-xs text-[#E6DADA]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-2.5 rounded-full hover:bg-red-500/20 text-[#B8A9AD] hover:text-red-400 transition-colors"
              title="Delete playlist"
            >
              <Trash2 size={18} />
            </button>
          )
        )}
      </div>

      {/* Songs List */}
      <div className="px-6 py-4 space-y-1.5">
        {playlistSongs.length === 0 ? (
          <div className="text-center py-16 text-[#B8A9AD] text-xs">
            <Music2 size={36} className="mx-auto mb-2 opacity-30 text-[#DC2626]" />
            <p>This mixtape is currently empty.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-3 px-4 py-1.5 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-medium"
            >
              Add songs from library
            </button>
          </div>
        ) : (
          playlistSongs.map((song, idx) => (
            <div
              key={`${song.id}-${idx}`}
              onClick={() => onPlaySong(song, playlistSongs)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-[#141012] hover:bg-[#201619] border border-red-500/15 cursor-pointer transition-all group"
            >
              <span className="font-mono text-xs text-[#B8A9AD] w-5 text-center tabular-nums">
                {idx + 1}
              </span>
              <img
                src={song.artwork}
                alt={song.title}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs sm:text-sm truncate text-[#FAF5F2] group-hover:text-[#EF4444]">
                  {song.title}
                </h4>
                <p className="text-[11px] text-[#B8A9AD] truncate">{song.artist}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(song.id);
                  }}
                  className="p-2 rounded-full hover:bg-white/10 text-[#B8A9AD] hover:text-[#EF4444]"
                >
                  <Heart
                    size={16}
                    className={song.isFavorite ? 'text-[#DC2626] fill-[#DC2626]' : ''}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSongFromPlaylist(playlist.id, song.id);
                  }}
                  className="p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-[#B8A9AD] hover:text-red-400 transition-opacity"
                  title="Remove from playlist"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Songs Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#141012] rounded-3xl p-6 border border-red-500/20 text-[#FAF5F2] shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between pb-3 border-b border-red-500/15">
              <h3 className="font-bold text-base">Add Songs to "{playlist.title}"</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-[#B8A9AD] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {candidateSongs.length === 0 ? (
                <p className="text-xs text-[#B8A9AD] text-center py-6">
                  All available songs are already in this mixtape!
                </p>
              ) : (
                candidateSongs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#191315] border border-red-500/15"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                      <img
                        src={song.artwork}
                        alt={song.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-xs truncate text-[#FAF5F2]">
                          {song.title}
                        </h4>
                        <p className="text-[10px] text-[#B8A9AD] truncate">{song.artist}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onAddSongToPlaylist(playlist.id, song.id)}
                      className="px-3 py-1 rounded-lg bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-semibold shrink-0 shadow-md shadow-red-950/40"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setIsAddModalOpen(false)}
              className="mt-3 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF5F2] text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
