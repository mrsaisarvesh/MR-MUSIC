import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Bell, Radio } from 'lucide-react';
import { DevicePlatform } from '../../types';

interface DeviceHeaderProps {
  platform: DevicePlatform;
  onSelectPlatform?: (platform: DevicePlatform) => void;
  onTogglePlatform?: () => void;
  onOpenInterruptionModal?: () => void;
  onOpenSimulator?: () => void;
  isPlaying: boolean;
  currentSong?: { title: string } | null;
  currentSongTitle?: string;
  themeMode?: string;
}

export const DeviceHeader: React.FC<DeviceHeaderProps> = ({
  platform,
  onSelectPlatform,
  onTogglePlatform,
  onOpenInterruptionModal,
  onOpenSimulator,
  isPlaying,
  currentSong,
  currentSongTitle,
  themeMode,
}) => {
  const [timeStr, setTimeStr] = useState('9:41');
  const activeTitle = currentSongTitle || currentSong?.title;
  const handleOpenSimulator = onOpenInterruptionModal || onOpenSimulator || (() => {});

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      setTimeStr(`${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const isLight = themeMode === 'LIGHT';

  return (
    <header
      className={`w-full px-4 sm:px-8 pt-2.5 pb-2 flex items-center justify-between text-xs select-none z-30 transition-colors ${
        isLight
          ? 'text-[#5F4E53] bg-[#F5EFEA]/90 border-red-900/10'
          : 'text-[#B8A9AD] bg-[#0A0809]/90 border-red-500/15'
      } backdrop-blur-md border-b`}
    >
      {/* Left: Time & Dynamic Indicator */}
      <div className="flex items-center gap-3">
        <span className={`font-mono font-bold tracking-tight text-[13px] ${isLight ? 'text-[#140E10]' : 'text-[#FAF5F2]'}`}>
          {timeStr}
        </span>
        {isPlaying && activeTitle && (
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-[11px] ${
            isLight
              ? 'bg-[#FDE2E4] text-[#991B1B] border-[#DC2626]/30'
              : 'bg-[#DC2626]/15 text-[#FCA5A5] border-[#DC2626]/35'
          }`}>
            <Radio size={12} className="text-[#EF4444] animate-pulse" />
            <span className="max-w-[140px] truncate font-semibold">{activeTitle}</span>
          </div>
        )}
      </div>

      {/* Center: Device Platform Switcher & Interruption Test Trigger */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleOpenSimulator}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold transition-all shadow-sm active:scale-95 ${
            isLight
              ? 'bg-[#FFFDFB] hover:bg-[#FDE2E4] border-red-900/15 text-[#140E10]'
              : 'bg-gradient-to-r from-[#DC2626]/20 to-[#991B1B]/20 hover:from-[#DC2626]/30 hover:to-[#991B1B]/30 border-[#DC2626]/35 text-[#FAF5F2]'
          }`}
          title="Test Native Interruption Simulation"
        >
          <Bell size={12} className="text-[#EF4444]" />
          <span>Radio Lab</span>
        </button>

        {/* Viewport device selector */}
        <div className={`hidden md:flex items-center rounded-full p-0.5 border text-[10px] ${
          isLight ? 'bg-[#FFFDFB] border-red-900/15' : 'bg-[#141012] border-red-500/15'
        }`}>
          {(['RESPONSIVE', 'ANDROID', 'IOS', 'TABLET_IPAD'] as DevicePlatform[]).map((p) => {
            const labels: Record<DevicePlatform, string> = {
              RESPONSIVE: 'Default View',
              ANDROID: 'Pixel 9',
              IOS: 'iPhone 16',
              TABLET_IPAD: 'iPad View',
              TABLET_ANDROID: 'Tab View',
            };
            return (
              <button
                key={p}
                onClick={() => {
                  if (onSelectPlatform) {
                    onSelectPlatform(p);
                  } else if (onTogglePlatform) {
                    onTogglePlatform();
                  }
                }}
                className={`px-2.5 py-0.5 rounded-full transition-all ${
                  platform === p
                    ? 'bg-[#DC2626] text-white font-bold shadow-sm shadow-red-950/30'
                    : isLight
                    ? 'text-[#6E5B60] hover:text-[#140E10]'
                    : 'text-[#B8A9AD] hover:text-[#FAF5F2]'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Network & Battery status */}
      <div className={`flex items-center gap-2.5 ${isLight ? 'text-[#5F4E53]' : 'text-[#B8A9AD]'}`}>
        <span className="text-[10px] font-mono font-bold">5G</span>
        <Wifi size={13} className={isLight ? 'text-[#140E10]' : 'text-[#FAF5F2]'} />
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono">98%</span>
          <Battery size={15} className="text-emerald-400" />
        </div>
      </div>
    </header>
  );
};
