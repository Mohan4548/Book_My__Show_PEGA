import React from 'react';
import { X, Layers, GitBranch, Clock, Users, Mail, CheckCircle2, Shield } from 'lucide-react';

export default function PegaMappingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const MAPPINGS = [
    {
      pegaConcept: 'Case Type',
      cinewaveMapping: 'BookingRequest Model (`CW-1001`)',
      icon: Layers,
      color: 'from-cyan-500 to-blue-600',
      description:
        'Every customer ticket request creates a distinct case instance with a unique ID format (`CW-1001`), tracking fields such as customer info, show ref, ticket count, derived total cost, and status.',
    },
    {
      pegaConcept: 'Case Lifecycle & Stages',
      cinewaveMapping: '`status` Field Stepper & State Machine',
      icon: GitBranch,
      color: 'from-emerald-500 to-teal-600',
      description:
        'Defined 5-stage lifecycle: Initial Stage → Availability Check → Approval → Booking Execution → Resolved (or Rejected). Each stage transition enforces explicit validation rules.',
    },
    {
      pegaConcept: 'Service Level Agreement (SLA)',
      cinewaveMapping: '`slaService.js` (Goal & Deadline Alerts)',
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      description:
        'Tracks elapsed time from `createdAt`. Flags "SLA Goal Missed" after 1 day (or 1 min in Fast Demo Mode) and "SLA Deadline Missed" after 2 days (or 2 mins in Fast Demo Mode) with color-coded dashboard indicators.',
    },
    {
      pegaConcept: 'Work Queue & Auto-Routing',
      cinewaveMapping: '`assignedQueue` (`PremiumShowQueue` / `StandardShowQueue`)',
      icon: Users,
      color: 'from-purple-500 to-indigo-600',
      description:
        'Automated decision rule on case creation: If `Show.showType === "Premium"`, routes to `PremiumShowQueue`; otherwise `StandardShowQueue`. Staff dashboard provides active queue filtering.',
    },
    {
      pegaConcept: 'Step Actions & Confirmation',
      cinewaveMapping: 'Explicit `confirmed = true` Customer Step',
      icon: Shield,
      color: 'from-blue-500 to-cyan-600',
      description:
        'Pega enforces step-level explicit actions. Case cannot advance to Approval stage until the customer confirms seat availability and calculated total cost via the confirmation step.',
    },
    {
      pegaConcept: 'Correspondence',
      cinewaveMapping: 'Nodemailer Email Service (`sendBookingResolvedEmail`)',
      icon: Mail,
      color: 'from-rose-500 to-pink-600',
      description:
        'Automated outbound communication triggered when case reaches "Resolved". Sends structured ticket confirmation email via Nodemailer (Ethereal test SMTP / console log preview).',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
              <Layers className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                Pega Architecture Mapping Guide
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                  Mentor Reference
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                How CineWave translates core Pega PRPC / Pega Infinity workflow patterns into Node.js + React.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MAPPINGS.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Pega Concept: <span className="text-cyan-400 font-bold">{item.pegaConcept}</span>
                    </span>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} text-white shadow-md`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {item.cinewaveMapping}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            CineWave &bull; Built with Express, SQLite, React & Tailwind CSS
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
