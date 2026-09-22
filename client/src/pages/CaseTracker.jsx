import React, { useState, useEffect } from 'react';
import { bookingApi } from '../api';
import { Search, Ticket, Calendar, Clock, History, AlertCircle, CheckCircle2, User, Mail, DollarSign, Building } from 'lucide-react';
import StageStepper from '../components/StageStepper';
import SLABadge from '../components/SLABadge';
import CaseAuditModal from '../components/CaseAuditModal';

export default function CaseTracker({ initialCaseId }) {
  const [caseIdInput, setCaseIdInput] = useState(initialCaseId || 'CW-1001');
  const [bookingCase, setBookingCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAuditModal, setShowAuditModal] = useState(false);

  useEffect(() => {
    if (initialCaseId) {
      handleLookup(initialCaseId);
    } else {
      handleLookup('CW-1001');
    }
  }, [initialCaseId]);

  const handleLookup = async (idToSearch) => {
    const targetId = idToSearch || caseIdInput;
    if (!targetId.trim()) return;

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await bookingApi.getById(targetId.trim());
      if (res.data.success) {
        setBookingCase(res.data.data);
      }
    } catch (err) {
      setBookingCase(null);
      setErrorMsg(err.response?.data?.message || `Case ${targetId} not found.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleLookup();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Search Header */}
      <div className="glass-panel p-8 rounded-3xl space-y-6 text-center border border-slate-800 shadow-2xl">
        <div className="max-w-xl mx-auto space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Track Booking Case Progress
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Enter your Pega Case Reference ID (e.g., <code className="text-cyan-400 font-mono">CW-1001</code>) to view stage lifecycle, queue placement, and audit logs.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={caseIdInput}
              onChange={(e) => setCaseIdInput(e.target.value)}
              placeholder="e.g. CW-1001"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm rounded-2xl transition-all shadow-md shadow-cyan-500/20"
          >
            {loading ? 'Searching...' : 'Lookup Case'}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Case Details View */}
      {bookingCase && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-800 shadow-2xl animate-in fade-in duration-300">
          {/* Top Bar: Case ID & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-400">Pega Case ID:</span>
                <h2 className="text-2xl font-black text-cyan-400 font-mono tracking-wider">{bookingCase.id}</h2>
                <SLABadge slaInfo={bookingCase.slaInfo} />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Created: {new Date(bookingCase.createdAt).toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => setShowAuditModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all shadow-sm self-start sm:self-auto"
            >
              <History className="w-4 h-4 text-cyan-400" />
              <span>View Pega Audit Trail ({bookingCase.auditLogs?.length || 0})</span>
            </button>
          </div>

          {/* Lifecycle Stepper Component */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Current Case Lifecycle Stage
            </h3>
            <StageStepper currentStage={bookingCase.status} isRejected={bookingCase.status === 'Rejected'} />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Show & Movie Info */}
            <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800 space-y-3">
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2 border-b border-slate-800/80 pb-2">
                <Ticket className="w-4 h-4 text-cyan-400" />
                Ticket & Show Details
              </h4>

              {bookingCase.showDetails ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Movie Title:</span>
                    <strong className="text-slate-100">{bookingCase.showDetails.movieTitle}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Theatre & Location:</span>
                    <span className="text-slate-300">{bookingCase.showDetails.theatre} ({bookingCase.showDetails.location})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Showtime:</span>
                    <span className="text-slate-300">{new Date(bookingCase.showDetails.dateTime).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tickets Reserved:</span>
                    <strong className="text-cyan-400">{bookingCase.numTickets} ticket(s)</strong>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-400 font-semibold">Total Cost Paid:</span>
                    <strong className="text-emerald-400 text-sm">${bookingCase.totalCost.toFixed(2)}</strong>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Show details unavailable.</p>
              )}
            </div>

            {/* Pega Workflow & Queue Info */}
            <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800 space-y-3">
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2 border-b border-slate-800/80 pb-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Pega Workflow Routing & Info
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Work Queue:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono font-bold border border-amber-500/20">
                    {bookingCase.assignedQueue}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Name:</span>
                  <span className="text-slate-200 font-semibold">{bookingCase.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Email:</span>
                  <span className="text-slate-300">{bookingCase.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Confirmed:</span>
                  <span className={bookingCase.confirmed ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {bookingCase.confirmed ? 'Yes (Confirmed Step)' : 'Pending'}
                  </span>
                </div>
                {bookingCase.resolvedAt && (
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Resolved Timestamp:</span>
                    <span className="text-emerald-400 font-mono">{new Date(bookingCase.resolvedAt).toLocaleString()}</span>
                  </div>
                )}
                {bookingCase.rejectionReason && (
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-rose-400 font-bold">Rejection Reason:</span>
                    <span className="text-rose-300">{bookingCase.rejectionReason}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Audit Timeline Modal */}
      {showAuditModal && bookingCase && (
        <CaseAuditModal booking={bookingCase} onClose={() => setShowAuditModal(false)} />
      )}
    </div>
  );
}
