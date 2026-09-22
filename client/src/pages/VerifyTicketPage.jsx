import React, { useState } from 'react';
import { bookingApi } from '../api';
import { QrCode, Search, CheckCircle2, XCircle, Building, Calendar, Ticket, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function VerifyTicketPage() {
  const { addToast } = useToast();
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    try {
      setLoading(true);
      setResult(null);

      // Extract Case ID if full QR JSON was pasted
      let caseIdToTest = inputCode.trim();
      try {
        const parsed = JSON.parse(inputCode);
        if (parsed.caseId) caseIdToTest = parsed.caseId;
      } catch (err) {
        // Plain case ID entered
      }

      const res = await bookingApi.verifyTicket(caseIdToTest);
      setResult({
        isValid: true,
        message: res.data.message,
        booking: res.data.data,
      });
      addToast(`Ticket ${caseIdToTest} verified successfully!`, 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Invalid ticket or server error.';
      setResult({
        isValid: false,
        message: msg,
        booking: err.response?.data?.data,
      });
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
            <QrCode className="w-8 h-8 text-cyan-400" />
            Staff Ticket Verification Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Scan or enter a Movexa Booking ID (`CW-1001`) to verify ticket validity live against backend records.
          </p>
        </div>

        <span className="px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-mono rounded-full self-start md:self-auto">
          API: GET /api/bookings/verify/:id
        </span>
      </div>

      {/* Verification Input Form */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Enter Booking Reference ID or Paste QR Payload *
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="e.g. CW-1001 or paste QR string"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 uppercase transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 btn-interact"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Ticket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Result Card */}
      {result && (
        <div className="animate-in fade-in zoom-in-95 duration-250">
          {result.isValid ? (
            /* VALID TICKET CARD */
            <div className="glass-panel rounded-3xl p-6 border border-emerald-500/40 bg-emerald-500/5 space-y-6 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold shadow-lg shadow-emerald-500/30 animate-in zoom-in-75 duration-200">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-emerald-400 text-lg">VALID TICKET VERIFIED</h3>
                  <p className="text-xs text-slate-300">{result.message}</p>
                </div>
              </div>

              {/* Ticket Details */}
              {result.booking && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Case Info</span>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Booking ID:</span>
                      <strong className="text-cyan-400 font-mono text-sm">{result.booking.id}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Customer Name:</span>
                      <strong className="text-slate-100">{result.booking.customerName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-slate-300 font-mono">{result.booking.customerEmail}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Show Details</span>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Movie Title:</span>
                      <strong className="text-slate-100">{result.booking.showDetails?.movieTitle || 'Movie'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Theatre:</span>
                      <span className="text-slate-300">{result.booking.showDetails?.theatre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reserved Seats:</span>
                      <strong className="text-cyan-400 font-mono">{result.booking.selectedSeats?.join(', ') || 'N/A'}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* INVALID TICKET CARD */
            <div className="glass-panel rounded-3xl p-6 border border-rose-500/40 bg-rose-500/5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-slate-950 flex items-center justify-center font-extrabold shadow-lg shadow-rose-500/30 animate-in zoom-in-75 duration-200">
                  <XCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-rose-400 text-lg">INVALID TICKET</h3>
                  <p className="text-xs text-rose-300">{result.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
