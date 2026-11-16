import React, { useState, useMemo } from 'react';
import { Search as SearchIcon, X, Radio, Clock, ChevronRight } from 'lucide-react';
import { Song, Artist, Album, Playlist } from '../../types';
import { GENRE_CATEGORIES } from '../../data/mockData';

interface SearchScreenProps {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
  onPlaySong: (song: Song, queue?: Song[]) => void;
  onSelectArtist: (artistId: string) => void;
  onSelectAlbum: (albumId: string) => void;
  onSelectPlaylist: (playlistId: string) => void;
  themeMode?: string;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  songs,
  artists,
  albums,
  onPlaySong,
  onSelectArtist,
  onSelectAlbum,
  themeMode,
}) => {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('genre-all');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Cyberpulse',
    'Midnight Horizon',
    'Kyoto',
  ]);

  const isLight = themeMode === 'LIGHT';
  const isAmoled = themeMode === 'AMOLED';

  const bgClass = isLight
    ? 'bg-[#F5EFEA] text-[#140E10]'
    : isAmoled
    ? 'bg-[#030203] text-[#FAF5F2]'
    : 'bg-[#0A0809] text-[#FAF5F2]';

  const rowSurface = isLight
    ? 'bg-[#FFFDFB] shadow-sm hover:bg-[#ECE2DC] border border-red-900/10'
    : 'bg-[#141012] hover:bg-[#201619] border border-red-500/10';

  const mutedText = isLight ? 'text-[#6E5B60]' : 'text-[#B8A9AD]';

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && selectedGenre === 'genre-all') {
      return { songs: [], artists: [], albums: [] };
    }

    const matchedSongs = songs.filter((s) => {
      const matchQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q);
      const matchGenre =
        selectedGenre === 'genre-all' ||
        s.genre.toLowerCase().includes(selectedGenre.replace('genre-', ''));
      return matchQuery && matchGenre;
    });

    const matchedArtists = !q
      ? []
      : artists.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.genres.some((g) => g.toLowerCase().includes(q))
        );

    const matchedAlbums = !q
      ? []
      : albums.filter(
          (al) =>
            al.title.toLowerCase().includes(q) ||
            al.artist.toLowerCase().includes(q) ||
            al.genre.toLowerCase().includes(q)
        );

    return {
      songs: matchedSongs,
      artists: matchedArtists,
      albums: matchedAlbums,
    };
  }, [query, selectedGenre, songs, artists, albums]);

  const hasResults =
    filteredResults.songs.length > 0 ||
    filteredResults.artists.length > 0 ||
    filteredResults.albums.length > 0;

  return (
    <div className={`w-full h-full overflow-y-auto scroll-smooth snap-y snap-proximity px-4 pt-4 pb-6 space-y-5 select-none transition-colors ${bgClass}`}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-display">Search</h1>
        <p className={`text-xs mt-0.5 ${mutedText}`}>Find tracks, artists, and genres</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <SearchIcon
          size={18}
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${mutedText}`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Songs, artists, or moods..."
          className={`w-full pl-11 pr-10 min-h-[48px] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition-all ${
            isLight
              ? 'bg-[#FFFDFB] text-[#140E10] placeholder:text-[#8D7B80] border border-red-900/10'
              : 'bg-[#141012] text-[#FAF5F2] placeholder:text-[#B8A9AD]/60 border border-red-500/15'
          }`}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${mutedText}`}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Genre Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {GENRE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedGenre(cat.id)}
            className={`px-3.5 min-h-[36px] rounded-full text-xs font-semibold shrink-0 whitespace-nowrap transition-all ${
              selectedGenre === cat.id
                ? 'bg-[#DC2626] text-white shadow-md shadow-red-950/45'
                : isLight
                ? 'bg-[#FFFDFB] text-[#5F4E53] hover:text-[#140E10] border border-red-900/10'
                : 'bg-[#141012] text-[#B8A9AD] hover:text-[#FAF5F2] border border-red-500/10'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results or Default Vertical Genre List */}
      {query || selectedGenre !== 'genre-all' ? (
        <div className="space-y-5">
          {!hasResults ? (
            <div className={`text-center py-14 ${mutedText}`}>
              <SearchIcon size={32} className="mx-auto mb-2 opacity-40 text-[#DC2626]" />
              <h3 className="font-semibold text-sm">No matches found</h3>
              <p className="text-xs mt-1">Try another keyword or genre.</p>
            </div>
          ) : (
            <>
              {filteredResults.songs.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-xs font-bold text-[#EF4444] uppercase tracking-wider">
                    Songs
                  </h3>
                  <div className="flex flex-col space-y-2">
                    {filteredResults.songs.map((song) => (
                      <div
                        key={song.id}
                        onClick={() => onPlaySong(song, filteredResults.songs)}
                        className={`snap-start flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-colors min-h-[60px] active:scale-[0.99] ${rowSurface}`}
                      >
                        <img
                          src={song.artwork}
                          alt={song.title}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{song.title}</h4>
                          <p className={`text-xs truncate ${mutedText}`}>{song.artist}</p>
                        </div>
                        <span className={`text-xs font-mono tabular-nums ${mutedText}`}>
                          {Math.floor(song.duration / 60)}:
                          {(song.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {filteredResults.artists.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-xs font-bold text-[#EF4444] uppercase tracking-wider">
                    Artists
                  </h3>
                  <div className="flex flex-col space-y-2">
                    {filteredResults.artists.map((artist) => (
                      <button
                        key={artist.id}
                        onClick={() => onSelectArtist(artist.id)}
                        className={`snap-start w-full flex items-center gap-3 p-2.5 rounded-2xl text-left min-h-[60px] active:scale-[0.99] ${rowSurface}`}
                      >
                        <img
                          src={artist.artwork}
                          alt={artist.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{artist.name}</h4>
                          <p className={`text-xs truncate ${mutedText}`}>
                            Artist · {artist.genres.slice(0, 2).join(', ')}
                          </p>
                        </div>
                        <ChevronRight size={18} className={`${mutedText} shrink-0`} />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {filteredResults.albums.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-xs font-bold text-[#EF4444] uppercase tracking-wider">
                    Albums
                  </h3>
                  <div className="flex flex-col space-y-2">
                    {filteredResults.albums.map((album) => (
                      <button
                        key={album.id}
                        onClick={() => onSelectAlbum(album.id)}
                        className={`snap-start w-full flex items-center gap-3 p-2.5 rounded-2xl text-left min-h-[60px] active:scale-[0.99] ${rowSurface}`}
                      >
                        <img
                          src={album.artwork}
                          alt={album.title}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{album.title}</h4>
                          <p className={`text-xs truncate ${mutedText}`}>
                            {album.artist} · {album.year}
                          </p>
                        </div>
                        <ChevronRight size={18} className={`${mutedText} shrink-0`} />
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {recentSearches.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${mutedText}`}>
                  <Clock size={13} className="text-[#DC2626]" />
                  Recent
                </span>
                <button
                  onClick={() => setRecentSearches([])}
                  className={`text-xs ${mutedText} hover:text-[#EF4444]`}
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(term)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium ${rowSurface}`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-base font-bold font-display mb-3">Browse Genres</h3>
            <div className="flex flex-col space-y-2.5">
              {GENRE_CATEGORIES.slice(1).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedGenre(cat.id)}
                  className={`snap-start w-full px-4 py-3.5 rounded-2xl bg-gradient-to-r ${cat.color} min-h-[62px] flex items-center justify-between text-left active:scale-[0.99] transition-transform shadow-md border border-red-500/20`}
                >
                  <div className="flex items-center gap-3">
                    <Radio size={18} className="text-[#FAF5F2]/85 shrink-0" />
                    <span className="font-bold text-sm text-[#FAF5F2]">{cat.name}</span>
                  </div>
                  <ChevronRight size={18} className="text-[#FAF5F2]/80 shrink-0" />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
