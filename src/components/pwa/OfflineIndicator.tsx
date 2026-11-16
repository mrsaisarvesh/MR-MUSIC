import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[75] flex items-center gap-2 rounded-full bg-[#141012]/95 border border-red-500/40 px-3.5 py-1.5 text-[11px] font-medium text-[#FAF5F2] shadow-xl shadow-red-950/60 backdrop-blur-md whitespace-nowrap">
      <WifiOff size={12} className="text-[#EF4444] shrink-0" />
      <span>Offline Mode — Local & cached tracks ready</span>
    </div>
  );
};
