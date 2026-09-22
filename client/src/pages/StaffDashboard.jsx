import React, { useState, useEffect } from 'react';
import { bookingApi, statsApi } from '../api';
import {
  ShieldCheck, LayoutDashboard, Layers, Users, Clock, Film, Calendar, BarChart3,
  Bell, User, Zap, RefreshCw, AlertTriangle, AlertCircle, CheckCircle2, XCircle, History, Filter, Search, Eye
} from 'lucide-react';
import SLABadge from '../components/SLABadge';
import CaseAuditModal from '../components/CaseAuditModal';
import CaseDetailsModal from '../components/CaseDetailsModal';
import { useToast } from '../components/Toast';

export default function StaffDashboard({ onNavigateTab }) {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sidebar active view: 'dashboard' | 'cases' | 'premium' | 'standard' | 'sla'
  const [activeView, setActiveView] = useState('dashboard');

  // Filters State
  const [queueFilter, setQueueFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [slaFilter, setSlaFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Modals
  const [selectedCaseForAudit, setSelectedCaseForAudit] = useState(null);
  const [selectedCaseForDetails, setSelectedCaseForDetails] = useState(null);
  const [rejectingCase, setRejectingCase] = useState(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [queueFilter, statusFilter, slaFilter, searchQuery, isDemoMode, activeView]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine queue & SLA filters based on sidebar active view
      let effectiveQueue = queueFilter;
      if (activeView === 'premium') effectiveQueue = 'PremiumShowQueue';
      if (activeView === 'standard') effectiveQueue = 'StandardShowQueue';

      let effectiveSla = slaFilter;
      if (activeView === 'sla' && slaFilter === 'all') effectiveSla = 'all';

      const params = {
        queue: effectiveQueue,
        status: statusFilter,
        sla: effectiveSla,
        search: searchQuery,
        demoMode: isDemoMode,
      };

      const [bRes, sRes] = await Promise.all([
        bookingApi.getAll(params),
        statsApi.get({ demoMode: isDemoMode }),
      ]);

      if (bRes.data.success) setBookings(bRes.data.data);
      if (sRes.data.success) setStats(sRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to backend /api/stats or /api/bookings.');
    } finally {
      setLoading(false);
    }
  };

  const { addToast } = useToast();

  // Phase 3 Approval Handler (Approve Booking -> Booking Execution -> Resolved)
  const handleApprove = async (caseId) => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await bookingApi.approve(caseId, { staffName: 'Staff Manager (Pega Approver)' });
      if (res.data.success) {
        setSuccessBanner(`Case ${caseId} Approved! Seats deducted and email correspondence triggered.`);
        addToast(`Case ${caseId} Approved & Resolved!`, 'success');
        setTimeout(() => setSuccessBanner(''), 7000);
        fetchDashboardData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to approve booking case.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Phase 3 Rejection Handler (Reject Booking)
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingCase) return;

    try {
      setActionLoading(true);
      setError(null);
      const res = await bookingApi.reject(rejectingCase.id, {
        staffName: 'Staff Manager',
        reason: rejectionNote || 'Rejected during staff queue review',
      });
      if (res.data.success) {
        setSuccessBanner(`Case ${rejectingCase.id} marked as Rejected.`);
        addToast(`Case ${rejectingCase.id} marked as Rejected`, 'error');
        setTimeout(() => setSuccessBanner(''), 7000);
        setRejectingCase(null);
        setRejectionNote('');
        fetchDashboardData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reject booking case.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper for Status Badge Colors (Rule #2)
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Initial Stage':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'Availability Check':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Approval':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Booking Execution':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Rejected':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'cases', label: 'All Cases Queue', icon: Layers, badge: stats?.totalCases },
    { id: 'premium', label: 'Premium Queue', icon: Users, badge: stats?.premiumQueuePending },
    { id: 'standard', label: 'Standard Queue', icon: Users, badge: stats?.standardQueuePending },
    { id: 'sla', label: 'SLA Monitor', icon: Clock, badge: (stats?.slaGoalMissed || 0) + (stats?.slaDeadlineMissed || 0) },
    { id: 'movies', label: 'Movies Catalog', icon: Film, isNav: true },
    { id: 'shows', label: 'Shows Schedule', icon: Calendar, isNav: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header Navigation */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 font-black shadow-md shadow-amber-500/20">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
              Movexa Staff Portal ⭐
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono border border-amber-500/30">
                Pega Case Manager
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Review ticket cases, process work queues, and monitor SLA health.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Fast Demo SLA Switch */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 text-xs">
            <Zap className={`w-3.5 h-3.5 ${isDemoMode ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
            <span className="text-[11px] font-bold text-slate-300">Fast Demo SLA</span>
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                isDemoMode ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                  isDemoMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 relative">
            <Bell className="w-4 h-4 text-cyan-400" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left text-xs">
              <strong className="block text-slate-200">Staff Agent</strong>
              <span className="text-[10px] text-slate-400">Pega Approver</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Staff Portal Layout: Sidebar + Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider px-3">
              Staff Views
            </span>
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const IconComp = link.icon;
                const isActive = activeView === link.id;

                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      if (link.isNav && onNavigateTab) {
                        onNavigateTab(link.id);
                      } else {
                        setActiveView(link.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComp className="w-4 h-4" />
                      <span>{link.label}</span>
                    </div>

                    {link.badge !== undefined && link.badge > 0 && (
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold ${
                          isActive
                            ? 'bg-slate-950 text-cyan-400'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <span>{error}</span>
              </div>
              <button onClick={fetchDashboardData} className="px-3 py-1 bg-rose-500/20 rounded-xl text-xs font-bold">
                Retry API
              </button>
            </div>
          )}

          {/* Success Banner */}
          {successBanner && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{successBanner}</span>
              </div>
              <button onClick={() => setSuccessBanner('')} className="text-xs opacity-80">
                Dismiss
              </button>
            </div>
          )}

          {/* Dashboard Stats Cards Grid (consuming GET /api/stats) */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div
                onClick={() => { setActiveView('cases'); setStatusFilter('all'); }}
                className="glass-card p-3.5 rounded-2xl border border-slate-800 space-y-1 cursor-pointer hover:border-cyan-500/40 transition-colors"
              >
                <span className="text-[11px] font-semibold text-slate-400">Total Cases</span>
                <div className="text-2xl font-black text-slate-100">{stats.totalCases}</div>
              </div>

              <div
                onClick={() => { setActiveView('cases'); setStatusFilter('Approval'); }}
                className="glass-card p-3.5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 space-y-1 cursor-pointer hover:border-cyan-500/40 transition-colors"
              >
                <span className="text-[11px] font-semibold text-cyan-300">Pending Approval</span>
                <div className="text-2xl font-black text-cyan-400">{stats.pendingApproval}</div>
              </div>

              <div
                onClick={() => { setActiveView('cases'); setStatusFilter('Resolved'); }}
                className="glass-card p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-1 cursor-pointer hover:border-emerald-500/40 transition-colors"
              >
                <span className="text-[11px] font-semibold text-emerald-300">Resolved Cases</span>
                <div className="text-2xl font-black text-emerald-400">{stats.resolvedCases}</div>
              </div>

              <div
                onClick={() => { setActiveView('cases'); setStatusFilter('Rejected'); }}
                className="glass-card p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-1 cursor-pointer hover:border-rose-500/40 transition-colors"
              >
                <span className="text-[11px] font-semibold text-rose-300">Rejected Cases</span>
                <div className="text-2xl font-black text-rose-400">{stats.rejectedCases}</div>
              </div>

              <div
                onClick={() => { setActiveView('premium'); }}
                className="glass-card p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-1 cursor-pointer hover:border-amber-500/40 transition-colors"
              >
                <span className="text-[11px] font-semibold text-amber-300">Premium Queue</span>
                <div className="text-2xl font-black text-amber-400">{stats.premiumQueuePending}</div>
              </div>

              <div
                onClick={() => { setActiveView('standard'); }}
                className="glass-card p-3.5 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-1 cursor-pointer hover:border-purple-500/40 transition-colors"
              >
                <span className="text-[11px] font-semibold text-purple-300">Standard Queue</span>
                <div className="text-2xl font-black text-purple-400">{stats.standardQueuePending}</div>
              </div>

              <div
                onClick={() => { setActiveView('sla'); setSlaFilter('GOAL_MISSED'); }}
                className="glass-card p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-1 cursor-pointer hover:border-amber-500/50 transition-colors"
              >
                <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  SLA Goal Missed
                </span>
                <div className="text-2xl font-black text-amber-400">{stats.slaGoalMissed}</div>
              </div>

              <div
                onClick={() => { setActiveView('sla'); setSlaFilter('DEADLINE_MISSED'); }}
                className="glass-card p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 space-y-1 cursor-pointer hover:border-rose-500/50 transition-colors"
              >
                <span className="text-[11px] font-semibold text-rose-300 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 animate-pulse" />
                  SLA Deadline Missed
                </span>
                <div className="text-2xl font-black text-rose-400">{stats.slaDeadlineMissed}</div>
              </div>

              <div
                onClick={() => { setActiveView('sla'); setSlaFilter('ON_TRACK'); }}
                className="glass-card p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-1 cursor-pointer hover:border-emerald-500/50 transition-colors"
              >
                <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  SLA On Track
                </span>
                <div className="text-2xl font-black text-emerald-400">{stats.slaOnTrack}</div>
              </div>

              <div
                onClick={() => { setActiveView('cases'); setStatusFilter('Availability Check'); }}
                className="glass-card p-3.5 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-1 cursor-pointer hover:border-blue-500/40 transition-colors"
              >
                <span className="text-[11px] font-semibold text-blue-300">Availability Check</span>
                <div className="text-2xl font-black text-blue-400">{stats.availabilityCheckCount}</div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Queue Filter */}
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <select
                  value={activeView === 'premium' ? 'PremiumShowQueue' : activeView === 'standard' ? 'StandardShowQueue' : queueFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'PremiumShowQueue') setActiveView('premium');
                    else if (val === 'StandardShowQueue') setActiveView('standard');
                    else {
                      setQueueFilter(val);
                      setActiveView('cases');
                    }
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Work Queues</option>
                  <option value="PremiumShowQueue">PremiumShowQueue</option>
                  <option value="StandardShowQueue">StandardShowQueue</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Case Stages</option>
                  <option value="Initial Stage">Stage: Initial Stage</option>
                  <option value="Availability Check">Stage: Availability Check</option>
                  <option value="Approval">Stage: Approval (Pending)</option>
                  <option value="Booking Execution">Stage: Booking Execution</option>
                  <option value="Resolved">Stage: Resolved</option>
                  <option value="Rejected">Stage: Rejected</option>
                </select>
              </div>

              {/* SLA Filter */}
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <select
                  value={slaFilter}
                  onChange={(e) => setSlaFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All SLA Statuses</option>
                  <option value="ON_TRACK">SLA On Track 🟢</option>
                  <option value="GOAL_MISSED">SLA Goal Missed 🟠</option>
                  <option value="DEADLINE_MISSED">SLA Deadline Missed 🔴</option>
                </select>
              </div>
            </div>

            {/* Search Input & Refresh */}
            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Case ID/Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={fetchDashboardData}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                title="Refresh Cases & Stats"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Cases Table / List View */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                {activeView === 'premium' ? 'Premium Work Queue (PremiumShowQueue)' :
                 activeView === 'standard' ? 'Standard Work Queue (StandardShowQueue)' :
                 activeView === 'sla' ? 'SLA Performance Monitor' :
                 'Pega Case Management Work Queue'}
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-400">
                  {bookings.length} cases
                </span>
              </h3>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-500 text-sm">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading cases queue...
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm">
                No booking cases found matching the active filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Case ID</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Movie & Show</th>
                      <th className="py-3.5 px-4">Tickets & Cost</th>
                      <th className="py-3.5 px-4">Stage</th>
                      <th className="py-3.5 px-4">Work Queue</th>
                      <th className="py-3.5 px-4">SLA Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {bookings.map((booking) => {
                      const isPending = booking.status === 'Approval';

                      return (
                        <tr key={booking.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-cyan-400">
                            {booking.id}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-slate-100">{booking.customerName}</div>
                            <div className="text-[11px] text-slate-400">{booking.customerEmail}</div>
                          </td>
                          <td className="py-4 px-4">
                            {booking.showDetails ? (
                              <div>
                                <div className="font-semibold text-slate-200">{booking.showDetails.movieTitle}</div>
                                <div className="text-[11px] text-slate-400">
                                  {booking.showDetails.theatre} ({booking.showDetails.location})
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500">Show #{booking.showId}</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-200">{booking.numTickets} ticket(s)</div>
                            <div className="text-emerald-400 font-extrabold">${booking.totalCost.toFixed(2)}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeStyle(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              {booking.assignedQueue}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <SLABadge slaInfo={booking.slaInfo} />
                          </td>
                          <td className="py-4 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => setSelectedCaseForDetails(booking)}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 font-medium border border-slate-700 transition-colors"
                              title="Review Case Information"
                            >
                              <Eye className="w-3.5 h-3.5 inline mr-1" />
                              Review
                            </button>
                            <button
                              onClick={() => setSelectedCaseForAudit(booking)}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium border border-slate-700 transition-colors"
                              title="Audit Trail"
                            >
                              <History className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
                              Audit
                            </button>

                            {/* Phase 3 Approval & Rejection Actions (Rule #5) */}
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApprove(booking.id)}
                                  disabled={actionLoading}
                                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-sm"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => setRejectingCase(booking)}
                                  disabled={actionLoading}
                                  className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Case Details Drawer Modal */}
      <CaseDetailsModal
        booking={selectedCaseForDetails}
        isOpen={Boolean(selectedCaseForDetails)}
        onClose={() => setSelectedCaseForDetails(null)}
        onOpenAuditTrail={(b) => setSelectedCaseForAudit(b)}
      />

      {/* Audit Modal */}
      {selectedCaseForAudit && (
        <CaseAuditModal booking={selectedCaseForAudit} onClose={() => setSelectedCaseForAudit(null)} />
      )}

      {/* Reject Modal */}
      {rejectingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-extrabold text-rose-400 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              Reject Booking Case: {rejectingCase.id}
            </h3>

            <p className="text-xs text-slate-400">
              Customer: <strong className="text-slate-200">{rejectingCase.customerName}</strong> ({rejectingCase.numTickets} tickets reserved)
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Reason for Rejection *</label>
                <textarea
                  required
                  rows="3"
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="e.g. Theatre maintenance / Payment authorization issue"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setRejectingCase(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
