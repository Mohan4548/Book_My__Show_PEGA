import React, { useState, useEffect } from 'react';
import { movieApi, showApi } from '../api';
import { Film, Calendar, Plus, Edit2, Trash2, Settings, Layers, DollarSign } from 'lucide-react';
import MovieModal from '../components/MovieModal';
import ShowModal from '../components/ShowModal';

export default function AdminCatalog() {
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  const [showModalOpen, setShowModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, sRes] = await Promise.all([movieApi.getAll(), showApi.getAll()]);
      if (mRes.data.success) setMovies(mRes.data.data);
      if (sRes.data.success) setShows(sRes.data.data);
    } catch (err) {
      console.error('Failed to load admin catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Movie Handlers
  const handleSaveMovie = async (formData) => {
    try {
      if (editingMovie) {
        await movieApi.update(editingMovie.id, formData);
      } else {
        await movieApi.create(formData);
      }
      setMovieModalOpen(false);
      setEditingMovie(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save movie.');
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!confirm('Are you sure you want to delete this movie? Associated shows will also be removed.')) return;
    try {
      await movieApi.delete(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete movie.');
    }
  };

  // Show Handlers
  const handleSaveShow = async (formData) => {
    try {
      if (editingShow) {
        await showApi.update(editingShow.id, formData);
      } else {
        await showApi.create(formData);
      }
      setShowModalOpen(false);
      setEditingShow(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save show.');
    }
  };

  const handleDeleteShow = async (id) => {
    if (!confirm('Are you sure you want to delete this show schedule?')) return;
    try {
      await showApi.delete(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete show.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">
              Movie & Show Schedule Management
            </h1>
            <p className="text-xs text-slate-400">
              Admin CRUD panel to define movie titles, showTypes (Pega Queue classifier), showtimes, capacity, and seat pricing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingMovie(null);
              setMovieModalOpen(true);
            }}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-2xl transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Movie
          </button>
          <button
            onClick={() => {
              setEditingShow(null);
              setShowModalOpen(true);
            }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            Schedule Show
          </button>
        </div>
      </div>

      {/* Movies Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <Film className="w-5 h-5 text-cyan-400" />
            Movies Catalog ({movies.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">Loading movies...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Movie</th>
                  <th className="py-3 px-4">Genre</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Show Type (Queue Router)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {movies.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1'}
                          alt={m.title}
                          className="w-9 h-12 rounded object-cover bg-slate-950 border border-slate-800"
                        />
                        <div>
                          <div className="font-bold text-slate-100">{m.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{m.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{m.genre}</td>
                    <td className="py-3.5 px-4 text-slate-400">{m.durationMinutes} mins</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          m.showType === 'Premium'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {m.showType} → {m.showType === 'Premium' ? 'PremiumShowQueue' : 'StandardShowQueue'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingMovie(m);
                          setMovieModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                        title="Edit Movie"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(m.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        title="Delete Movie"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Shows Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Scheduled Shows ({shows.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">Loading shows...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Movie</th>
                  <th className="py-3 px-4">Theatre / Screen</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Seats Left / Total</th>
                  <th className="py-3 px-4">Price / Seat</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shows.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-200">
                      {s.movieTitle}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {s.theatre} ({s.location})
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {new Date(s.dateTime).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-cyan-400">{s.seatsAvailable}</span>
                      <span className="text-slate-500"> / {s.totalSeats} seats</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      ${s.pricePerSeat.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingShow(s);
                          setShowModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                        title="Edit Show"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteShow(s.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        title="Delete Show"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <MovieModal
        movie={editingMovie}
        isOpen={movieModalOpen}
        onClose={() => setMovieModalOpen(false)}
        onSave={handleSaveMovie}
      />

      <ShowModal
        show={editingShow}
        movies={movies}
        isOpen={showModalOpen}
        onClose={() => setShowModalOpen(false)}
        onSave={handleSaveShow}
      />
    </div>
  );
}
