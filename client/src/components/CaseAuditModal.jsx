import React from 'react';
import { X, History, User, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function CaseAuditModal({ booking, onClose }) {
  if (!booking) return null;

  const logs = booking.auditLogs || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                Pega Case Audit Trail
                <span className="px-2 py-0.5 rounded text-xs bg-slate-800 font-mono text-cyan-400 border border-slate-700">
                  {booking.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Customer: {booking.customerName} ({booking.customerEmail})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Timeline Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {logs.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-sm">No audit history recorded yet.</p>
          ) : (
            <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
              {logs.map((log, index) => (
                <div key={log.id || index} className="relative group">
                  {/* Bullet Marker */}
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-cyan-400 group-hover:bg-cyan-400 transition-colors" />

                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {log.stage}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-slate-200">{log.action}</h4>

                    {log.details && (
                      <p className="text-xs text-slate-400 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/60 font-sans leading-relaxed">
                        {log.details}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Performed by: <strong className="text-slate-300">{log.performedBy}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-colors"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
}
