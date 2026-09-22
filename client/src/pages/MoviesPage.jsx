import React, { useState, useEffect } from 'react';
import { movieApi, showApi } from '../api';
import { Film, Search, Filter, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

export default function MoviesPage({ onSelectMovie }) {
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchMoviesData();
  }, []);

  const fetchMoviesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [mRes, sRes] = await Promise.all([movieApi.getAll(), showApi.getAll()]);
      if (mRes.data.success) setMovies(mRes.data.data);
      if (sRes.data.success) setShows(sRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load movies from /api/movies.');
    } finally {
      setLoading(false);
    }
  };

  // Get unique genres
  const genres = Array.from(new Set(movies.map((m) => m.genre)));

  // Filter movies
  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = genreFilter === 'all' || m.genre === genreFilter;
    const matchesType = typeFilter === 'all' || m.showType === typeFilter;
    return matchesSearch && matchesGenre && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
            <Film className="w-8 h-8 text-cyan-400" />
            Movies Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse our catalog fetched live from <code className="text-cyan-400 font-mono">/api/movies</code>. 
            Filtered by Pega Work Queue Classifiers (<strong className="text-slate-300">Premium vs Standard</strong>).
          </p>
        </div>

        <span className="px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-mono rounded-full self-start md:self-auto">
          API Endpoint: GET /api/movies
        </span>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={fetchMoviesData} className="px-3 py-1 bg-rose-500/20 rounded-xl text-xs font-bold">
            Retry API
          </button>
        </div>
      )}

      {/* Filter Control Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* ShowType Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-cyan-400" />
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1">
              {['all', 'Premium', 'Standard'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    typeFilter === type
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Genre Filter */}
          {genres.length > 0 && (
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Movies Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-xs font-medium">Fetching movies from `/api/movies`...</p>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-sm">
          No movies match the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => {
            const movieShows = shows.filter((s) => s.movieId === movie.id);
            const isPremium = movie.showType === 'Premium';

            return (
              <div
                key={movie.id}
                className="glass-card rounded-3xl p-5 flex flex-col justify-between group hover:border-cyan-500/40 transition-all duration-300 shadow-xl"
              >
                <div className="space-y-3">
                  <div className="relative h-64 rounded-2xl overflow-hidden bg-slate-950">
                    <img
                      src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1'}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <span
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase shadow-md ${
                        isPremium
                          ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {movie.showType}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-100 text-base line-clamp-1 group-hover:text-cyan-400 transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{movie.genre} &bull; {movie.durationMinutes} mins</p>
                  </div>

                  <p className="text-xs text-slate-400/80 line-clamp-3 leading-relaxed">
                    {movie.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {movieShows.length} showtimes
                  </span>

                  <button
                    onClick={() => onSelectMovie(movie)}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
                  >
                    <span>View Shows</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
