import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-xs font-semibold shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-8 fade-in ${
              toast.type === 'success'
                ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10'
                : toast.type === 'error'
                ? 'bg-slate-900/90 border-rose-500/40 text-rose-300 shadow-rose-500/10'
                : toast.type === 'warning'
                ? 'bg-slate-900/90 border-amber-500/40 text-amber-300 shadow-amber-500/10'
                : 'bg-slate-900/90 border-cyan-500/40 text-cyan-300 shadow-cyan-500/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return { addToast: (msg) => console.log('Toast:', msg) };
  }
  return context;
}
