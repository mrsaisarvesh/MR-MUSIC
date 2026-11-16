import React from 'react';
import { X, Trash2, GripVertical, Play, Music, ArrowUp, ArrowDown } from 'lucide-react';
import { Song } from '../../types';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  currentIndex?: number;
  queue: Song[];
  upNext: Song[];
  onPlaySong: (song: Song) => void;
  onRemoveFromQueue: (index: number) => void;
  onReorderQueue: (from: number, to: number) => void;
  onClearQueue: () => void;
  themeMode?: string;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  currentSong,
  currentIndex,
  queue,
  upNext,
  onPlaySong,
  onRemoveFromQueue,
  onReorderQueue,
  onClearQueue,
  themeMode,
}) => {
  if (!isOpen) return null;

  const isLight = themeMode === 'LIGHT';
  const mutedText = isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]';
  const resolvedCurrentIdx =
    currentIndex !== undefined && currentIndex >= 0
      ? currentIndex
      : currentSong
      ? queue.findIndex((s) => s.id === currentSong.id)
      : -1;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div
        className={`w-full max-w-md h-full flex flex-col justify-between border-l shadow-2xl transition-all ${
          isLight
            ? 'bg-[#F5EFEA] border-red-900/15 text-[#140E10]'
            : 'bg-[#120E10] border-red-500/20 text-[#FAF5F2]'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isLight ? 'border-red-900/10' : 'border-red-500/15'
        }`}>
          <div className="flex items-center gap-2">
            <Music size={18} className="text-[#EF4444]" />
            <h2 className="font-bold font-display text-base">Playback Queue</h2>
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold border ${
              isLight
                ? 'bg-[#FDE2E4] text-[#991B1B] border-[#DC2626]/30'
                : 'bg-[#DC2626]/20 text-[#FCA5A5] border-red-500/30'
            }`}>
              {queue.length} tracks
            </span>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 1 && (
              <button
                onClick={onClearQueue}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Clear upcoming queue"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full ${
                isLight ? 'hover:bg-red-900/10 text-[#6E5B60] hover:text-[#140E10]' : 'hover:bg-white/10 text-[#B8A9AD] hover:text-[#FAF5F2]'
              }`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Currently playing section */}
          {currentSong && (
            <div>
              <span className="text-[11px] font-mono font-bold text-[#EF4444] uppercase tracking-wider block mb-2">
                Now Playing
              </span>
              <div className={`flex items-center gap-3 p-3 rounded-2xl border ${
                isLight
                  ? 'bg-[#FDE2E4] border-[#DC2626]/40'
                  : 'bg-gradient-to-r from-[#DC2626]/20 to-[#991B1B]/25 border-red-500/35'
              }`}>
                <img
                  src={currentSong.artwork}
                  alt={currentSong.title}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover shadow-sm shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{currentSong.title}</h4>
                  <p className={`text-xs truncate ${mutedText}`}>{currentSong.artist}</p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-mono font-medium px-2 py-1 rounded-lg border ${
                  isLight
                    ? 'text-[#991B1B] bg-[#FFFDFB] border-[#DC2626]/30'
                    : 'text-[#FCA5A5] bg-[#DC2626]/20 border-red-500/30'
                }`}>
                  <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping mr-1" />
                  <span>Playing</span>
                </div>
              </div>
            </div>
          )}

          {/* Up Next List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${mutedText}`}>
                Up Next ({upNext.length})
              </span>
            </div>

            {upNext.length === 0 ? (
              <div className={`text-center py-8 text-xs ${mutedText}`}>
                No more songs in queue. Walktone will loop or play recommendations.
              </div>
            ) : (
              <div className="space-y-2">
                {upNext.map((song, i) => {
                  const actualQueueIndex =
                    resolvedCurrentIdx >= 0 ? resolvedCurrentIdx + 1 + i : i;
                  return (
                    <div
                      key={`${song.id}-${actualQueueIndex}`}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all group ${
                        isLight
                          ? 'bg-[#FFFDFB] hover:bg-[#ECE2DC] border-red-900/10'
                          : 'bg-[#191315] hover:bg-[#241A1D] border-red-500/10'
                      }`}
                    >
                      <img
                        src={song.artwork}
                        alt={song.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => onPlaySong(song)}
                      >
                        <h4 className="font-medium text-xs truncate group-hover:text-[#EF4444]">
                          {song.title}
                        </h4>
                        <p className={`text-[11px] truncate ${mutedText}`}>{song.artist}</p>
                      </div>

                      {/* Reorder up/down controls */}
                      <div className="flex items-center gap-0.5 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {i > 0 && (
                          <button
                            onClick={() => onReorderQueue(actualQueueIndex, actualQueueIndex - 1)}
                            className={`p-1.5 rounded ${isLight ? 'hover:bg-red-900/10 text-[#6E5B60]' : 'hover:bg-white/10 text-[#B8A9AD]'}`}
                            title="Move Up"
                            aria-label="Move Up"
                          >
                            <ArrowUp size={13} />
                          </button>
                        )}
                        {i < upNext.length - 1 && (
                          <button
                            onClick={() => onReorderQueue(actualQueueIndex, actualQueueIndex + 1)}
                            className={`p-1.5 rounded ${isLight ? 'hover:bg-red-900/10 text-[#6E5B60]' : 'hover:bg-white/10 text-[#B8A9AD]'}`}
                            title="Move Down"
                            aria-label="Move Down"
                          >
                            <ArrowDown size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => onRemoveFromQueue(actualQueueIndex)}
                          className={`p-1.5 rounded hover:bg-rose-500/20 hover:text-rose-400 ml-0.5 ${mutedText}`}
                          title="Remove from queue"
                          aria-label="Remove from queue"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t text-xs text-center ${
          isLight ? 'border-red-900/10 bg-[#ECE2DC] text-[#6E5B60]' : 'border-red-500/15 bg-[#0A0809] text-[#B8A9AD]'
        }`}>
          Tap any song to play immediately or use reorder arrows.
        </div>
      </div>
    </div>
  );
};
