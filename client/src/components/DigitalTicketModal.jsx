import React from 'react';
import { X, Film, Building, Calendar, Ticket, CheckCircle2, ShieldCheck, QrCode, Printer, MapPin, User, DollarSign, Armchair } from 'lucide-react';

export default function DigitalTicketModal({ booking, isOpen, onClose }) {
  if (!isOpen || !booking) return null;

  const show = booking.showDetails || {};
  const isResolved = booking.status === 'Resolved';
  const selectedSeats = Array.isArray(booking.selectedSeats) && booking.selectedSeats.length > 0
    ? booking.selectedSeats.join(' • ')
    : 'N/A';

  if (!isResolved) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center mx-auto text-lg font-bold">
            !
          </div>
          <h3 className="font-extrabold text-slate-100 text-lg">Ticket Not Available Yet</h3>
          <p className="text-xs text-slate-400">
            Digital tickets are generated <strong>only after staff approval & case resolution</strong> (`status = Resolved`). 
            Current stage for Case <span className="font-mono text-cyan-400">{booking.id}</span> is <strong className="text-amber-300">{booking.status}</strong>.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Generate dynamic QR SVG pattern
  const qrPayload = JSON.stringify({
    caseId: booking.id,
    movie: show.movieTitle,
    theatre: show.theatre,
    seats: selectedSeats,
    dateTime: show.dateTime,
    tickets: booking.numTickets,
    customer: booking.customerName,
  });

  // Simple pure SVG QR matrix visualizer generator for zero-dependency rendering
  const generateQrMatrix = (str) => {
    const size = 15;
    const cells = [];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Corner positioning markers
        const isTL = r < 4 && c < 4;
        const isTR = r < 4 && c >= size - 4;
        const isBL = r >= size - 4 && c < 4;
        if (isTL || isTR || isBL) {
          const innerTL = r >= 1 && r <= 2 && c >= 1 && c <= 2;
          const innerTR = r >= 1 && r <= 2 && c >= size - 3 && c <= size - 2;
          const innerBL = r >= size - 3 && r <= size - 2 && c >= 1 && c <= 2;
          const isBorder = (r === 0 || r === 3 || c === 0 || c === 3) ||
                           (r === 0 || r === 3 || c === size - 4 || c === size - 1) ||
                           (r === size - 4 || r === size - 1 || c === 0 || c === 3);
          cells.push(isBorder || innerTL || innerTR || innerBL);
        } else {
          cells.push(((hash >> ((r * size + c) % 24)) & 1) === 1);
        }
      }
    }
    return { size, cells };
  };

  const qr = generateQrMatrix(qrPayload);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-black">
              <Film className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm">Movexa Digital Pass ⭐</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Official E-Ticket &bull; {booking.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Container */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Pass Design */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 shadow-2xl relative">
            <div className="p-6 space-y-5">
              {/* Status Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ticket Verified & Resolved</span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                  {booking.id}
                </span>
              </div>

              {/* Movie info */}
              <div className="flex gap-4">
                {show.posterUrl && (
                  <img
                    src={show.posterUrl}
                    alt={show.movieTitle}
                    className="w-20 h-28 rounded-2xl object-cover bg-slate-950 border border-slate-800 shadow-md flex-shrink-0"
                  />
                )}
                <div className="space-y-1.5 flex-1">
                  <h2 className="text-xl font-black text-slate-100">{show.movieTitle || 'Movie'}</h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Building className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{show.theatre || 'Movexa Multiplex'}</span>
                    <span>&bull;</span>
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{show.location || 'Main Hall'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{show.dateTime ? new Date(show.dateTime).toLocaleString() : 'N/A'}</span>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {show.showType || 'Standard'} Experience
                  </span>
                </div>
              </div>

              {/* Ticket Breakdown */}
              <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Customer</span>
                  <strong className="text-slate-200 truncate block">{booking.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tickets</span>
                  <strong className="text-cyan-400 text-sm font-black">{booking.numTickets} Seat(s)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Paid</span>
                  <strong className="text-emerald-400 text-sm font-extrabold">${booking.totalCost.toFixed(2)}</strong>
                </div>
              </div>

              {/* Selected Seats Banner */}
              <div className="bg-slate-950/90 p-3 rounded-2xl border border-cyan-500/20 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Armchair className="w-4 h-4 text-cyan-400" />
                  Reserved Seat Numbers:
                </span>
                <strong className="text-cyan-300 font-mono font-bold text-sm tracking-wide">
                  {selectedSeats}
                </strong>
              </div>

              {/* Dynamic QR Code */}
              <div className="pt-4 border-t border-dashed border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Entry Scan Code</span>
                  <p className="text-xs text-slate-300">Present this QR code at cinema gate for entry validation.</p>
                </div>

                {/* SVG QR Code */}
                <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-200">
                  <svg width="100" height="100" viewBox={`0 0 ${qr.size} ${qr.size}`} className="w-24 h-24">
                    {qr.cells.map((isDark, idx) => {
                      const r = Math.floor(idx / qr.size);
                      const c = idx % qr.size;
                      return isDark ? (
                        <rect key={idx} x={c} y={r} width="1" height="1" fill="#0f172a" />
                      ) : null;
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print Ticket</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
