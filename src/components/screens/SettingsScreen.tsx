import React from 'react';
import {
  Moon,
  Sun,
  Sliders,
  HardDrive,
  RefreshCw,
  Trash2,
  Headphones,
  PhoneCall,
  Bell,
  Zap,
} from 'lucide-react';
import { UserSettings, ThemeMode } from '../../types';

interface SettingsScreenProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onTriggerInterruption: (
    type: 'PHONE_CALL' | 'HEADSET_UNPLUG' | 'AIRPODS_DISCONNECT' | 'ALARM_DUCK'
  ) => void;
  onOpenImportModal: () => void;
  onClearCache: () => void;
  localSongsCount?: number;
  deviceFoldersCount?: number;
  themeMode?: string;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({
  checked,
  onChange,
  label,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full transition-colors p-0.5 shrink-0 ${
      checked ? 'bg-[#DC2626]' : 'bg-[#36282B]'
    }`}
  >
    <div
      className={`w-5 h-5 rounded-full bg-[#FAF5F2] shadow-sm transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onTriggerInterruption,
  onOpenImportModal,
  onClearCache,
  localSongsCount = 0,
  deviceFoldersCount = 0,
  themeMode,
}) => {
  const isLight = (themeMode || settings.theme) === 'LIGHT';
  const isAmoled = (themeMode || settings.theme) === 'AMOLED';

  const bgClass = isLight
    ? 'bg-[#F5EFEA] text-[#140E10]'
    : isAmoled
    ? 'bg-[#030203] text-[#FAF5F2]'
    : 'bg-[#0A0809] text-[#FAF5F2]';

  const cardSurface = isLight
    ? 'bg-[#FFFDFB] shadow-sm border border-red-900/10'
    : 'bg-[#141012] border border-red-500/15';
  const mutedText = isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]';

  return (
    <div className={`w-full h-full overflow-y-auto px-4 pt-4 pb-8 space-y-5 select-none transition-colors ${bgClass}`}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-display">Settings</h1>
        <p className={`text-xs mt-0.5 ${mutedText}`}>Theme, analog deck & device tools</p>
      </div>

      {/* 1. Theme Selector */}
      <section className={`p-4 rounded-3xl space-y-3 ${cardSurface}`}>
        <div className="flex items-center gap-2 text-sm font-bold">
          <Moon size={16} className="text-[#EF4444]" />
          <span>Appearance</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['DARK', 'AMOLED', 'LIGHT'] as ThemeMode[]).map((mode) => {
            const active = settings.theme === mode;
            return (
              <button
                key={mode}
                onClick={() => onUpdateSettings({ theme: mode })}
                className={`py-2.5 px-2 rounded-2xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  active
                    ? 'bg-[#DC2626] text-white shadow-md shadow-red-950/45'
                    : isLight
                    ? 'bg-[#ECE2DC] text-[#5F4E53] hover:bg-[#E2D4CC]'
                    : 'bg-[#201619] text-[#B8A9AD] hover:text-[#FAF5F2]'
                }`}
              >
                {mode === 'LIGHT' ? <Sun size={15} /> : <Moon size={15} />}
                <span>{mode === 'AMOLED' ? 'Pitch Black' : mode === 'DARK' ? 'Obsidian' : 'Ivory'}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Audio & Playback */}
      <section className={`p-4 rounded-3xl space-y-4 ${cardSurface}`}>
        <div className="flex items-center gap-2 text-sm font-bold">
          <Sliders size={16} className="text-[#EF4444]" />
          <span>Audio & Playback</span>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">Continuous Autoplay</div>
              <div className={`text-[11px] ${mutedText}`}>Keep playing similar tracks</div>
            </div>
            <ToggleSwitch
              checked={settings.autoplay}
              onChange={(v) => onUpdateSettings({ autoplay: v })}
              label="Continuous Autoplay"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">Gapless Playback</div>
              <div className={`text-[11px] ${mutedText}`}>Zero silence between tracks</div>
            </div>
            <ToggleSwitch
              checked={settings.gaplessPlayback}
              onChange={(v) => onUpdateSettings({ gaplessPlayback: v })}
              label="Gapless Playback"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">Volume Normalization</div>
              <div className={`text-[11px] ${mutedText}`}>Consistent loudness level</div>
            </div>
            <ToggleSwitch
              checked={settings.normalizeVolume}
              onChange={(v) => onUpdateSettings({ normalizeVolume: v })}
              label="Volume Normalization"
            />
          </div>

          <div className="pt-1 space-y-1.5">
            <div className="flex justify-between">
              <span className="font-semibold">Crossfade</span>
              <span className="font-mono text-[#EF4444] font-semibold tabular-nums">
                {settings.crossfade}s
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={settings.crossfade}
              onChange={(e) => onUpdateSettings({ crossfade: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 rounded-lg bg-red-500/20 accent-[#DC2626] cursor-pointer"
            />
          </div>

          <div className="pt-1 space-y-2">
            <div className="font-semibold">Audio Quality</div>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'AUTO', label: 'Auto' },
                  { id: 'HIGH', label: '320k AAC' },
                  { id: 'LOSSLESS', label: 'Lossless' },
                ] as const
              ).map((q) => (
                <button
                  key={q.id}
                  onClick={() => onUpdateSettings({ audioQuality: q.id })}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                    settings.audioQuality === q.id
                      ? 'bg-[#DC2626] text-white'
                      : isLight
                      ? 'bg-[#ECE2DC] text-[#5F4E53]'
                      : 'bg-[#201619] text-[#B8A9AD]'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Native Audio Events */}
      <section className={`p-4 rounded-3xl space-y-3 ${cardSurface}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">Audio Interruption Tests</span>
          <span className={`text-[11px] ${mutedText}`}>iOS · Android</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => onTriggerInterruption('PHONE_CALL')}
            className={`p-3 rounded-2xl flex items-center gap-2 font-medium transition-colors ${
              isLight ? 'bg-[#ECE2DC] hover:bg-[#E2D4CC]' : 'bg-[#201619] hover:bg-[#2B1D21]'
            }`}
          >
            <PhoneCall size={14} className="text-[#EF4444] shrink-0" />
            <span className="truncate">Phone Call</span>
          </button>

          <button
            onClick={() => onTriggerInterruption('HEADSET_UNPLUG')}
            className={`p-3 rounded-2xl flex items-center gap-2 font-medium transition-colors ${
              isLight ? 'bg-[#ECE2DC] hover:bg-[#E2D4CC]' : 'bg-[#201619] hover:bg-[#2B1D21]'
            }`}
          >
            <Headphones size={14} className="text-[#DC2626] shrink-0" />
            <span className="truncate">Unplug Aux</span>
          </button>

          <button
            onClick={() => onTriggerInterruption('ALARM_DUCK')}
            className={`p-3 rounded-2xl flex items-center gap-2 font-medium transition-colors ${
              isLight ? 'bg-[#ECE2DC] hover:bg-[#E2D4CC]' : 'bg-[#201619] hover:bg-[#2B1D21]'
            }`}
          >
            <Bell size={14} className="text-[#F87171] shrink-0" />
            <span className="truncate">Alert Duck</span>
          </button>

          <button
            onClick={() => onTriggerInterruption('AIRPODS_DISCONNECT')}
            className={`p-3 rounded-2xl flex items-center gap-2 font-medium transition-colors ${
              isLight ? 'bg-[#ECE2DC] hover:bg-[#E2D4CC]' : 'bg-[#201619] hover:bg-[#2B1D21]'
            }`}
          >
            <Zap size={14} className="text-red-400 shrink-0" />
            <span className="truncate">BT Loss</span>
          </button>
        </div>
      </section>

      {/* 4. Local Device Music & Storage */}
      <section className={`p-4 rounded-3xl space-y-3 ${cardSurface}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold">
            <HardDrive size={16} className="text-emerald-400" />
            <span>Local Device Music</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400">
            Permanently Enabled
          </span>
        </div>

        <p className={`text-xs tabular-nums ${mutedText}`}>
          {localSongsCount} local tracks stored offline · {deviceFoldersCount} linked folders
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 ${
              isLight ? 'bg-[#ECE2DC] hover:bg-[#E2D4CC]' : 'bg-[#201619] hover:bg-[#2B1D21]'
            }`}
          >
            <RefreshCw size={13} className="text-[#EF4444]" />
            <span>Add / Scan Device</span>
          </button>

          <button
            onClick={onClearCache}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-red-600/15 hover:bg-red-600/25 text-xs font-semibold text-red-400 flex items-center justify-center gap-1.5"
          >
            <Trash2 size={13} />
            <span>Clear Stream Cache</span>
          </button>
        </div>
      </section>
    </div>
  );
};
