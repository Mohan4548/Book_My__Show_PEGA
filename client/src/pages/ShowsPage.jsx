import React, { useState, useEffect } from 'react';
import { showApi, movieApi } from '../api';
import { Calendar, Building, MapPin, Clock, DollarSign, Ticket, AlertCircle, Sparkles } from 'lucide-react';
import BookingModal from '../components/BookingModal';

export default function ShowsPage({ onBookShow, onBookingSuccess }) {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // Modal State
  const [selectedShowForBooking, setSelectedShowForBooking] = useState(null);

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await showApi.getAll();
      if (res.data.success) setShows(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load shows from /api/shows.');
    } finally {
      setLoading(false);
    }
  };

  const filteredShows = shows.filter((s) => {
    if (filterType === 'all') return true;
    return s.showType === filterType;
  });

  const handleOpenBooking = (show) => {
    setSelectedShowForBooking(show);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-cyan-400" />
            Showtime Schedules
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time show schedules fetched from <code className="text-cyan-400 font-mono">/api/shows</code>. 
            Select any showtime to initiate a Pega ticket booking case.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {['all', 'Premium', 'Standard'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === t
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'all' ? 'All Shows' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={fetchShows} className="px-3 py-1 bg-rose-500/20 rounded-xl text-xs font-bold">
            Retry API
          </button>
        </div>
      )}

      {/* Shows Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-xs font-medium">Loading showtimes from `/api/shows`...</p>
        </div>
      ) : filteredShows.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-sm">
          No showtimes found for the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredShows.map((show) => {
            const isPremium = show.showType === 'Premium';

            return (
              <div
                key={show.id}
                className="glass-card rounded-3xl p-6 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-3">
                    <div>
                      <h3 className="font-bold text-lg text-slate-100">{show.movieTitle}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{show.theatre}</span>
                        <span>&bull;</span>
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{show.location}</span>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${
                        isPremium
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {show.showType}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Showtime</span>
                      <strong className="text-slate-200 font-mono">
                        {new Date(show.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Seats Available</span>
                      <strong className="text-cyan-400">
                        {show.seatsAvailable} / {show.totalSeats}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Price / Seat</span>
                      <strong className="text-emerald-400 font-extrabold">
                        ${show.pricePerSeat.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    Queue: <strong className="text-purple-400">{show.showType === 'Premium' ? 'PremiumShowQueue' : 'StandardShowQueue'}</strong>
                  </span>

                  <button
                    onClick={() => handleOpenBooking(show)}
                    disabled={show.seatsAvailable === 0}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>{show.seatsAvailable > 0 ? 'Book Now' : 'Sold Out'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Phase 2 Booking Request Modal */}
      <BookingModal
        show={selectedShowForBooking}
        isOpen={Boolean(selectedShowForBooking)}
        onClose={() => setSelectedShowForBooking(null)}
        onBookingCompleted={(completedCase) => {
          setSelectedShowForBooking(null);
          fetchShows();
          if (onBookingSuccess) onBookingSuccess(completedCase);
        }}
      />
    </div>
  );
}
