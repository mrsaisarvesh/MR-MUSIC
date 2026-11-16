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
}) => {
  const topTracks = songs.filter((s) => artist.topSongIds.includes(s.id) || s.artistId === artist.id);
  const artistAlbums = albums.filter((a) => artist.albumIds.includes(a.id) || a.artistId === artist.id);

  return (
    <div className="w-full h-full overflow-y-auto scroll-smooth snap-y snap-proximity select-none pb-12 bg-[#0A0809] text-[#FAF5F2]">
      {/* Hero Header with Background Image & Gradient */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden">
        <img
          src={artist.artwork}
          alt={artist.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0809] via-[#0A0809]/60 to-transparent" />

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
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#FAF5F2] tracking-tight">
            {artist.name}
          </h1>
          <p className="text-xs text-[#B8A9AD] mt-1 tabular-nums">
            {(artist.monthlyListeners / 1000000).toFixed(2)}M monthly listeners · {artist.genres.join(', ')}
          </p>
        </div>
      </div>

      {/* Main Action Bar: Play | Shuffle | Follow */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-red-500/15 bg-[#0A0809]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPlayAll(topTracks)}
            className="w-12 h-12 rounded-full bg-[#DC2626] hover:bg-[#EF4444] hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-950/60 transition-transform"
            aria-label="Play Artist"
          >
            <Play size={22} className="ml-1 fill-white" />
          </button>

          <button
            onClick={() => onShuffleAll(topTracks)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-[#B8A9AD] hover:text-[#FAF5F2] transition-colors"
            title="Shuffle"
          >
            <Shuffle size={20} />
          </button>
        </div>

        <button
          onClick={() => onToggleFollow(artist.id)}
          className={`flex items-center gap-1.5 px-4 min-h-[40px] rounded-full text-xs font-semibold transition-all ${
            artist.isFollowed
              ? 'bg-red-500/20 text-[#EF4444] border border-red-500/35'
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
          <h3 className="text-sm font-bold text-[#B8A9AD] uppercase tracking-wider mb-3">
            Popular Releases
          </h3>
          <div className="flex flex-col space-y-2">
            {topTracks.map((song, i) => (
              <div
                key={song.id}
                onClick={() => onPlaySong(song, topTracks)}
                className="snap-start flex items-center gap-3 p-2.5 rounded-2xl bg-[#141012] hover:bg-[#201619] border border-red-500/15 cursor-pointer transition-all group min-h-[60px]"
              >
                <span className="font-mono text-xs text-[#B8A9AD] w-5 text-center tabular-nums">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <img
                  src={song.artwork}
                  alt={song.title}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate text-[#FAF5F2] group-hover:text-[#EF4444]">
                    {song.title}
                  </h4>
                  <p className="text-xs text-[#B8A9AD] truncate tabular-nums">
                    {song.playCount?.toLocaleString()} plays
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(song.id);
                  }}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-[#B8A9AD] hover:text-[#EF4444]"
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
        </section>

        {/* Discography Vertical Sliding List */}
        {artistAlbums.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-[#B8A9AD] uppercase tracking-wider mb-3">
              Discography
            </h3>
            <div className="flex flex-col space-y-2">
              {artistAlbums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => onSelectAlbum(album.id)}
                  className="snap-start w-full flex items-center gap-3 p-2.5 rounded-2xl bg-[#141012] hover:bg-[#201619] border border-red-500/15 cursor-pointer transition-all group text-left min-h-[64px] active:scale-[0.99]"
                >
                  <img
                    src={album.artwork}
                    alt={album.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate text-[#FAF5F2] group-hover:text-[#EF4444]">
                      {album.title}
                    </h4>
                    <p className="text-xs text-[#B8A9AD] tabular-nums mt-0.5">
                      {album.year} · {album.genre}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-[#B8A9AD] shrink-0" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* About Bio Section */}
        <section className="p-4 rounded-2xl bg-[#141012] border border-red-500/15">
          <h3 className="text-sm font-bold text-[#FAF5F2] mb-2">About the Artist</h3>
          <p className="text-xs text-[#B8A9AD] leading-relaxed">{artist.bio}</p>
        </section>
      </div>
    </div>
  );
};
