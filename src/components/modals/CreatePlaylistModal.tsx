import React, { useState } from 'react';
import { X, FolderPlus, Image as ImageIcon } from 'lucide-react';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string, artwork?: string) => void;
  themeMode?: string;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  themeMode,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [artwork] = useState(
    '/src/assets/images/retro_red_black_wallpaper_1794859414205.jpg'
  );

  if (!isOpen) return null;

  const isLight = themeMode === 'LIGHT';
  const mutedText = isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), description.trim(), artwork);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div
        className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
          isLight
            ? 'bg-[#FFFDFB] border-red-900/15 text-[#140E10]'
            : 'bg-[#120E10] border-red-500/20 text-[#FAF5F2]'
        }`}
      >
        <div className={`flex items-center justify-between pb-3 border-b ${
          isLight ? 'border-red-900/10' : 'border-red-500/15'
        }`}>
          <div className="flex items-center gap-2">
            <FolderPlus size={20} className="text-[#EF4444]" />
            <h2 className="font-bold font-display text-base">New Mixtape</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${
              isLight ? 'hover:bg-red-900/10 text-[#6E5B60] hover:text-[#140E10]' : 'hover:bg-white/10 text-[#B8A9AD] hover:text-[#FAF5F2]'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-red-500/25 shrink-0 relative group">
              <img src={artwork} alt="Cover" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <label className={`block text-[11px] font-semibold mb-1 ${mutedText}`}>
                Mixtape Name
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Late Night Cassette '84"
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#DC2626] ${
                  isLight
                    ? 'bg-[#F5EFEA] border-red-900/15 text-[#140E10] placeholder:text-[#8D7B80]'
                    : 'bg-[#191315] border-red-500/20 text-[#FAF5F2] placeholder:text-[#7A6A6E]'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-[11px] font-semibold mb-1 ${mutedText}`}>
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give your mixtape a vibe description..."
              className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#DC2626] resize-none ${
                isLight
                  ? 'bg-[#F5EFEA] border-red-900/15 text-[#140E10] placeholder:text-[#8D7B80]'
                  : 'bg-[#191315] border-red-500/20 text-[#FAF5F2] placeholder:text-[#7A6A6E]'
              }`}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold ${mutedText} hover:text-[#EF4444]`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-red-950/35"
            >
              Create Mixtape
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
