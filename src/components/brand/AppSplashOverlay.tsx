import React, { useEffect, useState } from 'react';
import { SonoraLogo } from './SonoraLogo';

interface AppSplashOverlayProps {
  visible: boolean;
  onComplete: () => void;
  themeMode?: string;
}

export const AppSplashOverlay: React.FC<AppSplashOverlayProps> = ({
  visible,
  onComplete,
  themeMode,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIsFadingOut(false);
      return;
    }

    setIsFadingOut(false);
    const fadeTimer = window.setTimeout(() => {
      setIsFadingOut(true);
    }, 1150);

    const doneTimer = window.setTimeout(() => {
      onComplete();
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [visible, onComplete]);

  if (!visible) return null;

  const isLight = themeMode === 'LIGHT';
  const isAmoled = themeMode === 'AMOLED';

  return (
    <div
      onClick={() => {
        setIsFadingOut(true);
        window.setTimeout(onComplete, 200);
      }}
      className={`absolute inset-0 z-[80] flex flex-col items-center justify-center select-none cursor-pointer transition-opacity duration-350 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${
        isLight
          ? 'bg-[#F5EFEA] text-[#140E10]'
          : isAmoled
          ? 'bg-[#030203] text-[#FAF5F2]'
          : 'bg-[#0A0809] text-[#FAF5F2]'
      }`}
    >
      {/* Retro Crimson Analog VU Radial Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_46%,rgba(220,38,38,0.28),rgba(153,27,27,0.12)_42%,transparent_72%)]" />

      {/* Center Animated Retro Cassette Logo & Crimson Ripples */}
      <div className="relative flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <span className="absolute w-28 h-28 rounded-[30px] border border-[#EF4444]/45 animate-sonic-ripple pointer-events-none" />
          <span className="absolute w-28 h-28 rounded-[30px] border border-[#DC2626]/35 animate-sonic-ripple-delayed pointer-events-none" />

          <div className="animate-logo-pop relative z-10">
            <SonoraLogo
              size={94}
              animated
              roundedClass="rounded-[24px]"
              className="shadow-2xl shadow-red-950/60 border border-red-500/25"
            />
          </div>
        </div>

        <div className="mt-7 text-center animate-splash-wordmark">
          <h1
            className={`text-2xl font-extrabold font-display uppercase tracking-[0.2em] bg-clip-text text-transparent ${
              isLight
                ? 'bg-gradient-to-r from-[#450A0A] via-[#DC2626] to-[#991B1B]'
                : 'bg-gradient-to-r from-[#FAF5F2] via-[#FCA5A5] to-[#DC2626]'
            }`}
          >
            WALKTONE
          </h1>
          <p
            className={`text-[11px] font-mono uppercase tracking-[0.22em] mt-1.5 ${
              isLight ? 'text-[#8D7B80]' : 'text-[#EF4444]/85'
            }`}
          >
            Analog Hi-Fi
          </p>
        </div>
      </div>
    </div>
  );
};
