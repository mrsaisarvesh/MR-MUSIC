import React from 'react';
import {
  X,
  Radio,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  PhoneCall,
  Headphones,
  Bell,
  Zap,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { Song, DevicePlatform } from '../../types';

interface InterruptionSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  activePlatform: DevicePlatform;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onTriggerInterruption: (
    type: 'PHONE_CALL' | 'HEADSET_UNPLUG' | 'AIRPODS_DISCONNECT' | 'ALARM_DUCK'
  ) => void;
}

export const InterruptionSimulatorModal: React.FC<InterruptionSimulatorModalProps> = ({
  isOpen,
  onClose,
  currentSong,
  isPlaying,
  position,
  duration,
  activePlatform,
  onTogglePlay,
  onNext,
  onPrevious,
  onTriggerInterruption,
}) => {
  if (!isOpen || !currentSong) return null;

  const isAndroid = activePlatform === 'ANDROID';
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    const totalSec = Math.floor(secs || 0);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-[#120E10] rounded-3xl p-6 border border-red-500/20 text-[#FAF5F2] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-red-500/15">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#DC2626]/20 text-[#EF4444]">
              <Radio size={18} />
            </div>
            <div>
              <h2 className="font-bold font-display text-base">Native Audio Interruption & System UI</h2>
              <p className="text-xs text-[#B8A9AD]">
                Live simulation for {isAndroid ? 'Android 15 MediaStyle' : 'iOS 18 Lock Screen & Dynamic Island'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#B8A9AD] hover:text-[#FAF5F2]"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Live Native System UI Preview */}
        <div>
          <span className="text-[11px] font-mono font-bold text-[#B8A9AD] uppercase tracking-wider block mb-2">
            {isAndroid ? 'Android Notification Drawer (MediaSessionCompat)' : 'iOS Lock Screen & Live Activity'}
          </span>

          {isAndroid ? (
            /* Android MediaStyle Card */
            <div className="relative overflow-hidden rounded-2xl bg-[#191315] border border-red-500/20 p-4 shadow-xl">
              <div className="flex items-center justify-between text-[11px] text-[#B8A9AD] mb-2">
                <div className="flex items-center gap-1.5 font-medium">
                  <div className="w-3.5 h-3.5 rounded bg-[#DC2626] flex items-center justify-center text-[8px] text-white font-bold">
                    W
                  </div>
                  <span>Walktone • Now Playing</span>
                </div>
                <span>Phone Speaker / Bluetooth</span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={currentSong.artwork}
                  alt={currentSong.title}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover shadow-md shrink-0 border border-red-500/20"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#FAF5F2] truncate">{currentSong.title}</h4>
                  <p className="text-xs text-[#B8A9AD] truncate">{currentSong.artist}</p>
                  <p className="text-[10px] text-[#7A6A6E] truncate">{currentSong.album}</p>
                </div>
              </div>

              {/* Android Progress Bar */}
              <div className="mt-3">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#DC2626] transition-all duration-200"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#B8A9AD] font-mono tabular-nums mt-1">
                  <span>{formatTime(position)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Android Actions */}
              <div className="flex items-center justify-around pt-2">
                <button
                  onClick={onPrevious}
                  className="p-2 text-[#B8A9AD] hover:text-[#FAF5F2]"
                >
                  <SkipBack size={20} />
                </button>
                <button
                  onClick={onTogglePlay}
                  className="w-10 h-10 rounded-full bg-[#DC2626] hover:bg-[#EF4444] text-white flex items-center justify-center shadow-md shadow-red-950/40"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5 fill-white" />}
                </button>
                <button
                  onClick={onNext}
                  className="p-2 text-[#B8A9AD] hover:text-[#FAF5F2]"
                >
                  <SkipForward size={20} />
                </button>
              </div>
            </div>
          ) : (
            /* iOS Dynamic Island & Lock Screen Live Activity */
            <div className="space-y-3">
              {/* Dynamic Island Bar */}
              <div className="mx-auto w-64 bg-[#030203] rounded-full px-4 py-2 flex items-center justify-between border border-red-500/30 shadow-lg">
                <div className="flex items-center gap-2">
                  <img
                    src={currentSong.artwork}
                    alt={currentSong.title}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-[11px] font-medium text-[#FAF5F2] truncate max-w-[90px]">
                    {currentSong.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-end gap-0.5 h-3">
                    <div className="w-0.5 bg-[#EF4444] rounded-full animate-music-bar-1" />
                    <div className="w-0.5 bg-[#DC2626] rounded-full animate-music-bar-2" />
                    <div className="w-0.5 bg-[#F87171] rounded-full animate-music-bar-3" />
                  </div>
                  <button onClick={onTogglePlay} className="text-[#FAF5F2] p-1">
                    {isPlaying ? <Pause size={12} /> : <Play size={12} className="fill-white" />}
                  </button>
                </div>
              </div>

              {/* iOS Lock Screen Card */}
              <div className="bg-[#191315] border border-red-500/20 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between text-[11px] text-[#B8A9AD] mb-2">
                  <span>AirPlay • Retro Cans</span>
                  <Sparkles size={13} className="text-[#EF4444]" />
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={currentSong.artwork}
                    alt={currentSong.title}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-lg object-cover shadow border border-red-500/20"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-[#FAF5F2] truncate">{currentSong.title}</h4>
                    <p className="text-xs text-[#B8A9AD] truncate">{currentSong.artist}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#DC2626] transition-all duration-200"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#B8A9AD] font-mono tabular-nums mt-1">
                    <span>{formatTime(position)}</span>
                    <span>-{formatTime(duration - position)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-around pt-2">
                  <button onClick={onPrevious} className="p-2 text-[#FAF5F2]">
                    <SkipBack size={20} />
                  </button>
                  <button onClick={onTogglePlay} className="p-2 text-[#FAF5F2]">
                    {isPlaying ? <Pause size={22} /> : <Play size={22} className="fill-white" />}
                  </button>
                  <button onClick={onNext} className="p-2 text-[#FAF5F2]">
                    <SkipForward size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Trigger Interruption Event Buttons */}
        <div>
          <span className="text-[11px] font-mono font-bold text-[#B8A9AD] uppercase tracking-wider block mb-2">
            Simulate Audio Interruption Event
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onTriggerInterruption('PHONE_CALL')}
              className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-left transition-all"
            >
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mb-1">
                <PhoneCall size={14} />
                <span>Incoming Phone Call</span>
              </div>
              <p className="text-[10px] text-[#B8A9AD]">Pauses and saves position gracefully</p>
            </button>

            <button
              onClick={() => onTriggerInterruption('HEADSET_UNPLUG')}
              className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-left transition-all"
            >
              <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold mb-1">
                <Headphones size={14} />
                <span>Headset Unplugged</span>
              </div>
              <p className="text-[10px] text-[#B8A9AD]">Noisy event: Immediate pause</p>
            </button>

            <button
              onClick={() => onTriggerInterruption('ALARM_DUCK')}
              className="p-3 rounded-xl bg-[#DC2626]/15 hover:bg-[#DC2626]/25 border border-[#DC2626]/25 text-left transition-all"
            >
              <div className="flex items-center gap-1.5 text-[#FCA5A5] text-xs font-bold mb-1">
                <Bell size={14} />
                <span>GPS / Alert Ducking</span>
              </div>
              <p className="text-[10px] text-[#B8A9AD]">Ducks volume to 20% then restores</p>
            </button>

            <button
              onClick={() => onTriggerInterruption('AIRPODS_DISCONNECT')}
              className="p-3 rounded-xl bg-red-900/20 hover:bg-red-900/30 border border-red-500/25 text-left transition-all"
            >
              <div className="flex items-center gap-1.5 text-[#EF4444] text-xs font-bold mb-1">
                <Zap size={14} />
                <span>Bluetooth Loss</span>
              </div>
              <p className="text-[10px] text-[#B8A9AD]">Route change pause</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
