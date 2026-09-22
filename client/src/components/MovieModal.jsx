import React, { useState, useEffect } from 'react';
import { X, Film, Plus, Save } from 'lucide-react';

export default function MovieModal({ movie, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    durationMinutes: 120,
    showType: 'Standard',
    description: '',
    posterUrl: '',
  });

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || '',
        genre: movie.genre || '',
        durationMinutes: movie.durationMinutes || 120,
        showType: movie.showType || 'Standard',
        description: movie.description || '',
        posterUrl: movie.posterUrl || '',
      });
    } else {
      setFormData({
        title: '',
        genre: '',
        durationMinutes: 120,
        showType: 'Standard',
        description: '',
        posterUrl: '',
      });
    }
  }, [movie, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Film className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">
              {movie ? 'Edit Movie' : 'Add New Movie'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Movie Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              placeholder="e.g. Inception 15th Anniversary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Genre *</label>
              <input
                type="text"
                required
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="Sci-Fi / Action"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Duration (mins) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Show Type (Pega Queue Classifier) *</label>
            <select
              value={formData.showType}
              onChange={(e) => setFormData({ ...formData, showType: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="Standard">Standard (Routes to StandardShowQueue)</option>
              <option value="Premium">Premium (Routes to PremiumShowQueue)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Poster Image URL</label>
            <input
              type="url"
              value={formData.posterUrl}
              onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
              placeholder="Brief synopsis..."
            />
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
              Save Movie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
