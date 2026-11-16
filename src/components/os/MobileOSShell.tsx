import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  Signal,
  Lock,
  Unlock,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music2,
  Search,
  Library,
  Settings,
  Sliders,
  Upload,
  Radio,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Volume1,
  Bluetooth,
  Smartphone,
  PhoneCall,
  PhoneOff,
  ChevronLeft,
  Home,
  Layers,
  BellOff,
  Maximize2,
  Disc,
  X,
} from 'lucide-react';
import { DevicePlatform, ScreenType, Song, ThemeMode } from '../../types';
import { SonoraLogo } from '../brand/SonoraLogo';

export type OSViewMode = 'LOCKED' | 'HOME' | 'APP' | 'RECENTS';

interface MobileOSShellProps {
  platform: DevicePlatform;
  onSelectPlatform: (platform: DevicePlatform) => void;
  osView: OSViewMode;
  onChangeOsView: (view: OSViewMode) => void;
  isControlCenterOpen: boolean;
  onToggleControlCenter: (open: boolean) => void;
  incomingCallActive: boolean;
  onAnswerCall: () => void;
  onDeclineCall: () => void;
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  equalizerPreset: string;
  themeMode: ThemeMode;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSetVolume: (vol: number) => void;
  onCycleTheme: () => void;
  onOpenAppScreen: (screen: ScreenType) => void;
  onOpenFullPlayer: () => void;
  onOpenEqualizer: () => void;
  onOpenImport: () => void;
  onOpenInterruptionLab: () => void;
  onTriggerCall: () => void;
  onNavigateBack: () => void;
  children: React.ReactNode;
}

const WALLPAPER_URL = '/src/assets/images/retro_red_black_wallpaper_1794859414205.jpg';

export const MobileOSShell: React.FC<MobileOSShellProps> = ({
  platform,
  onSelectPlatform,
  osView,
  onChangeOsView,
  isControlCenterOpen,
  onToggleControlCenter,
  incomingCallActive,
  onAnswerCall,
  onDeclineCall,
  currentSong,
  isPlaying,
  position,
  duration,
  volume,
  equalizerPreset,
  themeMode,
  onTogglePlay,
  onNext,
  onPrevious,
  onSetVolume,
  onCycleTheme,
  onOpenAppScreen,
  onOpenFullPlayer,
  onOpenEqualizer,
  onOpenImport,
  onOpenInterruptionLab,
  onTriggerCall,
  onNavigateBack,
  children,
}) => {
  const [now, setNow] = useState(() => new Date());
  const [brightness, setBrightness] = useState(100);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [dndEnabled, setDndEnabled] = useState(false);
  const [volumeHudVisible, setVolumeHudVisible] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isStandalonePwa, setIsStandalonePwa] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalonePwa(standalone);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!incomingCallActive) {
      setCallAccepted(false);
    }
  }, [incomingCallActive]);

  useEffect(() => {
    if (!volumeHudVisible) return;
    const t = setTimeout(() => setVolumeHudVisible(false), 1800);
    return () => clearTimeout(t);
  }, [volumeHudVisible, volume]);

  const adjustVolume = (delta: number) => {
    const nextVol = Math.max(0, Math.min(1, Number((volume + delta).toFixed(2))));
    onSetVolume(nextVol);
    setVolumeHudVisible(true);
  };

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeStr = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}`;
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const isIOS = platform === 'IOS';
  const isFullViewport = platform === 'RESPONSIVE';
  const isLight = themeMode === 'LIGHT';
  const progressPercent = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  const formatTime = (secs: number) => {
    const total = Math.floor(secs || 0);
    return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
  };

  const launcherApps = [
    {
      id: 'walktone',
      label: 'Walktone',
      icon: Disc,
      gradient: 'from-[#DC2626] to-[#7F1D1D]',
      useLogo: true,
      onClick: () => onOpenAppScreen('HOME'),
    },
    {
      id: 'eq',
      label: 'EQ Deck',
      icon: Sliders,
      gradient: 'from-[#2A1418] to-[#0E080A]',
      useLogo: false,
      onClick: () => {
        onOpenAppScreen('HOME');
        setTimeout(() => onOpenEqualizer(), 80);
      },
    },
    {
      id: 'import',
      label: 'Tapes',
      icon: Upload,
      gradient: 'from-[#7F1D1D] to-[#1A0D10]',
      useLogo: false,
      onClick: () => {
        onOpenAppScreen('LIBRARY');
        setTimeout(() => onOpenImport(), 80);
      },
    },
    {
      id: 'audio-lab',
      label: 'Radio Lab',
      icon: Radio,
      gradient: 'from-[#1F1518] to-[#0A0809]',
      useLogo: false,
      onClick: () => {
        onOpenAppScreen('HOME');
        setTimeout(() => onOpenInterruptionLab(), 80);
      },
    },
  ];

  const renderOSViewport = () => (
    <div
      className={`relative w-full h-full flex flex-col overflow-hidden select-none transition-colors ${
        isLight && osView === 'APP' ? 'bg-[#F5EFEA] text-[#140E10]' : 'bg-[#0A0809] text-[#FAF5F2]'
      } ${isFullViewport ? '' : 'sm:rounded-[40px]'}`}
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Brightness Dimmer Layer */}
      {brightness < 100 && (
        <div
          className="absolute inset-0 bg-black pointer-events-none z-[70] transition-opacity duration-200"
          style={{ opacity: ((100 - brightness) / 100) * 0.72 }}
        />
      )}

      {/* OS Top Status Bar */}
      <div
        onClick={() => {
          if (osView !== 'LOCKED' && !incomingCallActive) {
            onToggleControlCenter(!isControlCenterOpen);
          }
        }}
        className={`relative z-40 shrink-0 h-11 px-5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
          osView === 'LOCKED' || osView === 'HOME'
            ? 'bg-transparent text-white'
            : isLight
            ? 'bg-[#FFFDFB]/90 text-[#140E10]'
            : 'bg-[#0A0809]/90 text-[#FAF5F2]'
        }`}
        title="Tap to open Quick Settings"
      >
        {/* Left: Clock */}
        <div className="flex items-center gap-1.5 min-w-[64px]">
          <span className="font-semibold tracking-tight tabular-nums text-[13px]">{timeStr}</span>
          {!isIOS && isPlaying && <Music2 size={12} className="text-[#EF4444]" />}
          {dndEnabled && <BellOff size={11} className="opacity-70" />}
        </div>

        {/* Center Hardware Cutout: Dynamic Island (iOS) or Punch-Hole (Android) */}
        {isIOS ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (osView === 'LOCKED') return;
              if (currentSong) {
                onOpenAppScreen('HOME');
                onOpenFullPlayer();
              } else {
                onToggleControlCenter(!isControlCenterOpen);
              }
            }}
            className={`flex items-center justify-between gap-2 rounded-full bg-black border border-white/10 transition-all duration-300 shadow-lg ${
              isPlaying && currentSong
                ? 'px-2.5 py-1 min-w-[136px] max-w-[168px]'
                : 'w-24 h-6 px-3 justify-center'
            }`}
            aria-label="Dynamic Island"
          >
            {isPlaying && currentSong ? (
              <>
                <img
                  src={currentSong.artwork}
                  alt={currentSong.title}
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
                <span className="text-[10px] font-medium text-white truncate flex-1 text-left">
                  {currentSong.title}
                </span>
                <div className="flex items-end gap-0.5 h-2.5 shrink-0">
                  <div className="w-0.5 bg-[#EF4444] rounded-full animate-music-bar-1" />
                  <div className="w-0.5 bg-[#DC2626] rounded-full animate-music-bar-2" />
                  <div className="w-0.5 bg-red-300 rounded-full animate-music-bar-3" />
                </div>
              </>
            ) : (
              <div className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-800 ml-auto" />
            )}
          </button>
        ) : (
          <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/15 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
          </div>
        )}

        {/* Right: Signal / Wi-Fi / Battery */}
        <div className="flex items-center gap-1.5 min-w-[64px] justify-end">
          <Signal size={12} className="opacity-85" />
          {wifiEnabled && <Wifi size={12} className="opacity-85" />}
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] font-semibold tabular-nums">98%</span>
            <Battery size={14} className="text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Main OS Body */}
      <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* VIEW 1: LOCK SCREEN */}
        {osView === 'LOCKED' && (
          <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 text-white animate-fade-in">
            <img
              src={WALLPAPER_URL}
              alt="Lock Screen Wallpaper"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/85" />

            {/* Clock & Date */}
            <div className="relative z-10 text-center pt-8">
              <p className="text-sm font-medium text-white/80">{dateStr}</p>
              <div className="text-7xl font-bold tracking-tight tabular-nums font-display mt-1 text-white drop-shadow-xl">
                {timeStr}
              </div>
            </div>

            {/* Now Playing Lock Widget & Unlock */}
            <div className="relative z-10 space-y-4">
              {currentSong && (
                <div className="rounded-3xl bg-black/65 backdrop-blur-2xl border border-white/15 p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentSong.artwork}
                      alt={currentSong.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-white truncate">{currentSong.title}</h4>
                      <p className="text-xs text-white/70 truncate">{currentSong.artist}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="h-1 bg-white/15 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#DC2626] transition-all duration-200"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/60 tabular-nums mt-1">
                      <span>{formatTime(position)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-around pt-1">
                    <button
                      onClick={onPrevious}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-white active:scale-95"
                      aria-label="Previous track"
                    >
                      <SkipBack size={20} />
                    </button>
                    <button
                      onClick={onTogglePlay}
                      className="w-11 h-11 rounded-full bg-[#DC2626] hover:bg-[#EF4444] text-white flex items-center justify-center shadow-lg shadow-red-950/60 active:scale-95"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5 fill-white" />}
                    </button>
                    <button
                      onClick={onNext}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-white active:scale-95"
                      aria-label="Next track"
                    >
                      <SkipForward size={20} />
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => onChangeOsView('HOME')}
                className="w-full min-h-[48px] rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 flex items-center justify-center gap-2 text-xs font-semibold text-white transition-all active:scale-[0.98]"
              >
                <Unlock size={15} />
                <span>Tap to Unlock</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: MOBILE OS HOME LAUNCHER */}
        {osView === 'HOME' && (
          <div className="absolute inset-0 z-20 flex flex-col justify-between p-5 text-white animate-fade-in">
            <img
              src={WALLPAPER_URL}
              alt="OS Wallpaper"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

            <div className="relative z-10 space-y-6 pt-2">
              {/* Minimal Date & Lock */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <p className="text-xs text-white/75 font-medium">{dateStr}</p>
                  <h2 className="text-2xl font-bold font-display tracking-tight">{timeStr}</h2>
                </div>
                <button
                  onClick={() => onChangeOsView('LOCKED')}
                  className="min-w-[44px] min-h-[44px] rounded-full bg-black/40 border border-white/15 flex items-center justify-center text-white/80 hover:text-white"
                  title="Lock Screen"
                >
                  <Lock size={16} />
                </button>
              </div>

              {/* Walktone Now Playing Widget */}
              {currentSong && (
                <div
                  onClick={() => onOpenAppScreen('HOME')}
                  className="rounded-3xl bg-black/65 backdrop-blur-2xl border border-white/15 p-4 shadow-2xl cursor-pointer active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={currentSong.artwork}
                      alt={currentSong.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#EF4444]">
                        Now Playing
                      </p>
                      <h4 className="font-bold text-sm text-white truncate">{currentSong.title}</h4>
                      <p className="text-xs text-white/65 truncate">{currentSong.artist}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePlay();
                      }}
                      className="w-11 h-11 rounded-full bg-[#DC2626] hover:bg-[#EF4444] text-white flex items-center justify-center shadow-lg shadow-red-950/60 shrink-0"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause size={17} /> : <Play size={17} className="ml-0.5 fill-white" />}
                    </button>
                  </div>
                  <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#DC2626] transition-all duration-200"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Clean 4-App Row */}
              <div className="grid grid-cols-4 gap-3 pt-1">
                {launcherApps.map((app) => {
                  const Icon = app.icon;
                  return (
                    <button
                      key={app.id}
                      onClick={app.onClick}
                      className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
                    >
                      {app.useLogo ? (
                        <SonoraLogo
                          size={56}
                          roundedClass={isIOS ? 'rounded-[16px]' : 'rounded-2xl'}
                          className="border border-red-500/30 group-hover:border-[#EF4444]/80"
                        />
                      ) : (
                        <div
                          className={`w-14 h-14 ${
                            isIOS ? 'rounded-[16px]' : 'rounded-2xl'
                          } bg-gradient-to-br ${app.gradient} border border-red-500/25 shadow-lg flex items-center justify-center group-hover:border-[#DC2626]/75`}
                        >
                          <Icon size={24} className="text-[#FAF5F2]" />
                        </div>
                      )}
                      <span className="text-[11px] font-medium text-[#FAF5F2]/90 truncate max-w-full">
                        {app.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Pinned Dock */}
            <div className="relative z-10 rounded-3xl bg-black/45 backdrop-blur-2xl border border-red-500/25 px-4 py-2.5 flex items-center justify-around">
              {[
                { label: 'Walktone', icon: Disc, action: () => onOpenAppScreen('HOME'), highlight: true },
                { label: 'Search', icon: Search, action: () => onOpenAppScreen('SEARCH') },
                { label: 'Library', icon: Library, action: () => onOpenAppScreen('LIBRARY') },
                { label: 'Settings', icon: Settings, action: () => onOpenAppScreen('SETTINGS') },
              ].map((item) => {
                const Icon = item.icon;
                if (item.highlight) {
                  return (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="transition-transform active:scale-90"
                      aria-label={item.label}
                      title={item.label}
                    >
                      <SonoraLogo size={48} roundedClass="rounded-2xl" />
                    </button>
                  );
                }
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform active:scale-90 bg-[#141012]/90 text-[#FAF5F2] hover:bg-[#241A1D] border border-red-500/15"
                    aria-label={item.label}
                    title={item.label}
                  >
                    <Icon size={22} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 3: APP SWITCHER */}
        {osView === 'RECENTS' && (
          <div className="absolute inset-0 z-25 bg-[#0A0809]/95 backdrop-blur-xl flex flex-col justify-between p-5 text-[#FAF5F2] animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-display">Open Apps</h2>
              <button
                onClick={() => onChangeOsView('HOME')}
                className="text-xs font-semibold text-[#EF4444] hover:text-red-300 min-h-[44px] px-2"
              >
                Home
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-3">
              {[
                {
                  title: 'Walktone Hi-Fi',
                  subtitle: currentSong ? `${currentSong.title} · ${currentSong.artist}` : 'Ready to play',
                  icon: Disc,
                  action: () => onOpenAppScreen('HOME'),
                },
                {
                  title: 'Equalizer Deck',
                  subtitle: `Preset: ${equalizerPreset}`,
                  icon: Sliders,
                  action: () => {
                    onOpenAppScreen('HOME');
                    setTimeout(() => onOpenEqualizer(), 80);
                  },
                },
                {
                  title: 'Audio Interruption Lab',
                  subtitle: isIOS ? 'AVAudioSession Bridge' : 'AudioFocus Manager',
                  icon: Radio,
                  action: () => {
                    onOpenAppScreen('HOME');
                    setTimeout(() => onOpenInterruptionLab(), 80);
                  },
                },
                {
                  title: 'Settings',
                  subtitle: `Theme: ${themeMode}`,
                  icon: Settings,
                  action: () => onOpenAppScreen('SETTINGS'),
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.title}
                    onClick={card.action}
                    className="w-full p-4 rounded-2xl bg-[#141012] hover:bg-[#201619] border border-red-500/15 flex items-center gap-3.5 text-left transition-all active:scale-[0.98]"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#DC2626]/20 text-[#EF4444] flex items-center justify-center shrink-0">
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-[#FAF5F2] truncate">{card.title}</h4>
                      <p className="text-xs text-[#B8A9AD] truncate mt-0.5">{card.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onChangeOsView('APP')}
              className="w-full min-h-[44px] rounded-2xl bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-semibold transition-colors shadow-lg shadow-red-950/50"
            >
              Back to Walktone
            </button>
          </div>
        )}

        {/* VIEW 4: ACTIVE APP (WALKTONE) */}
        <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${osView === 'APP' ? 'flex' : 'hidden'}`}>
          {children}
        </div>

        {/* CONTROL CENTER / QUICK SETTINGS SHADE */}
        {isControlCenterOpen && (
          <div
            onClick={() => onToggleControlCenter(false)}
            className="absolute inset-0 z-50 bg-black/75 backdrop-blur-2xl p-4 flex flex-col justify-between animate-slide-down"
          >
            <div onClick={(e) => e.stopPropagation()} className="space-y-4 overflow-y-auto pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {isIOS ? 'Control Center' : 'Quick Settings'}
                  </h3>
                  <p className="text-[11px] text-[#A3A3B2]">
                    {isIOS ? 'iOS 18' : 'Android 15'}
                  </p>
                </div>
                <button
                  onClick={() => onToggleControlCenter(false)}
                  className="min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                  aria-label="Close Quick Settings"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setWifiEnabled(!wifiEnabled)}
                  className={`p-3 rounded-2xl flex items-center gap-2.5 text-left transition-all min-h-[54px] ${
                    wifiEnabled ? 'bg-[#DC2626] text-white' : 'bg-[#141012] text-[#B8A9AD]'
                  }`}
                >
                  <Wifi size={18} />
                  <div>
                    <div className="text-xs font-bold">Wi-Fi</div>
                    <div className="text-[10px] opacity-80">{wifiEnabled ? 'Connected' : 'Off'}</div>
                  </div>
                </button>

                <button
                  onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
                  className={`p-3 rounded-2xl flex items-center gap-2.5 text-left transition-all min-h-[54px] ${
                    bluetoothEnabled ? 'bg-[#DC2626] text-white' : 'bg-[#141012] text-[#B8A9AD]'
                  }`}
                >
                  <Bluetooth size={18} />
                  <div>
                    <div className="text-xs font-bold">Bluetooth</div>
                    <div className="text-[10px] opacity-80">
                      {bluetoothEnabled ? (isIOS ? 'AirPods' : 'Buds') : 'Off'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setDndEnabled(!dndEnabled)}
                  className={`p-3 rounded-2xl flex items-center gap-2.5 text-left transition-all min-h-[54px] ${
                    dndEnabled ? 'bg-[#DC2626] text-white' : 'bg-[#141012] text-[#B8A9AD]'
                  }`}
                >
                  <BellOff size={18} />
                  <div>
                    <div className="text-xs font-bold">Focus</div>
                    <div className="text-[10px] opacity-80">{dndEnabled ? 'On' : 'Off'}</div>
                  </div>
                </button>

                <button
                  onClick={onCycleTheme}
                  className="p-3 rounded-2xl bg-[#141012] text-[#FAF5F2] flex items-center gap-2.5 text-left min-h-[54px]"
                >
                  {themeMode === 'LIGHT' ? (
                    <Sun size={18} className="text-[#EF4444]" />
                  ) : (
                    <Moon size={18} className="text-[#EF4444]" />
                  )}
                  <div>
                    <div className="text-xs font-bold">Theme</div>
                    <div className="text-[10px] text-[#B8A9AD]">{themeMode}</div>
                  </div>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#120E10] border border-red-500/15 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-[#FAF5F2]">
                      <Sun size={14} className="text-[#EF4444]" />
                      Brightness
                    </span>
                    <span className="font-mono text-[#B8A9AD] tabular-nums">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                    className="w-full h-2 rounded-lg bg-white/10 accent-[#DC2626] cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-[#FAF5F2]">
                      <Volume2 size={14} className="text-[#EF4444]" />
                      Volume
                    </span>
                    <span className="font-mono text-[#B8A9AD] tabular-nums">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={volume}
                    onChange={(e) => onSetVolume(parseFloat(e.target.value))}
                    className="w-full h-2 rounded-lg bg-white/10 accent-[#DC2626] cursor-pointer"
                  />
                </div>
              </div>

              {/* Quick Call / Audio Lab Triggers inside Quick Panel */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    onToggleControlCenter(false);
                    onTriggerCall();
                  }}
                  className="p-3 rounded-2xl bg-[#141012] hover:bg-[#201619] border border-red-500/15 text-[#FAF5F2] text-xs font-medium flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <PhoneCall size={14} className="text-[#EF4444]" />
                  <span>Call Test</span>
                </button>
                <button
                  onClick={() => {
                    onToggleControlCenter(false);
                    onOpenInterruptionLab();
                  }}
                  className="p-3 rounded-2xl bg-[#141012] hover:bg-[#201619] border border-red-500/15 text-[#FAF5F2] text-xs font-medium flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Radio size={14} className="text-[#EF4444]" />
                  <span>Audio Lab</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => onToggleControlCenter(false)}
              className="w-full py-2.5 text-center text-xs font-medium text-[#B8A9AD] hover:text-white"
            >
              Tap anywhere to close
            </button>
          </div>
        )}

        {/* INCOMING CALL OVERLAY */}
        {incomingCallActive && (
          <div className="absolute inset-0 z-[60] bg-gradient-to-b from-[#2A1014] via-[#0A0809] to-black p-6 flex flex-col justify-between text-[#FAF5F2] animate-fade-in">
            <div className="text-center pt-10 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#EF4444]">
                {callAccepted ? 'On Call · Audio Paused' : isIOS ? 'iPhone Audio Call' : 'Incoming Call'}
              </p>
              <div className="w-20 h-20 mx-auto rounded-full bg-[#DC2626]/20 border border-[#EF4444]/45 flex items-center justify-center my-4">
                <PhoneCall size={34} className="text-[#EF4444]" />
              </div>
              <h2 className="text-2xl font-bold font-display">Studio Producer</h2>
              <p className="text-xs text-[#B8A9AD]">
                {isIOS ? 'AVAudioSession interruption' : 'AUDIOFOCUS_LOSS_TRANSIENT'}
              </p>
            </div>

            <div className="flex items-center justify-around pb-8">
              <button onClick={onDeclineCall} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center shadow-xl active:scale-95 transition-transform">
                  <PhoneOff size={24} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-white">
                  {callAccepted ? 'End & Resume' : 'Decline'}
                </span>
              </button>

              {!callAccepted && (
                <button
                  onClick={() => {
                    setCallAccepted(true);
                    onAnswerCall();
                  }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center shadow-xl active:scale-95 transition-transform">
                    <PhoneCall size={24} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white">Answer</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ON-SCREEN NATIVE VOLUME HUD */}
        {volumeHudVisible && (
          <div
            className={`absolute top-24 z-[65] ${
              isIOS ? 'left-3' : 'right-3'
            } bg-[#120E10]/95 border border-red-500/25 rounded-2xl p-2.5 flex flex-col items-center gap-2 shadow-2xl animate-fade-in`}
          >
            {volume === 0 ? (
              <VolumeX size={15} className="text-[#B8A9AD]" />
            ) : volume < 0.5 ? (
              <Volume1 size={15} className="text-[#EF4444]" />
            ) : (
              <Volume2 size={15} className="text-[#EF4444]" />
            )}
            <div className="w-2 h-24 rounded-full bg-white/15 overflow-hidden flex flex-col justify-end">
              <div
                className="w-full bg-[#DC2626] rounded-full transition-all duration-150"
                style={{ height: `${Math.round(volume * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono tabular-nums text-[#FAF5F2]">
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* OS Bottom Gesture Navigation Bar */}
      <div
        className={`shrink-0 h-7 px-6 flex items-center justify-center z-40 ${
          isLight && osView === 'APP' ? 'bg-[#FFFDFB] text-[#140E10]' : 'bg-[#0A0809] text-[#FAF5F2]'
        }`}
      >
        {isIOS ? (
          <div className="w-full flex items-center justify-between">
            <button
              onClick={onNavigateBack}
              className="text-[10px] font-medium opacity-60 hover:opacity-100 px-2 py-1"
            >
              Back
            </button>
            <button
              onClick={() => onChangeOsView(osView === 'HOME' ? 'APP' : 'HOME')}
              className="w-28 h-1 rounded-full bg-current opacity-40 hover:opacity-90 transition-opacity"
              aria-label="OS Home Indicator"
            />
            <button
              onClick={() => onChangeOsView(osView === 'RECENTS' ? 'APP' : 'RECENTS')}
              className="text-[10px] font-medium opacity-60 hover:opacity-100 px-2 py-1"
            >
              Apps
            </button>
          </div>
        ) : (
          <div className="w-full max-w-[200px] flex items-center justify-between">
            <button
              onClick={onNavigateBack}
              className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Back"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => onChangeOsView(osView === 'HOME' ? 'APP' : 'HOME')}
              className="w-16 h-1.5 rounded-full bg-current opacity-50 hover:opacity-95 transition-opacity"
              aria-label="Home"
            />
            <button
              onClick={() => onChangeOsView(osView === 'RECENTS' ? 'APP' : 'RECENTS')}
              className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Recent Apps"
            >
              <Layers size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (isStandalonePwa) {
    return (
      <div
        className={`w-full h-dvh flex flex-col overflow-hidden relative ${
          isLight ? 'bg-[#F5EFEA] text-[#140E10]' : 'bg-[#0A0809] text-[#FAF5F2]'
        }`}
      >
        {children}
      </div>
    );
  }

  if (isFullViewport) {
    return (
      <div className="w-full h-dvh flex flex-col overflow-hidden relative bg-[#0A0809]">
        <button
          onClick={() => onSelectPlatform('ANDROID')}
          className="hidden sm:flex fixed top-12 right-4 z-[60] items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141012]/90 border border-red-500/25 text-xs font-semibold text-[#FAF5F2] hover:bg-[#DC2626] transition-colors shadow-lg"
        >
          <Smartphone size={13} />
          <span>Phone View</span>
        </button>
        {renderOSViewport()}
      </div>
    );
  }

  return (
    <div className="w-full h-dvh overflow-hidden bg-[#030203] text-[#FAF5F2] flex flex-col items-center justify-center relative">
      {/* Crimson Hi-Fi Ambient Glow */}
      <div className="hidden sm:block absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,rgba(220,38,38,0.18),transparent_55%)]" />

      {/* Mobile full-bleed viewport (<640px) */}
      <div className="sm:hidden w-full h-full flex flex-col overflow-hidden">
        {renderOSViewport()}
      </div>

      {/* Sleek Compact Top OS Bar on Desktop */}
      <div className="hidden sm:flex items-center gap-2 mb-3 z-10 px-2 py-1.5 rounded-full bg-[#120E10]/90 border border-red-500/20 shadow-xl backdrop-blur-md">
        <div className="flex items-center bg-[#0B0809] rounded-full p-0.5 border border-white/5">
          <button
            onClick={() => onSelectPlatform('ANDROID')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              platform === 'ANDROID' ? 'bg-[#DC2626] text-white' : 'text-[#B8A9AD] hover:text-white'
            }`}
          >
            Android 15
          </button>
          <button
            onClick={() => onSelectPlatform('IOS')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              platform === 'IOS' ? 'bg-[#DC2626] text-white' : 'text-[#B8A9AD] hover:text-white'
            }`}
          >
            iOS 18
          </button>
        </div>

        <div className="w-px h-4 bg-white/10" />

        <button
          onClick={() => onChangeOsView(osView === 'LOCKED' ? 'HOME' : 'LOCKED')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            osView === 'LOCKED' ? 'bg-white/15 text-white' : 'text-[#B8A9AD] hover:text-white'
          }`}
        >
          <Lock size={12} />
          <span>{osView === 'LOCKED' ? 'Unlock' : 'Lock'}</span>
        </button>

        <button
          onClick={() => onChangeOsView(osView === 'HOME' ? 'APP' : 'HOME')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            osView === 'HOME' ? 'bg-white/15 text-white' : 'text-[#B8A9AD] hover:text-white'
          }`}
        >
          <Home size={12} />
          <span>{osView === 'HOME' ? 'App' : 'Launcher'}</span>
        </button>

        <button
          onClick={() => onToggleControlCenter(!isControlCenterOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            isControlCenterOpen ? 'bg-white/15 text-white' : 'text-[#B8A9AD] hover:text-white'
          }`}
        >
          <Sliders size={12} />
          <span>Controls</span>
        </button>

        <button
          onClick={() => onSelectPlatform('RESPONSIVE')}
          className="p-1.5 rounded-full text-[#B8A9AD] hover:text-white hover:bg-white/10 transition-colors"
          title="Expand Full Screen"
          aria-label="Expand Full Screen"
        >
          <Maximize2 size={13} />
        </button>
      </div>

      {/* Centered Smartphone Chassis */}
      <div className="hidden sm:flex items-center justify-center relative z-10">
        {/* Left Volume Buttons */}
        <div className="flex flex-col gap-2.5 -mr-1 z-0">
          <button
            onClick={() => adjustVolume(0.1)}
            className="w-1.5 h-10 rounded-l-md bg-[#2D2225] hover:bg-[#DC2626] transition-colors cursor-pointer"
            title="Volume Up"
            aria-label="Volume Up"
          />
          <button
            onClick={() => adjustVolume(-0.1)}
            className="w-1.5 h-10 rounded-l-md bg-[#2D2225] hover:bg-[#DC2626] transition-colors cursor-pointer"
            title="Volume Down"
            aria-label="Volume Down"
          />
        </div>

        {/* Brushed Obsidian & Crimson Smartphone Bezel */}
        <div className="relative w-[390px] h-[min(796px,calc(100dvh-76px))] rounded-[48px] p-[9px] bg-gradient-to-b from-[#3B2E32] via-[#171113] to-[#261D20] shadow-[0_28px_80px_-16px_rgba(0,0,0,0.95),0_0_60px_-15px_rgba(220,38,38,0.26)] border border-red-500/20">
          <div className="w-full h-full rounded-[40px] overflow-hidden bg-[#0A0809] ring-1 ring-black">
            {renderOSViewport()}
          </div>
        </div>

        {/* Right Power Button */}
        <div className="-ml-1 z-0">
          <button
            onClick={() => onChangeOsView(osView === 'LOCKED' ? 'HOME' : 'LOCKED')}
            className="w-1.5 h-14 rounded-r-md bg-[#2D2225] hover:bg-[#DC2626] transition-colors cursor-pointer"
            title="Power / Lock"
            aria-label="Power / Lock"
          />
        </div>
      </div>
    </div>
  );
};
