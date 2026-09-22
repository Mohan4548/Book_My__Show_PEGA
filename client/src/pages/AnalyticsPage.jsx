import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShieldCheck, DollarSign, Ticket, Download, Layers, Calendar, Filter, Sparkles } from 'lucide-react';
import { statsApi, bookingApi } from '../api';
import { useToast } from '../components/Toast';

export default function AnalyticsPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await statsApi.getAnalytics();
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      addToast('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const res = await bookingApi.getAll();
      if (!res.data.success) throw new Error('Failed to fetch cases for export');

      const bookings = res.data.data;
      if (bookings.length === 0) {
        addToast('No booking cases available to export.', 'warning');
        return;
      }

      // Format CSV content
      const headers = ['Case ID', 'Customer Name', 'Customer Email', 'Stage Status', 'Assigned Queue', 'Ticket Count', 'Selected Seats', 'Total Cost ($)', 'Urgency', 'Created At', 'Resolved At'];
      const rows = bookings.map(b => [
        `"${b.id}"`,
        `"${b.customerName}"`,
        `"${b.customerEmail}"`,
        `"${b.status}"`,
        `"${b.assignedQueue}"`,
        b.numTickets,
        `"${(b.selectedSeats || []).join(';')}"`,
        b.totalCost?.toFixed(2) || '0.00',
        b.urgency || 10,
        `"${b.createdAt}"`,
        `"${b.resolvedAt || ''}"`
      ]);

      const csvString = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `CineWave_Pega_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('CSV Audit Report downloaded successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-xs font-mono">Loading Pega Analytics & SLA Reports...</p>
      </div>
    );
  }

  const { totalRevenue, premiumRevenue, standardRevenue, totalTicketsSold, totalCases, slaComplianceRate, movieBreakdown } = analytics || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-100">Pega Case Analytics & Reports</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              PRPC SLA Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time financial performance, work queue routing efficiency, and SLA compliance metrics.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all btn-interact"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? 'Generating Report...' : 'Export Audit Report (CSV)'}</span>
        </button>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Gross Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Gross Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              ${(totalRevenue || 0).toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>From resolved booking cases</span>
            </p>
          </div>
        </div>

        {/* Metric 2: SLA Compliance Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">SLA Compliance Rate</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-cyan-400 font-mono">
              {slaComplianceRate}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Target SLA Goal: &lt; 24 Hours
            </p>
          </div>
        </div>

        {/* Metric 3: Total Tickets Issued */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tickets Issued</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-purple-300 font-mono">
              {totalTicketsSold}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Across {totalCases} total case requests
            </p>
          </div>
        </div>

        {/* Metric 4: Work Queue Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Queue Revenue Breakdown</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-purple-400 font-bold">Premium Queue:</span>
              <span className="font-mono text-slate-200">${(premiumRevenue || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400 font-bold">Standard Queue:</span>
              <span className="font-mono text-slate-200">${(standardRevenue || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Financial & Case Performance Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Movie Performance & Pega Case Summary
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of resolved cases, seat volume, and gross revenue per title.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Movie Title</th>
                <th className="py-3 px-4">Show Type</th>
                <th className="py-3 px-4">Resolved Cases</th>
                <th className="py-3 px-4">Tickets Sold</th>
                <th className="py-3 px-4 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {(movieBreakdown || []).map((m) => (
                <tr key={m.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-slate-100">{m.title}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      m.showType === 'Premium'
                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                        : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                    }`}>
                      {m.showType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">{m.resolvedCases} case(s)</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">{m.ticketsCount} seats</td>
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-400 text-sm">
                    ${m.revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
