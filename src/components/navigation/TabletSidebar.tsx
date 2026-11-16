import React from 'react';
import { Home, Search, Library, Settings, Heart, FolderPlus, Sparkles, Music2 } from 'lucide-react';
import { ScreenType, Playlist } from '../../types';
import { SonoraLogo } from '../brand/SonoraLogo';

interface TabletSidebarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  playlists: Playlist[];
  onSelectPlaylist: (id: string) => void;
  onOpenCreatePlaylist?: () => void;
  themeMode?: string;
}

export const TabletSidebar: React.FC<TabletSidebarProps> = ({
  currentScreen,
  onNavigate,
  playlists,
  onSelectPlaylist,
  onOpenCreatePlaylist,
  themeMode,
}) => {
  const isLight = themeMode === 'LIGHT';
  const isAmoled = themeMode === 'AMOLED';
  const mutedText = isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]';

  const navItems: { screen: ScreenType; label: string; icon: React.FC<{ size: number }> }[] = [
    { screen: 'HOME', label: 'Home', icon: Home },
    { screen: 'SEARCH', label: 'Search', icon: Search },
    { screen: 'LIBRARY', label: 'Library', icon: Library },
    { screen: 'SETTINGS', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`w-64 h-full hidden md:flex flex-col justify-between border-r shrink-0 select-none ${
        isLight
          ? 'bg-[#F5EFEA] border-red-900/15 text-[#140E10]'
          : isAmoled
          ? 'bg-[#030203] border-red-500/15 text-[#FAF5F2]'
          : 'bg-[#0A0809] border-red-500/15 text-[#FAF5F2]'
      } p-5`}
    >
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <SonoraLogo size={40} roundedClass="rounded-2xl" />
          <div>
            <h1
              className={`font-extrabold text-xl font-display tracking-[0.16em] uppercase bg-clip-text text-transparent ${
                isLight
                  ? 'bg-gradient-to-r from-[#7F1D1D] via-[#DC2626] to-[#991B1B]'
                  : 'bg-gradient-to-r from-[#FAF5F2] via-[#FCA5A5] to-[#DC2626]'
              }`}
            >
              WALKTONE
            </h1>
            <p className={`text-[10px] font-mono font-bold tracking-widest uppercase ${mutedText}`}>
              Analog Hi-Fi
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1.5">
          {navItems.map(({ screen, label, icon: Icon }) => {
            const isActive = currentScreen === screen;
            return (
              <button
                key={screen}
                onClick={() => onNavigate(screen)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all active:scale-98 ${
                  isActive
                    ? isLight
                      ? 'bg-[#FDE2E4] text-[#991B1B] border border-[#DC2626]/40 shadow-sm'
                      : 'bg-[#DC2626]/15 text-[#EF4444] border border-[#DC2626]/35 shadow-md shadow-red-950/35'
                    : isLight
                    ? 'text-[#5F4E53] hover:text-[#140E10] hover:bg-red-900/5 border border-transparent'
                    : 'text-[#B8A9AD] hover:text-[#FAF5F2] hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Playlists Section */}
        <div className={`mt-8 pt-5 border-t ${isLight ? 'border-red-900/10' : 'border-red-500/15'}`}>
          <div className="flex items-center justify-between px-2 mb-3">
            <span className={`text-[11px] font-mono font-bold uppercase tracking-widest ${mutedText}`}>
              Mixtapes
            </span>
            {onOpenCreatePlaylist && (
              <button
                onClick={onOpenCreatePlaylist}
                className="p-1 rounded-md hover:bg-red-500/10 text-[#DC2626] hover:text-[#EF4444]"
                title="Create playlist"
              >
                <FolderPlus size={15} />
              </button>
            )}
          </div>

          <div className="space-y-1 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => onSelectPlaylist(pl.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left truncate group ${
                  isLight
                    ? 'text-[#5F4E53] hover:text-[#140E10] hover:bg-red-900/5'
                    : 'text-[#B8A9AD] hover:text-[#FAF5F2] hover:bg-white/5'
                }`}
              >
                {pl.id === 'playlist-loved' ? (
                  <Heart size={14} className="text-[#DC2626] fill-[#DC2626] shrink-0" />
                ) : (
                  <Music2 size={14} className={`${mutedText} group-hover:text-[#EF4444] shrink-0`} />
                )}
                <span className="truncate">{pl.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Pro Badge */}
      <div className={`p-4 rounded-3xl border text-xs shadow-lg ${
        isLight
          ? 'bg-[#FFFDFB] border-red-900/15'
          : 'bg-gradient-to-br from-[#191315] to-[#0A0809] border-red-500/20'
      }`}>
        <div className="flex items-center gap-1.5 text-[#EF4444] font-mono font-bold text-[11px] uppercase tracking-wider mb-1">
          <Sparkles size={14} />
          <span>Analog Tape & Hi-Fi Engine</span>
        </div>
        <p className={`text-[11px] leading-relaxed ${mutedText}`}>
          Warm 24-bit / 96kHz WebAudio & offline tape deck storage active.
        </p>
      </div>
    </aside>
  );
};
