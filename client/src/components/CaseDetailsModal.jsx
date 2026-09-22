import React from 'react';
import { X, Layers, User, Ticket, GitBranch, Clock, CheckCircle2, XCircle, ShieldCheck, History, Armchair } from 'lucide-react';
import StageStepper from './StageStepper';
import SLABadge from './SLABadge';

export default function CaseDetailsModal({ booking, isOpen, onClose, onOpenAuditTrail }) {
  if (!isOpen || !booking) return null;

  const show = booking.showDetails || {};
  const isConfirmed = Boolean(booking.confirmed);
  const seatsList = Array.isArray(booking.selectedSeats) && booking.selectedSeats.length > 0
    ? booking.selectedSeats.join(', ')
    : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                Pega Case Details
                <span className="font-mono text-cyan-400 text-sm bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {booking.id}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Case Type: <strong className="text-slate-200">Movie Ticket Request</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Stage Progress Stepper */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Case Lifecycle Stage Flow
              </span>
              <SLABadge slaInfo={booking.slaInfo} />
            </div>
            <StageStepper currentStage={booking.status} isRejected={booking.status === 'Rejected'} />
          </div>

          {/* Details 4-Grid Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Case Information */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <h4 className="font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2 text-sm">
                <Layers className="w-4 h-4 text-cyan-400" />
                Case Information
              </h4>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Case Reference ID:</span>
                  <strong className="text-cyan-400 font-mono">{booking.id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Case Type:</span>
                  <span className="text-slate-200 font-semibold">Movie Ticket Request</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Stage:</span>
                  <span className="text-cyan-300 font-bold">{booking.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created At:</span>
                  <span className="text-slate-300 font-mono">{new Date(booking.createdAt).toLocaleString()}</span>
                </div>
                {booking.resolvedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resolved At:</span>
                    <span className="text-emerald-400 font-mono">{new Date(booking.resolvedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Customer Information */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <h4 className="font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2 text-sm">
                <User className="w-4 h-4 text-cyan-400" />
                Customer Information
              </h4>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Full Name:</span>
                  <strong className="text-slate-100">{booking.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email Address:</span>
                  <span className="text-slate-300 font-mono">{booking.customerEmail}</span>
                </div>
              </div>
            </div>

            {/* 3. Booking Information */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <h4 className="font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2 text-sm">
                <Ticket className="w-4 h-4 text-cyan-400" />
                Booking & Seat Information
              </h4>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Movie Title:</span>
                  <strong className="text-slate-100">{show.movieTitle || 'Movie'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Theatre / Location:</span>
                  <span className="text-slate-300">{show.theatre || 'N/A'} ({show.location || 'N/A'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Time:</span>
                  <span className="text-slate-300">{show.dateTime ? new Date(show.dateTime).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Seats:</span>
                  <strong className="text-cyan-400 font-mono">{seatsList}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tickets Reserved:</span>
                  <strong className="text-slate-200">{booking.numTickets} ticket(s)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Price per Seat:</span>
                  <span className="text-slate-300">${show.pricePerSeat ? show.pricePerSeat.toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400 font-bold">Total Cost:</span>
                  <strong className="text-emerald-400 text-sm font-extrabold">${booking.totalCost.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* 4. Workflow Information */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <h4 className="font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2 text-sm">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                Workflow & Queue Information
              </h4>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Work Queue:</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono font-bold border border-purple-500/20">
                    {booking.assignedQueue}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Confirmed:</span>
                  <span className={isConfirmed ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {isConfirmed ? 'Yes (confirmed = true)' : 'No (confirmed = false)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Stage:</span>
                  <strong className="text-cyan-300">{booking.status}</strong>
                </div>
                {booking.rejectionReason && (
                  <div className="flex justify-between text-rose-400 pt-1 border-t border-slate-800">
                    <span>Rejection Reason:</span>
                    <span>{booking.rejectionReason}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={() => {
              onClose();
              if (onOpenAuditTrail) onOpenAuditTrail(booking);
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <History className="w-4 h-4" />
            <span>Inspect Full Pega Audit Log</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
