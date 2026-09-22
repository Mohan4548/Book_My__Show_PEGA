import React, { useState, useEffect } from 'react';
import { X, Ticket, Calendar, DollarSign, User, Mail, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, Film, Building, MapPin, Armchair } from 'lucide-react';
import { bookingApi, showApi } from '../api';
import StageStepper from './StageStepper';
import { useToast } from './Toast';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Dynamic Seat Layout Generator helper
function generateSeatLayout(totalSeats = 60) {
  const seatsPerRow = 10;
  const numRows = Math.ceil(totalSeats / seatsPerRow);
  const rows = [];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let r = 0; r < numRows; r++) {
    const rowLabel = alphabet[r] || `R${r + 1}`;
    const rowSeats = [];
    for (let c = 1; c <= seatsPerRow; c++) {
      const seatIndex = r * seatsPerRow + c;
      if (seatIndex <= totalSeats) {
        rowSeats.push(`${rowLabel}${c}`);
      }
    }
    rows.push({ rowLabel, seats: rowSeats });
  }
  return rows;
}

const ADDON_OPTIONS = [
  { id: 'popcorn', name: 'Jumbo Popcorn & Drink Combo', price: 12.0, category: 'Concession', icon: '🍿' },
  { id: 'nachos', name: 'Deluxe Cheese Nachos', price: 8.5, category: 'Concession', icon: '🧀' },
  { id: 'lounge', name: 'VIP Lounge Pass Access', price: 15.0, category: 'VIP Service', icon: '🛋️' },
  { id: 'parking', name: 'Reserved Valet Parking', price: 10.0, category: 'Facility', icon: '🚗' },
];

export default function BookingModal({ show, movie, isOpen, onClose, onBookingCompleted }) {
  const { addToast } = useToast();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [shakingSeat, setShakingSeat] = useState(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Workflow state: 'form' | 'confirmation'
  const [step, setStep] = useState('form');
  const [createdCase, setCreatedCase] = useState(null);

  useEffect(() => {
    if (isOpen && show) {
      setCustomerName('');
      setCustomerEmail('');
      setSelectedSeats([]);
      setSelectedAddons([]);
      setErrorMsg('');
      setStep('form');
      setCreatedCase(null);
      fetchSeatsData();
    }
  }, [isOpen, show]);

  const fetchSeatsData = async () => {
    if (!show) return;
    try {
      setLoadingSeats(true);
      const res = await showApi.getSeats(show.id);
      if (res.data.success) {
        setBookedSeats(res.data.data.bookedSeats || []);
      }
    } catch (err) {
      console.warn('Failed to load booked seats:', err.message);
    } finally {
      setLoadingSeats(false);
    }
  };

  if (!isOpen || !show) return null;

  const pricePerSeat = show.pricePerSeat || 0;
  const totalSeats = show.totalSeats || 60;
  const numTickets = selectedSeats.length;
  const seatsCost = numTickets * pricePerSeat;
  const addonsTotal = selectedAddons.reduce((sum, item) => sum + item.price, 0);
  const derivedTotalCost = seatsCost + addonsTotal;
  const seatLayout = generateSeatLayout(totalSeats);

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) {
      setShakingSeat(seatId);
      setTimeout(() => setShakingSeat(null), 350);
      addToast(`Seat ${seatId} is already booked`, 'warning');
      return;
    }

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const toggleAddon = (addon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  // Step 1: Submit Booking Request (Creates Case in "Initial Stage", confirmed = false)
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedSeats.length === 0) {
      setErrorMsg('Please select at least 1 seat from the interactive seat map below.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!customerEmail.trim() || !EMAIL_REGEX.test(customerEmail.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await bookingApi.create({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        showId: show.id,
        numTickets: selectedSeats.length,
        selectedSeats,
        addons: selectedAddons,
      });

      if (res.data.success) {
        setCreatedCase(res.data.data);
        setStep('confirmation');
        addToast(`Case ${res.data.data.id} created! Please confirm details.`, 'info');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit booking request.';
      setErrorMsg(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Customer Explicit Confirmation (PUT /api/bookings/:id/confirm)
  const handleConfirmBooking = async () => {
    if (!createdCase) return;

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await bookingApi.confirm(createdCase.id);
      if (res.data.success) {
        const confirmedCase = res.data.data;
        addToast(`Case ${confirmedCase.id} confirmed & routed to ${confirmedCase.assignedQueue}!`, 'success');
        onBookingCompleted(confirmedCase);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to confirm booking request.';
      setErrorMsg(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md modal-backdrop-animate">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl modal-content-animate">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">
                {step === 'form' ? 'Select Seats & Book Tickets' : 'Confirm Booking Case'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Pega Case Type: <strong className="text-cyan-400">Movie Ticket Request</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors btn-interact"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'form' ? (
            /* STEP 1: INTERACTIVE SEAT MAP & BOOKING FORM */
            <form onSubmit={handleSubmitRequest} className="space-y-6">
              {/* Show Summary Card */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-start gap-3">
                  {movie?.posterUrl && (
                    <img
                      src={movie.posterUrl}
                      alt={show.movieTitle}
                      className="w-12 h-16 rounded-lg object-cover bg-slate-900 border border-slate-800 shadow-md"
                    />
                  )}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-100">{show.movieTitle}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
                        {show.showType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Building className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{show.theatre} ({show.location})</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{new Date(show.dateTime).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Cinema Seat Map */}
              <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
                {/* Cinema Screen Bar */}
                <div className="space-y-1 text-center">
                  <div className="h-2 w-3/4 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-lg shadow-cyan-500/50" />
                  <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                    SCREEN ────────────────────────────
                  </span>
                </div>

                {/* Seat Map Legend */}
                <div className="flex items-center justify-center gap-6 py-2 text-xs border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-slate-800 border border-slate-700" />
                    <span className="text-slate-400">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-cyan-500 border border-cyan-400 text-slate-950 shadow-sm" />
                    <span className="text-cyan-300 font-bold">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-rose-950/80 border border-rose-800 text-rose-500" />
                    <span className="text-rose-400">Booked</span>
                  </div>
                </div>

                {/* Seat Map Grid */}
                {loadingSeats ? (
                  <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p>Loading seat layout & availability...</p>
                  </div>
                ) : (
                  <div className="space-y-2 py-2 overflow-x-auto">
                    {seatLayout.map((row) => (
                      <div key={row.rowLabel} className="flex items-center justify-center gap-1.5 min-w-max">
                        <span className="w-5 text-right font-mono text-[10px] text-slate-400 font-bold">
                          {row.rowLabel}
                        </span>
                        <div className="flex gap-1.5">
                          {row.seats.map((seatId) => {
                            const isBooked = bookedSeats.includes(seatId);
                            const isSelected = selectedSeats.includes(seatId);
                            const isShaking = shakingSeat === seatId;

                            return (
                              <button
                                key={seatId}
                                type="button"
                                onClick={() => toggleSeat(seatId)}
                                className={`w-8 h-8 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center justify-center btn-interact ${
                                  isBooked
                                    ? `bg-rose-950/60 border border-rose-900/60 text-rose-600 cursor-not-allowed opacity-60 ${isShaking ? 'seat-shake' : ''}`
                                    : isSelected
                                    ? 'bg-cyan-500 text-slate-950 border border-cyan-300 shadow-md shadow-cyan-500/30 seat-pop'
                                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:border-slate-700'
                                }`}
                                title={isBooked ? `Seat ${seatId} (Already Booked)` : `Seat ${seatId}`}
                              >
                                {seatId.replace(/^[A-Z]+/, '')}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pega Child Case: Food & Beverage & VIP Add-ons Selection */}
              <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🍿</span>
                    <h5 className="font-bold text-xs text-slate-200">F&B & VIP Service Add-ons</h5>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Pega Child Case Generator
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {ADDON_OPTIONS.map((addon) => {
                    const isSelected = selectedAddons.some((a) => a.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon)}
                        className={`p-2.5 rounded-xl border transition-all text-left flex items-center justify-between btn-interact ${
                          isSelected
                            ? 'bg-purple-500/10 border-purple-500/50 text-slate-100 shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{addon.icon}</span>
                          <div>
                            <p className="font-semibold text-[11px] leading-tight">{addon.name}</p>
                            <span className="text-[9px] text-slate-400">{addon.category}</span>
                          </div>
                        </div>
                        <span className={`font-mono font-bold text-[11px] ${isSelected ? 'text-purple-300' : 'text-slate-400'}`}>
                          +${addon.price.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Input Fields */}
              <div className="space-y-3">
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Customer Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="jordan.miller@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                  />
                </div>

                {/* Booking Summary Box with Fade Entrance */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs transition-all duration-300">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Selected Seats</span>
                    <strong className="text-cyan-400 font-mono font-bold animate-in fade-in duration-200">
                      {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Ticket Count & Add-ons</span>
                    <strong className="text-slate-200 font-bold">
                      {numTickets} seat(s){selectedAddons.length > 0 ? ` + ${selectedAddons.length} add-on(s)` : ''}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Cost</span>
                    <strong className="text-emerald-400 text-sm font-extrabold">${derivedTotalCost.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Form Action Button */}
              <button
                type="submit"
                disabled={submitting || selectedSeats.length === 0}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-extrabold rounded-2xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 mt-2 text-sm btn-interact"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit Request ({numTickets} seats selected)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: CUSTOMER CONFIRMATION VIEW WITH SUCCESS ANIMATION (Rule #9) */
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              {/* Success Badge Banner */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-3 shadow-lg shadow-emerald-500/10">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 animate-bounce">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-400">Request Created Successfully!</h4>
                  <p className="text-[11px] text-emerald-300/90 mt-0.5">
                    Case ID <strong className="font-mono text-white">{createdCase.id}</strong> in <strong>Initial Stage</strong>. Confirm to route to staff queue.
                  </p>
                </div>
              </div>

              {/* Case Stage Stepper */}
              <StageStepper currentStage="Initial Stage" />

              {/* Confirmation Details Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Generated Case ID:</span>
                  <strong className="text-cyan-400 font-mono text-sm">{createdCase.id}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Movie Title:</span>
                  <strong className="text-slate-100">{show.movieTitle}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Theatre & Location:</span>
                  <span className="text-slate-300">{show.theatre} ({show.location})</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Seats:</span>
                  <strong className="text-cyan-400 font-mono">{createdCase.selectedSeats?.join(', ') || 'N/A'}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Showtime:</span>
                  <span className="text-slate-300">{new Date(show.dateTime).toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <span className="text-slate-200 font-semibold">{createdCase.customerName} ({createdCase.customerEmail})</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Number of Tickets:</span>
                  <span className="text-slate-200 font-bold">{createdCase.numTickets} ticket(s) @ ${pricePerSeat.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Total Cost Calculated:</span>
                  <strong className="text-emerald-400 font-extrabold text-sm">${createdCase.totalCost.toFixed(2)}</strong>
                </div>

                <div className="flex justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Automated Queue Routing:</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono font-bold border border-purple-500/20">
                    {createdCase.assignedQueue}
                  </span>
                </div>
              </div>

              {/* Confirmation Action Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-2xl transition-colors btn-interact"
                >
                  Cancel / Edit
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={submitting}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 btn-interact"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Booking Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
