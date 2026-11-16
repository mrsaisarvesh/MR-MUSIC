import React from 'react';
import { Home, Search, Library, Settings as SettingsIcon } from 'lucide-react';
import { ScreenType } from '../../types';

interface BottomNavigationProps {
  currentScreen?: ScreenType;
  activeTab?: string;
  onNavigate?: (screen: ScreenType) => void;
  onSelectTab?: (tab: ScreenType) => void;
  favoritesCount?: number;
  themeMode?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentScreen,
  activeTab,
  onNavigate,
  onSelectTab,
  favoritesCount = 0,
  themeMode,
}) => {
  const isLight = themeMode === 'LIGHT';
  const isAmoled = themeMode === 'AMOLED';
  const active = currentScreen || activeTab || 'HOME';

  const handleSelect = (screen: ScreenType) => {
    if (onNavigate) onNavigate(screen);
    if (onSelectTab) onSelectTab(screen);
  };

  const navItems: { screen: ScreenType; label: string; icon: React.FC<{ size: number; className?: string }> }[] = [
    { screen: 'HOME', label: 'Home', icon: Home },
    { screen: 'SEARCH', label: 'Search', icon: Search },
    { screen: 'LIBRARY', label: 'Library', icon: Library },
    { screen: 'SETTINGS', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <nav
      className={`w-full transition-colors z-20 shrink-0 ${
        isLight
          ? 'bg-[#F5EFEA]/95 border-t border-red-900/15 text-[#5F4E53]'
          : isAmoled
          ? 'bg-[#030203]/95 border-t border-red-500/15 text-[#FAF5F2]'
          : 'bg-[#0A0809]/95 border-t border-red-500/15 text-[#FAF5F2]'
      } backdrop-blur-xl`}
    >
      <div className="grid grid-cols-4 items-center px-2 py-1.5 max-w-xl mx-auto">
        {navItems.map(({ screen, label, icon: Icon }) => {
          const isActive = active === screen;
          return (
            <button
              key={screen}
              onClick={() => handleSelect(screen)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 ${
                isActive
                  ? 'text-[#DC2626]'
                  : isLight
                  ? 'text-[#6E5B60] hover:text-[#140E10]'
                  : 'text-[#B8A9AD] hover:text-[#FAF5F2]'
              }`}
              aria-label={label}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-transform duration-150 ${
                    isActive ? 'scale-105 text-[#DC2626]' : ''
                  }`}
                />
                {screen === 'LIBRARY' && favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 rounded-full bg-[#DC2626] text-white text-[9px] font-mono font-bold leading-tight">
                    {favoritesCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold tracking-tight whitespace-nowrap ${
                  isActive ? 'text-[#DC2626]' : ''
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
