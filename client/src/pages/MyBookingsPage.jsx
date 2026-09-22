import React, { useState, useEffect } from 'react';
import { bookingApi } from '../api';
import { Ticket, Search, RefreshCw, Eye, CheckCircle2, Clock, AlertTriangle, XCircle, QrCode, Filter, Bell } from 'lucide-react';
import StageStepper from '../components/StageStepper';
import SLABadge from '../components/SLABadge';
import CaseDetailsModal from '../components/CaseDetailsModal';
import DigitalTicketModal from '../components/DigitalTicketModal';

export default function MyBookingsPage({ onNavigateTracker }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedDetailsCase, setSelectedDetailsCase] = useState(null);
  const [selectedTicketCase, setSelectedTicketCase] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bookingApi.getAll();
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.showDetails?.movieTitle && b.showDetails.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStageNotificationBanner = (status) => {
    switch (status) {
      case 'Initial Stage':
        return 'Your booking request is created! Pending customer confirmation.';
      case 'Availability Check':
        return 'Availability check in progress. Validating show seats...';
      case 'Approval':
        return 'Request confirmed! Case routed to Work Queue for Staff Approval.';
      case 'Booking Execution':
        return 'Approved! Staff is executing booking & deducting seats.';
      case 'Resolved':
        return 'Your Movexa ticket is ready! Click "View Ticket" to access your Digital Pass & QR code.';
      case 'Rejected':
        return 'Request rejected during review or seats ran out.';
      default:
        return 'Case processing...';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
            <Ticket className="w-8 h-8 text-cyan-400" />
            My Booking Cases
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track customer booking requests, view dynamic 5-stage case lifecycles, and access resolved digital passes.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-2xl transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Cases</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Case ID, Name, or Movie..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Stages</option>
            <option value="Initial Stage">Initial Stage</option>
            <option value="Approval">Approval (Pending)</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-xs font-medium">Fetching booking cases...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-panel py-16 px-4 text-center rounded-3xl border border-slate-800 space-y-3">
          <Ticket className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-slate-300">No Booking Cases Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't submitted any booking requests yet or no cases match your filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((booking) => {
            const isResolved = booking.status === 'Resolved';
            const isRejected = booking.status === 'Rejected';
            const show = booking.showDetails || {};
            const seatsList = Array.isArray(booking.selectedSeats) && booking.selectedSeats.length > 0
              ? booking.selectedSeats.join(', ')
              : 'N/A';

            return (
              <div
                key={booking.id}
                className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6 hover:border-cyan-500/40 transition-all shadow-xl"
              >
                {/* Top Meta Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400">Case ID:</span>
                      <strong className="text-xl font-black text-cyan-400 font-mono tracking-wider">
                        {booking.id}
                      </strong>
                      <SLABadge slaInfo={booking.slaInfo} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Customer: <strong className="text-slate-200">{booking.customerName}</strong> ({booking.customerEmail}) &bull; Created: {new Date(booking.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-300 font-mono text-xs font-bold rounded-full border border-purple-500/20">
                      Queue: {booking.assignedQueue}
                    </span>

                    {/* View Case Action */}
                    <button
                      onClick={() => setSelectedDetailsCase(booking)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Case</span>
                    </button>

                    {/* View Ticket Action */}
                    {isResolved && (
                      <button
                        onClick={() => setSelectedTicketCase(booking)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>View Ticket</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Notification Hub Banner */}
                <div
                  className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                    isResolved
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : isRejected
                      ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                      : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
                  }`}
                >
                  <Bell className="w-4 h-4 flex-shrink-0" />
                  <span>{getStageNotificationBanner(booking.status)}</span>
                </div>

                {/* Case Stage Stepper */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Case Lifecycle Stage Flow
                  </span>
                  <StageStepper currentStage={booking.status} isRejected={isRejected} />
                </div>

                {/* Booking Summary Box */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Movie Title</span>
                    <strong className="text-slate-100 font-bold">
                      {show.movieTitle || 'Movie'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Theatre / Location</span>
                    <span className="text-slate-300">
                      {show.theatre ? `${show.theatre} (${show.location})` : 'Theatre'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Selected Seats</span>
                    <strong className="text-cyan-400 font-mono font-bold">
                      {seatsList}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tickets & Total</span>
                    <strong className="text-emerald-400 font-bold text-sm">
                      {booking.numTickets} ticket(s) &bull; ${booking.totalCost.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Case Details Drawer */}
      <CaseDetailsModal
        booking={selectedDetailsCase}
        isOpen={Boolean(selectedDetailsCase)}
        onClose={() => setSelectedDetailsCase(null)}
      />

      {/* Resolved Digital Ticket Pass Modal */}
      <DigitalTicketModal
        booking={selectedTicketCase}
        isOpen={Boolean(selectedTicketCase)}
        onClose={() => setSelectedTicketCase(null)}
      />
    </div>
  );
}
