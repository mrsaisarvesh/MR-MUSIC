import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, FileAudio, FolderSearch } from 'lucide-react';
import { LocalMusicService } from '../../services/localMusic/LocalMusicService';
import { Song } from '../../types';

interface LocalImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (songs: Song[], folderName?: string) => void;
  onFolderScanComplete?: () => void;
  themeMode?: string;
}

export const LocalImportModal: React.FC<LocalImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  onFolderScanComplete,
  themeMode,
}) => {
  const isLight = themeMode === 'LIGHT';
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | File[], folderName?: string) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    try {
      const result = await LocalMusicService.importAudioFiles(files, folderName);
      setImportedCount(result.length);
      onImportComplete(result, folderName);
      setTimeout(() => {
        setIsProcessing(false);
        setImportedCount(null);
        onClose();
      }, 1100);
    } catch (err) {
      console.error('Import audio error:', err);
      setIsProcessing(false);
    }
  };

  const handleScanFolder = async () => {
    if (LocalMusicService.supportsDirectoryPicker()) {
      setIsProcessing(true);
      try {
        const res = await LocalMusicService.pickAndSaveDeviceFolder();
        if (res) {
          setImportedCount(res.songs.length);
          onImportComplete(res.songs, res.folder.name);
          onFolderScanComplete?.();
          setTimeout(() => {
            setIsProcessing(false);
            setImportedCount(null);
            onClose();
          }, 1100);
          return;
        }
      } catch (err) {
        // User cancelled or iframe blocked showDirectoryPicker -> fallback to webkitdirectory input
        if ((err as Error)?.name === 'AbortError') {
          setIsProcessing(false);
          return;
        }
      }
      setIsProcessing(false);
    }
    folderInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div
        className={`w-full max-w-md rounded-3xl p-5 border shadow-2xl ${
          isLight
            ? 'bg-[#FFFDFB] border-red-900/15 text-[#140E10]'
            : 'bg-[#120E10] border-red-500/20 text-[#FAF5F2]'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-3.5 border-b ${
          isLight ? 'border-red-900/10' : 'border-red-500/15'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#DC2626]/20 text-[#EF4444]">
              <FileAudio size={20} />
            </div>
            <div>
              <h2 className="font-bold font-display text-base">Local Device Music</h2>
              <p className={`text-[11px] ${isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]'}`}>
                Permanently enabled offline storage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full ${
              isLight ? 'hover:bg-red-900/10 text-[#6E5B60] hover:text-[#140E10]' : 'hover:bg-white/10 text-[#B8A9AD] hover:text-[#FAF5F2]'
            }`}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hidden Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.opus,.webm"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.opus,.webm"
          {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files, 'Device Music Folder');
          }}
        />

        {/* Drag & Drop Box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`my-4 p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#DC2626] bg-[#DC2626]/10 scale-[1.01]'
              : isLight
              ? 'border-red-900/20 bg-[#F5EFEA] hover:border-[#DC2626] hover:bg-[#ECE2DC]'
              : 'border-red-500/25 bg-[#191315] hover:border-[#DC2626] hover:bg-[#241A1D]'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3 py-3">
              <div className="w-10 h-10 border-3 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-[#EF4444]">
                Saving tracks permanently to device library...
              </p>
            </div>
          ) : importedCount !== null ? (
            <div className="flex flex-col items-center gap-2 py-3 text-emerald-400">
              <CheckCircle2 size={36} />
              <p className="text-sm font-bold">Saved {importedCount} track(s) to device!</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#DC2626]/30 to-[#7F1D1D]/40 text-[#EF4444] border border-red-500/35 flex items-center justify-center mb-3">
                <Upload size={22} />
              </div>
              <h4 className="font-bold text-sm">
                Tap to select audio files
              </h4>
              <p className={`text-xs mt-1 max-w-xs ${isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]'}`}>
                MP3, WAV, AAC, M4A, FLAC, OGG, OPUS saved permanently for offline playback
              </p>
            </>
          )}
        </div>

        {/* Folder Scan & File Buttons */}
        <div className="flex items-center gap-2.5 mb-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className={`flex-1 min-h-[44px] px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              isLight
                ? 'bg-[#F5EFEA] hover:bg-[#ECE2DC] border-red-900/15 text-[#140E10]'
                : 'bg-[#191315] hover:bg-[#241A1D] border-red-500/20 text-[#FAF5F2]'
            }`}
          >
            <Upload size={15} className="text-[#EF4444]" />
            <span>Add Files</span>
          </button>

          <button
            onClick={handleScanFolder}
            disabled={isProcessing}
            className="flex-1 min-h-[44px] px-3 rounded-2xl bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-950/35 transition-colors"
          >
            <FolderSearch size={15} />
            <span>Scan Folder</span>
          </button>
        </div>

        <div className={`p-3 rounded-xl border text-[11px] ${
          isLight
            ? 'bg-[#F5EFEA] border-red-900/10 text-[#5F4E53]'
            : 'bg-[#0A0809] border-red-500/15 text-[#B8A9AD]'
        }`}>
          Local tracks remain stored inside your device database across restarts and work completely offline.
        </div>
      </div>
    </div>
  );
};
