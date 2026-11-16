import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Heart,
  Shuffle,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  ListMusic,
  Sliders,
  Mic2,
  Activity,
  Volume2,
  VolumeX,
  Share2,
  Sparkles,
  Gauge,
} from 'lucide-react';
import { Song, RepeatMode, EqualizerBands } from '../../types';
import { LyricsView } from './LyricsView';
import { VisualizerCanvas, VisualizerMode } from './VisualizerCanvas';
import { EqualizerModal } from './EqualizerModal';
import { QueueDrawer } from './QueueDrawer';

interface FullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  currentIndex?: number;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  playbackRate: number;
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  equalizerPreset: string;
  queue: Song[];
  upNext: Song[];
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onSetVolume: (vol: number) => void;
  onSetPlaybackRate: (rate: number) => void;
  onToggleShuffle: () => void;
  onCycleRepeatMode: () => void;
  onToggleFavorite: (id: string) => void;
  onPlaySong: (song: Song) => void;
  onRemoveFromQueue: (index: number) => void;
  onReorderQueue: (from: number, to: number) => void;
  onClearQueue: () => void;
  onSelectEqualizerPreset: (preset: string) => void;
  onUpdateEqualizerBands: (bands: EqualizerBands) => void;
  getEqualizerBands: () => EqualizerBands;
  getFrequencyData: () => Uint8Array;
  getWaveformData: () => Uint8Array;
  onDownloadSong?: (song: Song) => void;
  onShowToast?: (msg: string) => void;
  themeMode?: string;
}

export const FullPlayer: React.FC<FullPlayerProps> = ({
  isOpen,
  onClose,
  currentSong,
  currentIndex,
  isPlaying,
  position,
  duration,
  volume,
  playbackRate,
  shuffleEnabled,
  repeatMode,
  equalizerPreset,
  queue,
  upNext,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onSetVolume,
  onSetPlaybackRate,
  onToggleShuffle,
  onCycleRepeatMode,
  onToggleFavorite,
  onPlaySong,
  onRemoveFromQueue,
  onReorderQueue,
  onClearQueue,
  onSelectEqualizerPreset,
  onUpdateEqualizerBands,
  getEqualizerBands,
  getFrequencyData,
  getWaveformData,
  onShowToast,
  themeMode,
}) => {
  const [activeTab, setActiveTab] = useState<'ARTWORK' | 'TRACKS' | 'LYRICS' | 'VISUALIZER'>('ARTWORK');
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('BARS');
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [seekDraft, setSeekDraft] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsSpeedMenuOpen(false);
      setIsEqualizerOpen(false);
      setIsQueueOpen(false);
      setSeekDraft(null);
    }
  }, [isOpen]);

  if (!isOpen || !currentSong) return null;

  const effectiveDuration = duration > 0 ? duration : currentSong.duration || 180;
  const displayedPosition = seekDraft !== null ? seekDraft : position;

  const formatTime = (secs: number) => {
    const totalSec = Math.floor(secs || 0);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSeekDraft(val);
    onSeek(val);
  };

  const isLight = themeMode === 'LIGHT';
  const isAmoled = themeMode === 'AMOLED';

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: currentSong.title,
          text: `Listening to "${currentSong.title}" by ${currentSong.artist} on Walktone!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(`Listening to "${currentSong.title}" by ${currentSong.artist} on Walktone`)
        .then(() => onShowToast?.('Track info copied to clipboard'))
        .catch(() => {});
    }
  };

  const verticalTrackList = queue.length > 0 ? queue : [currentSong, ...upNext];
  const shellBg = isLight
    ? 'bg-[#F5EFEA] text-[#140E10]'
    : isAmoled
    ? 'bg-[#030203] text-[#FAF5F2]'
    : 'bg-[#0A0809] text-[#FAF5F2]';
  const mutedText = isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]';

  return (
    <div className={`fixed inset-0 z-50 flex flex-col animate-slide-up overflow-hidden select-none ${shellBg}`}>
      {/* Background Ambient Glow Blur */}
      <div
        className={`absolute inset-0 bg-cover bg-center filter blur-3xl scale-125 pointer-events-none transition-all duration-700 ${
          isLight ? 'opacity-10' : 'opacity-20'
        }`}
        style={{ backgroundImage: `url(${currentSong.artwork})` }}
      />
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? 'bg-gradient-to-b from-[#F5EFEA]/70 via-[#F5EFEA]/90 to-[#F5EFEA]'
            : isAmoled
            ? 'bg-gradient-to-b from-[#030203]/60 via-[#030203]/85 to-[#030203]'
            : 'bg-gradient-to-b from-[#0A0809]/60 via-[#0A0809]/85 to-[#0A0809]'
        }`}
      />

      {/* Top Header Bar */}
      <div className={`relative z-10 flex items-center justify-between px-4 py-3 border-b shrink-0 ${
        isLight ? 'border-red-900/15' : 'border-red-500/15'
      }`}>
        <button
          onClick={onClose}
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${
            isLight ? 'hover:bg-red-900/10 text-[#5F4E53] hover:text-[#140E10]' : 'hover:bg-red-500/10 text-[#B8A9AD] hover:text-[#FAF5F2]'
          }`}
          aria-label="Minimize Player"
        >
          <ChevronDown size={24} />
        </button>

        <div className="text-center max-w-[180px] sm:max-w-xs truncate">
          <span className={`text-[10px] font-mono font-semibold tracking-wider uppercase ${mutedText}`}>
            Tape Deck
          </span>
          <h3 className={`text-xs sm:text-sm font-semibold font-display truncate ${isLight ? 'text-[#140E10]' : 'text-[#FAF5F2]'}`}>
            {currentSong.album || 'WALKTONE'}
          </h3>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setIsEqualizerOpen(true)}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${mutedText} hover:text-[#EF4444] ${
              isLight ? 'hover:bg-red-900/10' : 'hover:bg-red-500/10'
            }`}
            title="Equalizer DSP"
          >
            <Sliders size={19} />
          </button>
          <button
            onClick={() => setIsQueueOpen(true)}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${mutedText} hover:text-[#DC2626] ${
              isLight ? 'hover:bg-red-900/10' : 'hover:bg-red-500/10'
            }`}
            title="Edit Queue"
          >
            <ListMusic size={21} />
          </button>
        </div>
      </div>

      {/* Center Display: Artwork / Vertical Track List / Lyrics / Visualizer */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2 min-h-0">
        {/* Tab Selector Switcher */}
        <div className={`flex items-center rounded-full p-1 mb-3 text-[11px] shrink-0 border ${
          isLight ? 'bg-[#FFFDFB] border-red-900/15' : 'bg-[#141012]/90 border-red-500/20'
        }`}>
          <button
            onClick={() => setActiveTab('ARTWORK')}
            className={`px-2.5 py-1 rounded-full transition-all whitespace-nowrap ${
              activeTab === 'ARTWORK'
                ? 'bg-[#DC2626] text-white font-medium shadow-sm shadow-red-950/40'
                : `${mutedText} hover:text-[#EF4444]`
            }`}
          >
            Artwork
          </button>
          <button
            onClick={() => setActiveTab('TRACKS')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all whitespace-nowrap ${
              activeTab === 'TRACKS'
                ? 'bg-[#DC2626] text-white font-medium shadow-sm shadow-red-950/40'
                : `${mutedText} hover:text-[#EF4444]`
            }`}
          >
            <ListMusic size={11} />
            <span>Tracks</span>
          </button>
          <button
            onClick={() => setActiveTab('LYRICS')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all whitespace-nowrap ${
              activeTab === 'LYRICS'
                ? 'bg-[#DC2626] text-white font-medium shadow-sm shadow-red-950/40'
                : `${mutedText} hover:text-[#EF4444]`
            }`}
          >
            <Mic2 size={11} />
            <span>Lyrics</span>
          </button>
          <button
            onClick={() => setActiveTab('VISUALIZER')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all whitespace-nowrap ${
              activeTab === 'VISUALIZER'
                ? 'bg-[#DC2626] text-white font-medium shadow-sm shadow-red-950/40'
                : `${mutedText} hover:text-[#EF4444]`
            }`}
          >
            <Activity size={11} />
            <span>VU Meter</span>
          </button>
        </div>

        {/* Dynamic Display Area */}
        <div
          className={`w-full flex items-center justify-center relative ${
            activeTab === 'TRACKS'
              ? 'max-w-md flex-1 min-h-0'
              : 'max-w-[260px] aspect-square shrink-0'
          }`}
        >
          {activeTab === 'ARTWORK' && (
            <div className="relative w-full h-full aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-red-950/60 border border-red-500/25 group">
              <img
                src={currentSong.artwork}
                alt={currentSong.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#0A0809]/80 backdrop-blur-md border border-red-500/35 text-[10px] font-mono font-medium text-[#FCA5A5] flex items-center gap-1">
                <Sparkles size={11} className="text-[#EF4444]" />
                <span>Analog Hi-Fi</span>
              </div>
            </div>
          )}

          {activeTab === 'TRACKS' && (
            <div className={`w-full h-full rounded-3xl border backdrop-blur-md overflow-hidden flex flex-col ${
              isLight ? 'bg-[#FFFDFB]/90 border-red-900/15' : 'bg-[#141012]/85 border-red-500/20'
            }`}>
              <div className={`px-4 py-2.5 border-b flex items-center justify-between shrink-0 ${
                isLight ? 'border-red-900/10' : 'border-red-500/15'
              }`}>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#EF4444]">
                  Tape Track List
                </span>
                <span className={`text-[11px] font-mono tabular-nums ${mutedText}`}>
                  {verticalTrackList.length} songs
                </span>
              </div>
              <div className="flex-1 overflow-y-auto scroll-smooth snap-y snap-proximity p-2.5 space-y-1.5">
                {verticalTrackList.map((track, idx) => {
                  const isCurrent = track.id === currentSong.id;
                  return (
                    <button
                      key={`${track.id}-${idx}`}
                      onClick={() => onPlaySong(track)}
                      className={`snap-start w-full flex items-center gap-3 p-2 rounded-2xl text-left transition-all min-h-[56px] active:scale-[0.99] ${
                        isCurrent
                          ? isLight
                            ? 'bg-[#FDE2E4] border border-[#DC2626]/50'
                            : 'bg-[#DC2626]/20 border border-[#EF4444]/40'
                          : isLight
                          ? 'bg-[#F5EFEA]/60 hover:bg-[#ECE2DC] border border-transparent'
                          : 'bg-white/[0.03] hover:bg-[#201619] border border-transparent'
                      }`}
                    >
                      <div className="w-5 shrink-0 flex items-center justify-center">
                        {isCurrent && isPlaying ? (
                          <div className="flex items-end gap-[2px] h-3">
                            <span className="w-[2.5px] bg-[#EF4444] rounded-full animate-music-bar-1" />
                            <span className="w-[2.5px] bg-[#DC2626] rounded-full animate-music-bar-2" />
                            <span className="w-[2.5px] bg-[#F87171] rounded-full animate-music-bar-3" />
                          </div>
                        ) : (
                          <span
                            className={`text-[11px] font-mono tabular-nums ${
                              isCurrent ? 'text-[#EF4444] font-bold' : mutedText
                            }`}
                          >
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                      <img
                        src={track.artwork}
                        alt={track.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-semibold truncate ${
                            isCurrent ? 'text-[#DC2626]' : ''
                          }`}
                        >
                          {track.title}
                        </p>
                        <p className={`text-[11px] truncate ${mutedText}`}>
                          {track.artist}
                        </p>
                      </div>
                      <span className={`text-[11px] font-mono tabular-nums shrink-0 ${mutedText}`}>
                        {formatTime(track.duration)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'LYRICS' && (
            <div className={`w-full h-full rounded-3xl border backdrop-blur-md overflow-hidden ${
              isLight ? 'bg-[#FFFDFB]/90 border-red-900/15' : 'bg-[#141012]/85 border-red-500/20'
            }`}>
              <LyricsView
                lyrics={currentSong.lyrics}
                plainLyrics={currentSong.plainLyrics}
                currentTime={position}
                onSeek={onSeek}
                accentColor="#DC2626"
                themeMode={themeMode}
              />
            </div>
          )}

          {activeTab === 'VISUALIZER' && (
            <div className={`w-full h-full rounded-3xl border backdrop-blur-md flex flex-col p-3.5 justify-between ${
              isLight ? 'bg-[#FFFDFB]/90 border-red-900/15' : 'bg-[#141012]/85 border-red-500/20'
            }`}>
              <div className={`flex justify-between items-center text-xs mb-2 ${mutedText}`}>
                <span className="font-mono font-semibold uppercase tracking-wider text-[10px]">
                  Analog VU
                </span>
                <div className="flex gap-1">
                  {(['BARS', 'WAVE', 'RADIAL', 'PARTICLES'] as VisualizerMode[]).map((vMode) => (
                    <button
                      key={vMode}
                      onClick={() => setVisualizerMode(vMode)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                        visualizerMode === vMode
                          ? 'bg-[#DC2626] text-white font-bold'
                          : isLight
                          ? 'bg-red-900/10 text-[#5F4E53] hover:text-[#140E10]'
                          : 'bg-white/5 text-[#B8A9AD] hover:text-[#FAF5F2]'
                      }`}
                    >
                      {vMode}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-0">
                <VisualizerCanvas
                  isPlaying={isPlaying}
                  getFrequencyData={getFrequencyData}
                  getWaveformData={getWaveformData}
                  mode={visualizerMode}
                  accentColor="#DC2626"
                  className="w-full h-44"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Track Details & Controls Section */}
      <div className="relative z-10 px-5 pb-5 max-w-xl mx-auto w-full space-y-3 shrink-0">
        {/* Track Title, Artist, & Favorite */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold font-display truncate tracking-tight">
              {currentSong.title}
            </h2>
            <p className={`text-xs sm:text-sm truncate mt-0.5 font-medium ${mutedText}`}>
              {currentSong.artist}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(currentSong.id)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${
                isLight ? 'bg-red-900/10 text-[#5F4E53] hover:text-[#DC2626]' : 'bg-white/5 hover:bg-white/10 text-[#B8A9AD] hover:text-[#EF4444]'
              }`}
              aria-label="Toggle Favorite"
            >
              <Heart
                size={20}
                className={currentSong.isFavorite ? 'text-[#DC2626] fill-[#DC2626]' : ''}
              />
            </button>
            <button
              onClick={handleShare}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${
                isLight ? 'bg-red-900/10 text-[#5F4E53] hover:text-[#140E10]' : 'bg-white/5 hover:bg-white/10 text-[#B8A9AD] hover:text-[#FAF5F2]'
              }`}
              title="Share Track"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Time Progress Scrubber */}
        <div className="space-y-1">
          <div className="relative flex items-center group">
            <input
              type="range"
              min="0"
              max={effectiveDuration}
              step="0.1"
              value={Math.min(displayedPosition, effectiveDuration)}
              onChange={handleSeekChange}
              onMouseUp={() => setSeekDraft(null)}
              onTouchEnd={() => setSeekDraft(null)}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#DC2626] hover:accent-[#EF4444] ${
                isLight ? 'bg-red-900/15' : 'bg-white/10'
              }`}
            />
          </div>
          <div className={`flex justify-between text-[11px] font-mono tabular-nums ${mutedText}`}>
            <span>{formatTime(displayedPosition)}</span>
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* Primary Playback Controls */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => onSeek(Math.max(0, position - 15))}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${mutedText} ${
              isLight ? 'hover:bg-red-900/10 hover:text-[#140E10]' : 'hover:bg-red-500/10 hover:text-[#FAF5F2]'
            }`}
            title="Rewind 15 seconds"
          >
            <RotateCcw size={19} />
          </button>

          <button
            onClick={onPrevious}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors active:scale-95 ${
              isLight ? 'text-[#140E10] hover:bg-red-900/10' : 'text-[#FAF5F2] hover:bg-red-500/10'
            }`}
            aria-label="Previous Track"
          >
            <SkipBack size={24} />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#991B1B] via-[#DC2626] to-[#EF4444] text-white flex items-center justify-center shadow-xl shadow-red-950/60 hover:scale-105 active:scale-95 transition-all"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={24} />
            ) : (
              <Play size={24} className="ml-1 fill-white" />
            )}
          </button>

          <button
            onClick={onNext}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors active:scale-95 ${
              isLight ? 'text-[#140E10] hover:bg-red-900/10' : 'text-[#FAF5F2] hover:bg-red-500/10'
            }`}
            aria-label="Next Track"
          >
            <SkipForward size={24} />
          </button>

          <button
            onClick={() => onSeek(Math.min(effectiveDuration, position + 15))}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${mutedText} ${
              isLight ? 'hover:bg-red-900/10 hover:text-[#140E10]' : 'hover:bg-red-500/10 hover:text-[#FAF5F2]'
            }`}
            title="Forward 15 seconds"
          >
            <RotateCw size={19} />
          </button>
        </div>

        {/* Secondary Row: Shuffle | Repeat | Speed | Volume Slider */}
        <div className={`flex items-center justify-between pt-2.5 border-t text-xs ${
          isLight ? 'border-red-900/10' : 'border-red-500/15'
        } ${mutedText}`}>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleShuffle}
              className={`p-2 rounded-full transition-colors ${
                shuffleEnabled
                  ? 'text-[#EF4444] bg-[#DC2626]/20'
                  : `${mutedText} ${isLight ? 'hover:bg-red-900/10 hover:text-[#140E10]' : 'hover:bg-white/10 hover:text-[#FAF5F2]'}`
              }`}
              title="Shuffle queue"
            >
              <Shuffle size={17} />
            </button>

            <button
              onClick={onCycleRepeatMode}
              className={`p-2 rounded-full transition-colors ${
                repeatMode !== 'OFF'
                  ? 'text-[#EF4444] bg-[#DC2626]/20'
                  : `${mutedText} ${isLight ? 'hover:bg-red-900/10 hover:text-[#140E10]' : 'hover:bg-white/10 hover:text-[#FAF5F2]'}`
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'REPEAT_ONE' ? <Repeat1 size={17} /> : <Repeat size={17} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono ${
                  isLight ? 'bg-red-900/10 hover:bg-red-900/15 text-[#140E10]' : 'bg-white/5 hover:bg-white/10 text-[#FAF5F2]'
                }`}
              >
                <Gauge size={13} />
                <span>{playbackRate}x</span>
              </button>
              {isSpeedMenuOpen && (
                <div className={`absolute bottom-full mb-2 left-0 border rounded-xl p-1 shadow-xl flex flex-col gap-1 z-30 ${
                  isLight ? 'bg-[#FFFDFB] border-red-900/15' : 'bg-[#141012] border-red-500/20'
                }`}>
                  {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        onSetPlaybackRate(rate);
                        setIsSpeedMenuOpen(false);
                      }}
                      className={`px-3 py-1 rounded text-xs text-left font-mono ${
                        playbackRate === rate
                          ? 'bg-[#DC2626] text-white'
                          : isLight
                          ? 'text-[#140E10] hover:bg-red-900/10'
                          : 'text-[#FAF5F2] hover:bg-white/10'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 max-w-[130px]">
            <button
              onClick={() => onSetVolume(volume === 0 ? 0.8 : 0)}
              className={`${mutedText} hover:text-[#EF4444]`}
            >
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onSetVolume(parseFloat(e.target.value))}
              className={`w-20 h-1 rounded-lg appearance-none cursor-pointer accent-[#DC2626] ${
                isLight ? 'bg-red-900/15' : 'bg-white/10'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <EqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
        currentPreset={equalizerPreset}
        onSelectPreset={onSelectEqualizerPreset}
        getBands={getEqualizerBands}
        onUpdateBands={onUpdateEqualizerBands}
        themeMode={themeMode}
      />

      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        currentSong={currentSong}
        currentIndex={currentIndex}
        queue={queue}
        upNext={upNext}
        onPlaySong={onPlaySong}
        onRemoveFromQueue={onRemoveFromQueue}
        onReorderQueue={onReorderQueue}
        onClearQueue={onClearQueue}
        themeMode={themeMode}
      />
    </div>
  );
};
