import React, { useRef, useEffect } from 'react';
import { LyricLine } from '../../types';
import { LyricsService } from '../../services/lyrics/LyricsService';
import { Mic2, Music } from 'lucide-react';

interface LyricsViewProps {
  lyrics?: LyricLine[];
  plainLyrics?: string;
  currentTime: number;
  onSeek: (seconds: number) => void;
  accentColor?: string;
  themeMode?: string;
}

export const LyricsView: React.FC<LyricsViewProps> = ({
  lyrics,
  plainLyrics,
  currentTime,
  onSeek,
  accentColor = '#DC2626',
  themeMode,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeIndex = lyrics ? LyricsService.getActiveLyricIndex(lyrics, currentTime) : -1;
  const isLight = themeMode === 'LIGHT';

  // Auto-scroll only the lyrics container to active lyric line
  useEffect(() => {
    const container = containerRef.current;
    if (activeIndex >= 0 && container) {
      const activeEl = container.children[activeIndex] as HTMLElement | undefined;
      if (activeEl) {
        const targetTop =
          activeEl.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2;
        container.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth',
        });
      }
    }
  }, [activeIndex]);

  if (!lyrics || lyrics.length === 0) {
    if (plainLyrics) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
          <Music size={32} className="text-[#EF4444] mb-3 opacity-70" />
          <p className={`text-sm whitespace-pre-line leading-relaxed max-w-md ${
            isLight ? 'text-[#140E10]' : 'text-[#FAF5F2]'
          }`}>
            {plainLyrics}
          </p>
        </div>
      );
    }
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-8 text-center ${
        isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]'
      }`}>
        <Mic2 size={36} className="text-[#EF4444] mb-2 opacity-70" />
        <h3 className={`font-semibold text-sm ${isLight ? 'text-[#140E10]' : 'text-[#FAF5F2]'}`}>
          No Synchronized Lyrics Available
        </h3>
        <p className="text-xs mt-1 max-w-xs">
          Lyrics for this track are not registered or the song is instrumental.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-y-auto px-4 py-12 space-y-6 scrollbar-none select-none text-left"
    >
      {lyrics.map((line, idx) => {
        const isActive = idx === activeIndex;
        const isPast = idx < activeIndex;

        return (
          <div
            key={idx}
            onClick={() => onSeek(line.time)}
            className={`cursor-pointer transition-all duration-300 py-1.5 px-3 rounded-xl ${
              isActive
                ? isLight
                  ? 'scale-105 font-bold text-lg sm:text-xl text-[#140E10] bg-[#FDE2E4] shadow-sm border border-[#DC2626]/40'
                  : 'scale-105 font-bold text-lg sm:text-xl text-[#FAF5F2] bg-red-500/15 shadow-sm border border-red-500/35'
                : isPast
                ? isLight
                  ? 'text-[#6E5B60] hover:text-[#140E10] opacity-75 hover:opacity-100 text-sm sm:text-base'
                  : 'text-[#B8A9AD] hover:text-[#FAF5F2] opacity-75 hover:opacity-100 text-sm sm:text-base'
                : isLight
                ? 'text-[#8D7B80] hover:text-[#140E10] opacity-60 hover:opacity-100 text-sm sm:text-base'
                : 'text-[#7A6A6E] hover:text-[#FAF5F2] opacity-60 hover:opacity-100 text-sm sm:text-base'
            }`}
            style={{
              textShadow: isActive && !isLight ? `0 0 20px ${accentColor}80` : undefined,
            }}
          >
            {line.text}
          </div>
        );
      })}
    </div>
  );
};
