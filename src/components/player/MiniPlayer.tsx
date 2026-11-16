import React from 'react';
import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { Song } from '../../types';

interface MiniPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious?: () => void;
  onOpenFullPlayer: () => void;
  onToggleFavorite: (id: string) => void;
  themeMode?: string;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentSong,
  isPlaying,
  position,
  duration,
  onTogglePlay,
  onNext,
  onPrevious,
  onOpenFullPlayer,
  onToggleFavorite,
  themeMode,
}) => {
  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;
  const isLight = themeMode === 'LIGHT';
  const isAmoled = themeMode === 'AMOLED';

  const formatTime = (secs: number) => {
    const totalSec = Math.floor(secs || 0);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full px-2.5 mb-1.5 z-30 select-none shrink-0">
      <div
        className={`relative overflow-hidden rounded-2xl border transition-all cursor-pointer shadow-xl group active:scale-[0.99] ${
          isLight
            ? 'bg-[#FFFDFB]/95 border-red-900/15 text-[#140E10] shadow-red-950/10'
            : isAmoled
            ? 'bg-[#080506]/95 border-red-500/20 text-[#FAF5F2] shadow-black/90'
            : 'bg-[#141012]/95 border-red-500/20 text-[#FAF5F2] shadow-black/90'
        } backdrop-blur-xl`}
        onClick={onOpenFullPlayer}
      >
        {/* Progress Line */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${isLight ? 'bg-red-900/10' : 'bg-white/10'}`}>
          <div
            className="h-full bg-gradient-to-r from-[#EF4444] to-[#DC2626] transition-all duration-150 relative"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between p-2.5 gap-2.5">
          {/* Left: Thumbnail & Info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className={`relative w-11 h-11 rounded-xl overflow-hidden shadow-md shrink-0 border ${
              isLight ? 'bg-[#ECE2DC] border-red-900/15' : 'bg-[#1E1518] border-red-500/20'
            }`}>
              <img
                src={currentSong.artwork}
                alt={currentSong.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="flex items-end gap-0.5 h-3.5">
                    <div className="w-0.5 bg-[#EF4444] rounded-full animate-music-bar-1" />
                    <div className="w-0.5 bg-[#DC2626] rounded-full animate-music-bar-2" />
                    <div className="w-0.5 bg-[#F87171] rounded-full animate-music-bar-3" />
                  </div>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4
                className={`font-bold text-xs truncate leading-snug group-hover:text-[#EF4444] transition-colors ${
                  isLight ? 'text-[#140E10]' : 'text-[#FAF5F2]'
                }`}
              >
                {currentSong.title}
              </h4>
              <p className={`text-[11px] truncate mt-0.5 ${isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]'}`}>
                {currentSong.artist} · {currentSong.album}
              </p>
            </div>

            <div className="hidden md:block" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onToggleFavorite(currentSong.id)}
                className={`p-2 rounded-full transition-colors ${
                  isLight ? 'hover:bg-red-900/10 text-[#6E5B60]' : 'hover:bg-white/10 text-[#B8A9AD]'
                } hover:text-[#DC2626]`}
                aria-label={currentSong.isFavorite ? 'Unlike' : 'Like'}
              >
                <Heart
                  size={18}
                  className={currentSong.isFavorite ? 'text-[#DC2626] fill-[#DC2626]' : ''}
                />
              </button>
            </div>
          </div>

          {/* Center (visible on tablet/desktop): Scrubber info */}
          <div className="hidden lg:flex flex-col items-center gap-1.5 flex-1 max-w-xs">
            <div className="w-full flex items-center gap-2">
              <span className={`text-[10px] font-mono tabular-nums ${isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]'}`}>{formatTime(position)}</span>
              <div className={`flex-1 h-1 rounded-full relative overflow-hidden ${isLight ? 'bg-red-900/15' : 'bg-white/10'}`}>
                <div
                  className="h-full bg-[#DC2626] rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className={`text-[10px] font-mono tabular-nums ${isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]'}`}>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onToggleFavorite(currentSong.id)}
              className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full transition-colors ${
                isLight ? 'text-[#6E5B60] hover:bg-red-900/10 hover:text-[#DC2626]' : 'text-[#B8A9AD] hover:bg-white/10 hover:text-[#EF4444]'
              }`}
              aria-label={currentSong.isFavorite ? 'Unlike' : 'Like'}
            >
              <Heart
                size={17}
                className={currentSong.isFavorite ? 'text-[#DC2626] fill-[#DC2626]' : ''}
              />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-10 h-10 rounded-full bg-[#DC2626] hover:bg-[#EF4444] hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-950/40 transition-all"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={17} className="fill-white" /> : <Play size={17} className="ml-0.5 fill-white" />}
            </button>

            <button
              onClick={onNext}
              className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full transition-colors ${
                isLight ? 'text-[#5F4E53] hover:bg-red-900/10 hover:text-[#140E10]' : 'text-[#B8A9AD] hover:bg-white/10 hover:text-[#FAF5F2]'
              }`}
              aria-label="Next track"
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
