import React from 'react';
import { Check, Clock, XCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const STAGES = [
  'Initial Stage',
  'Availability Check',
  'Approval',
  'Booking Execution',
  'Resolved',
];

export default function StageStepper({ currentStage, isRejected = false }) {
  const getStageIndex = (stage) => {
    if (stage === 'Rejected') return -1;
    return STAGES.indexOf(stage);
  };

  const currentIndex = getStageIndex(currentStage);

  if (isRejected || currentStage === 'Rejected') {
    return (
      <div className="w-full bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shadow-md shadow-rose-500/10">
            <XCircle className="w-6 h-6 animate-in zoom-in-75 duration-200" />
          </div>
          <div>
            <h4 className="font-semibold text-rose-300">Case Rejected</h4>
            <p className="text-xs text-rose-400/80">Workflow terminated during staff review or seat validation.</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-full border border-rose-500/30">
          Stage: Rejected
        </span>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-none">
        {STAGES.map((stageName, index) => {
          const isCompleted = index < currentIndex || currentStage === 'Resolved';
          const isCurrent = index === currentIndex && currentStage !== 'Resolved';
          const isUpcoming = index > currentIndex && currentStage !== 'Resolved';

          return (
            <React.Fragment key={stageName}>
              <div className="flex items-center gap-2 min-w-max">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-100'
                      : isCurrent
                      ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20 font-extrabold animate-pulse'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3] animate-in zoom-in-50 duration-200" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium transition-colors duration-200 ${
                    isCompleted
                      ? 'text-emerald-400 font-semibold'
                      : isCurrent
                      ? 'text-cyan-300 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  {stageName}
                </span>
              </div>

              {index < STAGES.length - 1 && (
                <div
                  className={`h-0.5 flex-1 min-w-[20px] mx-1 transition-all duration-500 ${
                    index < currentIndex || currentStage === 'Resolved'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-sm shadow-emerald-500/50'
                      : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
