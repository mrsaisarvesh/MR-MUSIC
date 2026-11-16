import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, MoreVertical, X, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'card';
  themeMode?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  themeMode,
}) => {
  const { isInstallable, isInstalled, isIOS, isInIframe, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const isLight = themeMode === 'LIGHT';

  if (isInstalled) {
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowGuide(true);
      }
      return;
    }
    setShowGuide(true);
  };

  const handleCopyUrl = () => {
    const cleanUrl = window.location.origin;
    navigator.clipboard?.writeText(cleanUrl).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }).catch(() => {});
  };

  return (
    <>
      {variant === 'compact' ? (
        <button
          onClick={handleAction}
          className="min-h-[36px] px-3 rounded-full bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-950/50 transition-all active:scale-95 shrink-0 whitespace-nowrap"
          aria-label="Install WALKTONE on mobile"
        >
          <Download size={13} />
          <span>{isInstallable ? 'Install App' : 'Install'}</span>
        </button>
      ) : (
        <button
          onClick={handleAction}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-950/45 transition-all active:scale-[0.98]"
        >
          <Smartphone size={15} />
          <span>{isInstallable ? 'Install WALKTONE on This Device' : 'How to Install on Android / iPhone'}</span>
        </button>
      )}

      {showGuide && (
        <div
          onClick={() => setShowGuide(false)}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl space-y-4 ${
              isLight
                ? 'bg-[#FFFDFB] border-red-900/15 text-[#140E10]'
                : 'bg-[#120E10] border-red-500/25 text-[#FAF5F2]'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${
              isLight ? 'border-red-900/10' : 'border-red-500/15'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#DC2626]/20 text-[#EF4444]">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h3 className="font-bold font-display text-sm">Install WALKTONE</h3>
                  <p className={`text-[11px] ${isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]'}`}>
                    Offline standalone mobile app
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className={`min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center ${
                  isLight ? 'hover:bg-red-900/10 text-[#6E5B60]' : 'hover:bg-white/10 text-[#B8A9AD]'
                }`}
                aria-label="Close install guide"
              >
                <X size={18} />
              </button>
            </div>

            {isInIframe && (
              <div className={`p-3 rounded-2xl border text-xs space-y-2 ${
                isLight
                  ? 'bg-[#FDE2E4]/70 border-[#DC2626]/30 text-[#140E10]'
                  : 'bg-[#DC2626]/15 border-red-500/30 text-[#FAF5F2]'
              }`}>
                <p className="font-semibold text-[11px] text-[#EF4444]">
                  Open directly in your mobile browser
                </p>
                <p className={`text-[11px] leading-relaxed ${isLight ? 'text-[#5F4E53]' : 'text-[#B8A9AD]'}`}>
                  Embedded preview windows block browser install prompts. Open the Shared App URL in Chrome (Android) or Safari (iPhone) to install.
                </p>
                <button
                  onClick={handleCopyUrl}
                  className="w-full py-2 px-3 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedUrl ? <Check size={13} /> : <Download size={13} />}
                  <span>{copiedUrl ? 'Copied App Link' : 'Copy Current App Link'}</span>
                </button>
              </div>
            )}

            <div className="space-y-3 text-xs">
              {/* iOS Instructions */}
              <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
                isIOS
                  ? 'border-[#DC2626]/50 bg-[#DC2626]/10'
                  : isLight
                  ? 'bg-[#F5EFEA] border-red-900/10'
                  : 'bg-[#191315] border-red-500/15'
              }`}>
                <div className="font-bold flex items-center gap-1.5 text-[#EF4444]">
                  <Share size={13} />
                  <span>iPhone / iPad (Safari)</span>
                </div>
                <ol className={`space-y-1 text-[11px] list-decimal list-inside ${
                  isLight ? 'text-[#5F4E53]' : 'text-[#B8A9AD]'
                }`}>
                  <li>Open this app link in <strong className={isLight ? 'text-[#140E10]' : 'text-[#FAF5F2]'}>Safari</strong>.</li>
                  <li>Tap the <strong className={isLight ? 'text-[#140E10]' : 'text-[#FAF5F2]'}>Share</strong> button in the bottom bar.</li>
                  <li className="flex items-center gap-1 flex-wrap">
                    <span>Tap</span>
                    <PlusSquare size={12} className="inline text-[#EF4444]" />
                    <strong className={isLight ? 'text-[#140E10]' : 'text-[#FAF5F2]'}>Add to Home Screen</strong>.
                  </li>
                </ol>
              </div>

              {/* Android Instructions */}
              <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
                !isIOS
                  ? 'border-[#DC2626]/50 bg-[#DC2626]/10'
                  : isLight
                  ? 'bg-[#F5EFEA] border-red-900/10'
                  : 'bg-[#191315] border-red-500/15'
              }`}>
                <div className="font-bold flex items-center gap-1.5 text-[#EF4444]">
                  <MoreVertical size={13} />
                  <span>Android (Chrome / Edge)</span>
                </div>
                <ol className={`space-y-1 text-[11px] list-decimal list-inside ${
                  isLight ? 'text-[#5F4E53]' : 'text-[#B8A9AD]'
                }`}>
                  <li>Open the app URL in <strong className={isLight ? 'text-[#140E10]' : 'text-[#FAF5F2]'}>Chrome</strong>.</li>
                  <li>Tap the <strong className={isLight ? 'text-[#140E10]' : 'text-[#FAF5F2]'}>⋮ Menu</strong> in the top-right corner.</li>
                  <li>Tap <strong className={isLight ? 'text-[#140E10]' : 'text-[#FAF5F2]'}>Install app</strong> or <strong className={isLight ? 'text-[#140E10]' : 'text-[#FAF5F2]'}>Add to Home screen</strong>.</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className={`w-full min-h-[44px] rounded-2xl text-xs font-semibold transition-colors ${
                isLight
                  ? 'bg-[#ECE2DC] hover:bg-[#E2D4CC] text-[#140E10]'
                  : 'bg-[#201619] hover:bg-[#2B1D21] text-[#FAF5F2]'
              }`}
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
