import React from 'react';
import { Clock, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SLABadge({ slaInfo }) {
  if (!slaInfo) return null;

  if (slaInfo.code === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {slaInfo.label}
      </span>
    );
  }

  if (slaInfo.code === 'DEADLINE_MISSED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-md shadow-rose-500/20 animate-pulse">
        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        <span>SLA Deadline Missed</span>
        {slaInfo.elapsedFormatted && (
          <span className="text-[10px] opacity-80 font-mono">({slaInfo.elapsedFormatted})</span>
        )}
      </span>
    );
  }

  if (slaInfo.code === 'GOAL_MISSED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>SLA Goal Missed</span>
        {slaInfo.elapsedFormatted && (
          <span className="text-[10px] opacity-80 font-mono">({slaInfo.elapsedFormatted})</span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm">
      <Clock className="w-3.5 h-3.5 text-cyan-400" />
      <span>On Track</span>
      {slaInfo.elapsedFormatted && (
        <span className="text-[10px] opacity-80 font-mono">({slaInfo.elapsedFormatted})</span>
      )}
    </span>
  );
}
