import React, { useState, useEffect } from 'react';
import { movieApi, showApi } from '../api';
import { Sparkles, Search, Film, Calendar, ArrowRight, ShieldCheck, Ticket, AlertCircle, Star } from 'lucide-react';

export default function HomePage({ onSelectMovie, onSelectShow, onNavigate }) {
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [mRes, sRes] = await Promise.all([movieApi.getAll(), showApi.getAll()]);
      if (mRes.data.success) setMovies(mRes.data.data);
      if (sRes.data.success) setShows(sRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Backend API unavailable. Please check if Express server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl relative overflow-hidden border border-cyan-500/20 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Pega PRPC Case Lifecycle Engine &bull; Next-Gen Tech Stack
          </span>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-100 tracking-tight leading-tight flex items-center flex-wrap gap-2">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent flex items-center gap-1">
              Movexa <Star className="w-8 h-8 text-amber-300 fill-amber-300 inline" />
            </span>
          </h1>

          <p className="text-lg text-slate-300 font-medium">
            Book Movies. Track Your Case Instance. Experience High-Tech Cinema.
          </p>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
            Every booking request generates an automated <strong className="text-slate-200">Movexa Pega Case Instance</strong> (`CW-1001`) navigating through seat availability validation, derived total cost calculation, work queue routing, and SLA tracking.
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('movies')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-2xl transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 text-sm"
            >
              <Film className="w-4 h-4" />
              Browse Movies
            </button>
            <button
              onClick={() => onNavigate('shows')}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold rounded-2xl transition-all flex items-center gap-2 text-sm"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              View Showtime Schedule
            </button>
            <button
              onClick={() => onNavigate('bookings')}
              className="px-6 py-3 bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold rounded-2xl transition-all flex items-center gap-2 text-sm"
            >
              <Ticket className="w-4 h-4 text-cyan-400" />
              Track My Booking Case
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={fetchData} className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl text-xs font-bold">
            Retry Connection
          </button>
        </div>
      )}

      {/* Movie Search & Header */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
              <Film className="w-6 h-6 text-cyan-400" />
              Now Showing Movies
            </h2>
            <p className="text-xs text-slate-400">Select a movie card to view available showtimes and submit a booking request.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies or genre..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-xs font-medium">Loading movies from Movexa API...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm space-y-2">
            <Film className="w-8 h-8 mx-auto text-slate-600" />
            <p>No movies match your search query.</p>
          </div>
        ) : (
          /* Movies Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => {
              const movieShows = shows.filter((s) => s.movieId === movie.id);
              const isPremium = movie.showType === 'Premium';

              return (
                <div
                  key={movie.id}
                  className="glass-card rounded-3xl p-4 flex flex-col justify-between group hover:border-cyan-500/40 transition-all duration-300 shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="relative h-60 rounded-2xl overflow-hidden bg-slate-950">
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

                    <p className="text-xs text-slate-400/80 line-clamp-2 leading-relaxed">
                      {movie.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {movieShows.length} showtime(s)
                    </span>

                    <button
                      onClick={() => onSelectMovie(movie)}
                      className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1"
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
    </div>
  );
}
