import React from 'react';
import { ArrowLeft, Play, Shuffle, UserPlus, UserCheck, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { Artist, Song, Album } from '../../types';

interface ArtistScreenProps {
  artist: Artist;
  songs: Song[];
  albums: Album[];
  onBack: () => void;
  onPlaySong: (song: Song, queue?: Song[]) => void;
  onPlayAll: (songs: Song[]) => void;
  onShuffleAll: (songs: Song[]) => void;
  onSelectAlbum: (albumId: string) => void;
  onToggleFollow: (artistId: string) => void;
  onToggleFavorite: (songId: string) => void;
  themeMode?: string;
}

export const ArtistScreen: React.FC<ArtistScreenProps> = ({
  artist,
  songs,
  albums,
  onBack,
  onPlaySong,
  onPlayAll,
  onShuffleAll,
  onSelectAlbum,
  onToggleFollow,
  onToggleFavorite,
  themeMode,
}) => {
  const topTracks = songs.filter((s) => artist.topSongIds.includes(s.id) || s.artistId === artist.id);
  const artistAlbums = albums.filter((a) => artist.albumIds.includes(a.id) || a.artistId === artist.id);

  const isLight = themeMode === 'LIGHT';
  const isAmoled = themeMode === 'AMOLED';

  const bgClass = isLight
    ? 'bg-[#F5EFEA] text-[#140E10]'
    : isAmoled
    ? 'bg-[#030203] text-[#FAF5F2]'
    : 'bg-[#0A0809] text-[#FAF5F2]';

  const rowSurface = isLight
    ? 'bg-[#FFFDFB] hover:bg-[#ECE2DC] border border-red-900/10 shadow-sm'
    : 'bg-[#141012] hover:bg-[#201619] border border-red-500/15';

  const mutedText = isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]';

  return (
    <div className={`w-full h-full overflow-y-auto scroll-smooth snap-y snap-proximity select-none pb-12 transition-colors ${bgClass}`}>
      {/* Hero Header with Background Image & Gradient */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden">
        <img
          src={artist.artwork}
          alt={artist.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            isLight
              ? 'from-[#F5EFEA] via-[#F5EFEA]/65 to-black/20'
              : isAmoled
              ? 'from-[#030203] via-[#030203]/60 to-transparent'
              : 'from-[#0A0809] via-[#0A0809]/60 to-transparent'
          }`}
        />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-[#FAF5F2] hover:bg-black/70 transition-colors z-10"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Artist Title & Verified Tag */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#EF4444] mb-1">
            <Sparkles size={14} />
            <span>Verified Artist</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight">
            {artist.name}
          </h1>
          <p className={`text-xs mt-1 tabular-nums ${isLight ? 'text-[#5F4E53]' : 'text-[#B8A9AD]'}`}>
            {(artist.monthlyListeners / 1000000).toFixed(2)}M monthly listeners · {artist.genres.join(', ')}
          </p>
        </div>
      </div>

      {/* Main Action Bar: Play | Shuffle | Follow */}
      <div
        className={`px-6 py-4 flex items-center justify-between border-b ${
          isLight ? 'border-red-900/10 bg-[#F5EFEA]' : isAmoled ? 'border-red-500/15 bg-[#030203]' : 'border-red-500/15 bg-[#0A0809]'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPlayAll(topTracks)}
            disabled={topTracks.length === 0}
            className="w-12 h-12 rounded-full bg-[#DC2626] hover:bg-[#EF4444] hover:scale-105 active:scale-95 disabled:opacity-50 text-white flex items-center justify-center shadow-lg shadow-red-950/60 transition-transform"
            aria-label="Play Artist"
          >
            <Play size={22} className="ml-1 fill-white" />
          </button>

          <button
            onClick={() => onShuffleAll(topTracks)}
            disabled={topTracks.length === 0}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full disabled:opacity-50 transition-colors ${
              isLight ? 'bg-red-900/10 hover:bg-red-900/15 text-[#5F4E53] hover:text-[#140E10]' : 'bg-white/5 hover:bg-white/10 text-[#B8A9AD] hover:text-[#FAF5F2]'
            }`}
            title="Shuffle"
          >
            <Shuffle size={20} />
          </button>
        </div>

        <button
          onClick={() => onToggleFollow(artist.id)}
          className={`flex items-center gap-1.5 px-4 min-h-[40px] rounded-full text-xs font-semibold transition-all ${
            artist.isFollowed
              ? isLight
                ? 'bg-[#FDE2E4] text-[#991B1B] border border-[#DC2626]/40'
                : 'bg-red-500/20 text-[#EF4444] border border-red-500/35'
              : isLight
              ? 'bg-[#140E10] text-[#FAF5F2] hover:bg-[#2A1E22]'
              : 'bg-[#FAF5F2] text-[#0A0809] hover:bg-[#E6DADA]'
          }`}
        >
          {artist.isFollowed ? (
            <>
              <UserCheck size={14} />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus size={14} />
              <span>Follow</span>
            </>
          )}
        </button>
      </div>

      {/* Body Content */}
      <div className="px-5 py-6 space-y-7">
        {/* Popular Tracks Vertical List */}
        <section>
          <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${mutedText}`}>
            Popular Releases
          </h3>
          {topTracks.length === 0 ? (
            <div className={`p-4 rounded-2xl text-xs text-center ${rowSurface} ${mutedText}`}>
              No tracks registered for this artist yet.
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              {topTracks.map((song, i) => (
                <div
                  key={song.id}
                  onClick={() => onPlaySong(song, topTracks)}
                  className={`snap-start flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all group min-h-[60px] ${rowSurface}`}
                >
                  <span className={`font-mono text-xs w-5 text-center tabular-nums ${mutedText}`}>
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <img
                    src={song.artwork}
                    alt={song.title}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate group-hover:text-[#EF4444]">
                      {song.title}
                    </h4>
                    <p className={`text-xs truncate tabular-nums ${mutedText}`}>
                      {(song.playCount || 0).toLocaleString()} plays
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(song.id);
                    }}
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:text-[#EF4444] ${mutedText} ${
                      isLight ? 'hover:bg-red-900/10' : 'hover:bg-white/10'
                    }`}
                    aria-label="Favorite"
                  >
                    <Heart
                      size={16}
                      className={song.isFavorite ? 'text-[#DC2626] fill-[#DC2626]' : ''}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Discography Vertical Sliding List */}
        {artistAlbums.length > 0 && (
          <section>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${mutedText}`}>
              Discography
            </h3>
            <div className="flex flex-col space-y-2">
              {artistAlbums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => onSelectAlbum(album.id)}
                  className={`snap-start w-full flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all group text-left min-h-[64px] active:scale-[0.99] ${rowSurface}`}
                >
                  <img
                    src={album.artwork}
                    alt={album.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate group-hover:text-[#EF4444]">
                      {album.title}
                    </h4>
                    <p className={`text-xs tabular-nums mt-0.5 ${mutedText}`}>
                      {album.year} · {album.genre}
                    </p>
                  </div>
                  <ChevronRight size={18} className={`${mutedText} shrink-0`} />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* About Bio Section */}
        <section className={`p-4 rounded-2xl ${rowSurface}`}>
          <h3 className="text-sm font-bold mb-2">About the Artist</h3>
          <p className={`text-xs leading-relaxed ${mutedText}`}>{artist.bio}</p>
        </section>
      </div>
    </div>
  );
};
