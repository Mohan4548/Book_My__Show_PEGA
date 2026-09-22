import React, { useState } from 'react';
import Navbar from './components/Navbar';
import PegaMappingModal from './components/PegaMappingModal';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import ShowsPage from './pages/ShowsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import VerifyTicketPage from './pages/VerifyTicketPage';
import StaffDashboard from './pages/StaffDashboard';
import AdminCatalog from './pages/AdminCatalog';
import CaseTracker from './pages/CaseTracker';
import CustomerPortal from './pages/CustomerPortal';
import AnalyticsPage from './pages/AnalyticsPage';
import { ToastProvider } from './components/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [trackerCaseId, setTrackerCaseId] = useState('CW-1001');
  const [pegaGuideOpen, setPegaGuideOpen] = useState(false);

  const handleNavigateTracker = (caseId) => {
    setTrackerCaseId(caseId);
    setActiveTab('tracker');
  };

  const handleBookingCompleted = (completedCase) => {
    if (completedCase && completedCase.id) {
      setTrackerCaseId(completedCase.id);
      setActiveTab('bookings');
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
        {/* Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenPegaGuide={() => setPegaGuideOpen(true)}
        />

        {/* Main Page View Content with Smooth Fade+Slide Page Transition (Rule #1) */}
        <main className="flex-1 pb-16 key={activeTab} page-transition">
          {activeTab === 'home' && (
            <HomePage
              onSelectMovie={() => setActiveTab('shows')}
              onSelectShow={() => setActiveTab('shows')}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'movies' && (
            <MoviesPage onSelectMovie={() => setActiveTab('shows')} />
          )}

          {activeTab === 'shows' && (
            <ShowsPage
              onBookingSuccess={handleBookingCompleted}
            />
          )}

          {activeTab === 'bookings' && (
            <MyBookingsPage onNavigateTracker={handleNavigateTracker} />
          )}

          {activeTab === 'verify' && (
            <VerifyTicketPage />
          )}

          {activeTab === 'book' && (
            <CustomerPortal
              onNavigateTracker={handleNavigateTracker}
            />
          )}

          {activeTab === 'tracker' && (
            <CaseTracker initialCaseId={trackerCaseId} />
          )}

          {activeTab === 'staff' && (
            <StaffDashboard onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'admin' && (
            <AdminCatalog />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage />
          )}
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-slate-900 bg-slate-950 text-slate-500 text-xs text-center">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <strong className="text-slate-300">Movexa ⭐ Pega Case Management System</strong> &bull; Modern Tech Platform
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPegaGuideOpen(true)}
                className="text-cyan-400 hover:underline font-semibold btn-interact"
              >
                Pega Mapping Architecture Guide
              </button>
              <span>Express + SQLite + React</span>
            </div>
          </div>
        </footer>

        {/* Mentor Reference Pega Mapping Modal */}
        <PegaMappingModal
          isOpen={pegaGuideOpen}
          onClose={() => setPegaGuideOpen(false)}
        />
      </div>
    </ToastProvider>
  );
}
