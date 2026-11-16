import React, { useState, useEffect } from 'react';
import { X, Sliders, RotateCcw, Zap, Sparkles } from 'lucide-react';
import { EqualizerBands } from '../../types';
import { EQUALIZER_PRESETS } from '../../services/audio/AudioService';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreset: string;
  onSelectPreset: (preset: string) => void;
  getBands: () => EqualizerBands;
  onUpdateBands: (bands: EqualizerBands) => void;
  themeMode?: string;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  currentPreset,
  onSelectPreset,
  getBands,
  onUpdateBands,
  themeMode,
}) => {
  const [bands, setBands] = useState<EqualizerBands>(() => getBands());
  const isLight = themeMode === 'LIGHT';

  useEffect(() => {
    if (isOpen) {
      setBands(getBands());
    }
  }, [isOpen, getBands, currentPreset]);

  if (!isOpen) return null;

  const bandConfigs: { key: keyof EqualizerBands; label: string; freq: string }[] = [
    { key: 'bass', label: 'Sub-Bass', freq: '60 Hz' },
    { key: 'lowMid', label: 'Bass/Punch', freq: '230 Hz' },
    { key: 'mid', label: 'Midrange', freq: '910 Hz' },
    { key: 'highMid', label: 'Presence', freq: '3.6 kHz' },
    { key: 'treble', label: 'Air/Brilliance', freq: '14 kHz' },
  ];

  const handleBandChange = (key: keyof EqualizerBands, value: number) => {
    const updated = { ...bands, [key]: value };
    setBands(updated);
    onUpdateBands(updated);
  };

  const handleReset = () => {
    onSelectPreset('Normal');
    const normalBands = EQUALIZER_PRESETS['Normal'];
    setBands(normalBands);
    onUpdateBands(normalBands);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div
        className={`w-full max-w-md max-h-[88vh] overflow-y-auto rounded-3xl p-4 sm:p-6 border shadow-2xl transition-all ${
          isLight
            ? 'bg-[#FFFDFB] border-red-900/15 text-[#140E10] shadow-red-950/20'
            : 'bg-[#120E10] border-red-500/20 text-[#FAF5F2] shadow-black/70'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${
          isLight ? 'border-red-900/10' : 'border-red-500/15'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-xl bg-[#DC2626]/20 text-[#EF4444] shrink-0">
              <Sliders size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold font-display text-sm sm:text-base tracking-tight truncate">Analog Parametric EQ</h2>
              <p className={`text-[11px] truncate ${isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]'}`}>
                5-Band Biquad Hardware Filter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full transition-colors shrink-0 ${
              isLight ? 'hover:bg-red-900/10 text-[#6E5B60] hover:text-[#140E10]' : 'hover:bg-white/10 text-[#B8A9AD] hover:text-[#FAF5F2]'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Presets Bar */}
        <div className="my-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-mono font-semibold uppercase tracking-wider ${
              isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]'
            }`}>
              Acoustic Presets
            </span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] text-[#DC2626] hover:text-[#EF4444]"
            >
              <RotateCcw size={12} />
              <span>Flat Reset</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(EQUALIZER_PRESETS).map((preset) => {
              const isActive = currentPreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => {
                    onSelectPreset(preset);
                    const newB = EQUALIZER_PRESETS[preset];
                    setBands(newB);
                    onUpdateBands(newB);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#DC2626] text-white shadow-md shadow-red-950/35'
                      : isLight
                      ? 'bg-[#F5EFEA] text-[#5F4E53] hover:bg-[#ECE2DC]'
                      : 'bg-[#1E1518] text-[#B8A9AD] hover:text-[#FAF5F2] hover:bg-[#291C20] border border-red-500/15'
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5-Band Vertical Faders */}
        <div className={`rounded-2xl p-3 border my-3 ${
          isLight ? 'bg-[#F5EFEA] border-red-900/15' : 'bg-[#0A0809] border-red-500/15'
        }`}>
          <div className="flex justify-between items-center h-44 gap-1">
            {bandConfigs.map(({ key, label, freq }) => {
              const val = bands[key] || 0;
              return (
                <div key={key} className="flex-1 min-w-0 flex flex-col items-center justify-between h-full group">
                  <span className="text-[10px] font-mono tabular-nums font-medium text-[#EF4444]">
                    {val > 0 ? `+${val}` : val}dB
                  </span>

                  {/* Vertical Range Input */}
                  <div className="relative flex items-center justify-center h-24 my-1 w-full">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={val}
                      onChange={(e) => handleBandChange(key, parseInt(e.target.value, 10))}
                      className="w-24 -rotate-90 origin-center cursor-pointer accent-[#DC2626] hover:accent-[#EF4444]"
                    />
                  </div>

                  <div className="text-center w-full px-0.5">
                    <span className={`block text-[10px] font-mono font-semibold truncate ${
                      isLight ? 'text-[#140E10]' : 'text-[#FAF5F2]'
                    }`}>{freq}</span>
                    <span className={`block text-[9px] truncate ${isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]'}`}>{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className={`flex items-center justify-between gap-2 text-xs pt-2 ${isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]'}`}>
          <div className="flex items-center gap-1.5 text-[#EF4444] min-w-0">
            <Sparkles size={13} className="shrink-0" />
            <span className="truncate text-[11px]">Zero-latency parametric DSP</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white font-medium shadow-sm transition-all shadow-red-950/35 shrink-0 whitespace-nowrap"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
