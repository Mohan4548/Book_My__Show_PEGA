import React from 'react';
import { Film, Home, Clapperboard, Calendar, Ticket, ShieldCheck, User, BookOpen, QrCode, Sparkles, Star } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenPegaGuide }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'movies', label: 'Movies', icon: Clapperboard },
    { id: 'shows', label: 'Shows', icon: Calendar },
    { id: 'bookings', label: 'My Bookings', icon: Ticket },
    { id: 'verify', label: 'Verify Ticket', icon: QrCode },
    { id: 'staff', label: 'Staff Portal', icon: ShieldCheck, badge: 'Pega Portal' },
  ];

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo: Movexa ⭐ */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform relative">
              <Film className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              <Star className="w-3 h-3 text-amber-300 fill-amber-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent tracking-tight">
                  Movexa
                </span>
                <span className="text-amber-400 font-black text-sm">⭐</span>
              </div>
              <span className="text-[10px] block font-mono text-slate-400 uppercase tracking-widest -mt-1">
                Pega Case Engine
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold ${
                        isActive
                          ? 'bg-slate-950 text-cyan-400'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenPegaGuide}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all hover:border-cyan-500 shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Pega Guide</span>
            </button>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs" title="Customer Profile">
                <User className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-800/60 overflow-x-auto">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-bold ${
                  isActive ? 'text-cyan-400' : 'text-slate-400'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
