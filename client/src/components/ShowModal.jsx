import React, { useState, useEffect } from 'react';
import { X, Calendar, Save } from 'lucide-react';

export default function ShowModal({ show, movies, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    movieId: '',
    theatre: '',
    location: '',
    dateTime: '',
    totalSeats: 60,
    pricePerSeat: 15.00,
  });

  useEffect(() => {
    if (show) {
      setFormData({
        movieId: show.movieId || (movies.length > 0 ? movies[0].id : ''),
        theatre: show.theatre || '',
        location: show.location || '',
        dateTime: show.dateTime ? new Date(show.dateTime).toISOString().slice(0, 16) : '',
        totalSeats: show.totalSeats || 60,
        pricePerSeat: show.pricePerSeat || 15.00,
      });
    } else {
      setFormData({
        movieId: movies.length > 0 ? movies[0].id : '',
        theatre: '',
        location: '',
        dateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        totalSeats: 60,
        pricePerSeat: 15.00,
      });
    }
  }, [show, movies, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      dateTime: new Date(formData.dateTime).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">
              {show ? 'Edit Show Schedule' : 'Schedule New Show'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Select Movie *</label>
            <select
              required
              value={formData.movieId}
              onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.showType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Theatre Name *</label>
            <input
              type="text"
              required
              value={formData.theatre}
              onChange={(e) => setFormData({ ...formData, theatre: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              placeholder="e.g. CineWave Dolby Cinema 1"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Location / Screen *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              placeholder="Downtown Hub, Screen 2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={formData.dateTime}
              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Total Capacity *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.totalSeats}
                onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Price Per Seat ($) *</label>
              <input
                type="number"
                step="0.5"
                required
                min="1"
                value={formData.pricePerSeat}
                onChange={(e) => setFormData({ ...formData, pricePerSeat: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save Show
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
