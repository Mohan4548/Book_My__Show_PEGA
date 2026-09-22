import React, { useState, useEffect } from 'react';
import { movieApi, showApi, bookingApi } from '../api';
import { Ticket, Film, Calendar, CheckCircle2, AlertCircle, Sparkles, ArrowRight, ShieldCheck, User, Mail, DollarSign } from 'lucide-react';
import StageStepper from '../components/StageStepper';

export default function CustomerPortal({ onCaseCreated, onNavigateTracker }) {
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [numTickets, setNumTickets] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Confirmation step state
  const [pendingCase, setPendingCase] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      console.error('Failed to load portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    const availableShowsForMovie = shows.filter((s) => s.movieId === movie.id);
    setSelectedShow(availableShowsForMovie.length > 0 ? availableShowsForMovie[0] : null);
    setNumTickets(1);
    setErrorMsg('');
  };

  // Derived auto-calculated total cost
  const calculatedTotal = selectedShow ? numTickets * selectedShow.pricePerSeat : 0;

  // Step 1: Submit Booking Request (Initial Stage -> Availability Check)
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedShow) return;

    setErrorMsg('');

    // Check client side seat count
    if (selectedShow.seatsAvailable < numTickets) {
      setErrorMsg(`Availability Check Failed: Only ${selectedShow.seatsAvailable} seat(s) available for this show.`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await bookingApi.create({
        customerName,
        customerEmail,
        showId: selectedShow.id,
        numTickets,
      });

      if (response.data.success) {
        setPendingCase(response.data.data);
        setShowConfirmModal(true);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit booking request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Customer Explicit Confirmation (Availability Check -> Approval)
  const handleConfirmBooking = async () => {
    if (!pendingCase) return;

    try {
      setSubmitting(true);
      const response = await bookingApi.confirm(pendingCase.id);
      if (response.data.success) {
        setShowConfirmModal(false);
        const caseId = pendingCase.id;
        setPendingCase(null);
        setSelectedMovie(null);
        setSelectedShow(null);
        setCustomerName('');
        setCustomerEmail('');
        fetchData(); // Refresh seat counts
        onNavigateTracker(caseId);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to confirm booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading CineWave Movies & Showtimes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Banner */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-cyan-500/20 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Pega Workflow Case Lifecycle Enabled
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
            Book Your Next Cinema Experience
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Every booking request generates a <strong className="text-slate-200">Pega Case Instance</strong>. 
            Automated availability check validation, derived cost calculation, and queue routing are handled instantly.
          </p>
        </div>
      </div>

      {/* Main Grid: Movie List & Booking Request Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Movies Grid */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Film className="w-5 h-5 text-cyan-400" />
            Select a Movie
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {movies.map((movie) => {
              const movieShows = shows.filter((s) => s.movieId === movie.id);
              const isSelected = selectedMovie?.id === movie.id;
              const isPremium = movie.showType === 'Premium';

              return (
                <div
                  key={movie.id}
                  onClick={() => handleSelectMovie(movie)}
                  className={`glass-card rounded-2xl p-4 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'ring-2 ring-cyan-500 bg-slate-900/90 shadow-xl shadow-cyan-500/10'
                      : 'hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="relative h-44 rounded-xl overflow-hidden bg-slate-950">
                      <img
                        src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1'}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-md ${
                          isPremium
                            ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {movie.showType}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-100 text-base line-clamp-1">{movie.title}</h3>
                      <p className="text-xs text-slate-400">{movie.genre} &bull; {movie.durationMinutes} mins</p>
                    </div>

                    <p className="text-xs text-slate-400/80 line-clamp-2">{movie.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-3 text-xs">
                    <span className="text-slate-400 font-medium">
                      {movieShows.length} Showtimes available
                    </span>
                    <span className={`font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                      {isSelected ? 'Selected ✓' : 'Select →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Booking Form */}
        <div className="lg:col-span-5">
          <div className="glass-panel rounded-3xl p-6 sticky top-24 space-y-6 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-cyan-400" />
                Booking Request Form
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
                Pega Stage: 1 & 2
              </span>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!selectedMovie ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Film className="w-8 h-8 mx-auto stroke-1 text-slate-600" />
                <p className="text-sm font-medium">Select a movie from the left catalog to start your booking case.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                {/* Selected Movie Summary */}
                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">{selectedMovie.title}</h4>
                    <p className="text-xs text-slate-400">Pega Queue: <strong className="text-cyan-400">{selectedMovie.showType === 'Premium' ? 'PremiumShowQueue' : 'StandardShowQueue'}</strong></p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                    {selectedMovie.showType}
                  </span>
                </div>

                {/* Showtimes Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    Available Showtimes
                  </label>
                  <select
                    required
                    value={selectedShow?.id || ''}
                    onChange={(e) => {
                      const sh = shows.find((s) => s.id === Number(e.target.value));
                      setSelectedShow(sh);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {shows
                      .filter((s) => s.movieId === selectedMovie.id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.theatre} - {new Date(s.dateTime).toLocaleString()} (${s.pricePerSeat}/seat, {s.seatsAvailable} seats left)
                        </option>
                      ))}
                  </select>
                </div>

                {/* Seats & Derived Pricing */}
                {selectedShow && (
                  <div className="grid grid-cols-2 gap-3 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Tickets Count</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedShow.seatsAvailable || 10}
                        value={numTickets}
                        onChange={(e) => setNumTickets(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-bold text-center focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Auto Total Cost</label>
                      <div className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-cyan-400 font-extrabold text-center flex items-center justify-center gap-0.5">
                        <DollarSign className="w-4 h-4" />
                        <span>{calculatedTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Contact Details */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Customer Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Jordan Miller"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Customer Email (For Ticket Correspondence) *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="jordan.miller@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={submitting || !selectedShow || selectedShow.seatsAvailable < numTickets}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-extrabold rounded-2xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 mt-4"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Submit Request & Run Availability Check</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Customer Confirmation Modal (Availability Check -> Approval) */}
      {showConfirmModal && pendingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-100">Step Action: Customer Confirmation</h3>
                <p className="text-xs text-slate-400">Pega Stage: Availability Check Passed ✓</p>
              </div>
            </div>

            <StageStepper currentStage="Availability Check" />

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Generated Case ID:</span>
                <strong className="text-cyan-400 font-mono text-sm">{pendingCase.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="text-slate-200 font-semibold">{pendingCase.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tickets Requested:</span>
                <span className="text-slate-200 font-semibold">{pendingCase.numTickets} ticket(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Calculated Total Cost:</span>
                <span className="text-emerald-400 font-extrabold text-sm">${pendingCase.totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Auto Work Queue Routing:</span>
                <span className="text-amber-400 font-bold">{pendingCase.assignedQueue}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              <strong className="text-slate-200">Pega Rule:</strong> Explicit confirmation (<code className="text-cyan-400">confirmed = true</code>) is required before this case can transition to the <strong className="text-cyan-300">Approval</strong> stage in the Staff Work Queue.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
              >
                Cancel / Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={submitting}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Route to Staff</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
