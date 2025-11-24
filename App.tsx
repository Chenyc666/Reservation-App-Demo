import React, { useState } from 'react';
import { CustomerBooking } from './components/CustomerBooking';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from './components/ui/Button';

type View = 'home' | 'booking' | 'admin';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');

  if (currentView === 'booking') {
    return <CustomerBooking onBack={() => setCurrentView('home')} />;
  }

  if (currentView === 'admin') {
    return (
      <div>
        <div className="fixed bottom-4 right-4 z-50">
             <Button variant="secondary" onClick={() => setCurrentView('home')} className="shadow-lg border-primary text-primary">Back to Home</Button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // Home / Landing Page
  return (
    <div className="min-h-screen bg-surface flex flex-col relative">
      {/* Navigation */}
      <nav className="w-full p-6 flex justify-between items-center bg-white shadow-sm">
        <div className="text-2xl font-bold text-primary tracking-tight">Tar Heel Booking.</div>
        <button 
            onClick={() => setCurrentView('admin')}
            className="text-sm font-medium text-secondary hover:text-primary transition-colors"
        >
            Merchant Login
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
        <div className="bg-white p-10 rounded-2xl shadow-xl border-t-8 border-primary w-full">
            <h1 className="text-4xl md:text-6xl font-bold text-secondary mb-6 tracking-tight">
                Simple. Fast. <span className="text-primary">Yours.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto leading-relaxed">
                The easiest way to schedule your next appointment. 
                Whether it's a spa day, a manicure, or a massage, we've got a spot for you.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                    onClick={() => setCurrentView('booking')} 
                    className="px-10 py-4 text-lg rounded-full shadow-lg shadow-blue-200 transform hover:-translate-y-1 transition-all"
                >
                    Book Now
                </Button>
            </div>
        </div>

        {/* Simple Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left w-full">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-50">
                <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-primary mb-4 font-bold text-xl">1</div>
                <h3 className="font-bold text-secondary mb-2">Select Service</h3>
                <p className="text-sm text-gray-500">Choose from our wide range of professional services.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-50">
                <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-primary mb-4 font-bold text-xl">2</div>
                <h3 className="font-bold text-secondary mb-2">Pick a Time</h3>
                <p className="text-sm text-gray-500">Real-time availability checking to fit your schedule.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-50">
                <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-primary mb-4 font-bold text-xl">3</div>
                <h3 className="font-bold text-secondary mb-2">Confirm</h3>
                <p className="text-sm text-gray-500">Instant confirmation. No phone calls needed.</p>
            </div>
        </div>
      </div>
      
      <footer className="p-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Appointment Scheduler.
      </footer>
    </div>
  );
};

export default App;