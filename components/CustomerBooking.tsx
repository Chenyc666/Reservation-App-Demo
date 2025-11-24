import React, { useState, useEffect } from 'react';
import { Service, Appointment, TimeSlot, BusinessSettings, AppointmentStatus } from '../types';
import { StorageService } from '../services/storage';
import { Button } from './ui/Button';

interface CustomerBookingProps {
  onBack: () => void;
}

export const CustomerBooking: React.FC<CustomerBookingProps> = ({ onBack }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(StorageService.getSettings());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Select Service, 2: Select Time, 3: Details & Confirm
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setServices(StorageService.getServices());
    setSettings(StorageService.getSettings());
  }, []);

  // Generate slots when date or service changes
  useEffect(() => {
    if (selectedService && selectedDate) {
      generateTimeSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService, selectedDate]);

  const generateTimeSlots = () => {
    const allAppointments = StorageService.getAppointments();
    const dayAppointments = allAppointments.filter(a => 
      a.date === selectedDate && 
      a.status !== AppointmentStatus.CANCELLED
    );

    const slots: TimeSlot[] = [];
    const [openHour, openMin] = settings.openTime.split(':').map(Number);
    const [closeHour, closeMin] = settings.closeTime.split(':').map(Number);

    let current = new Date(`2000-01-01T${settings.openTime}:00`);
    const end = new Date(`2000-01-01T${settings.closeTime}:00`);

    // Helper to format HH:mm
    const formatTime = (date: Date) => date.toTimeString().slice(0, 5);

    while (current < end) {
      const timeString = formatTime(current);
      
      const isTaken = dayAppointments.some(appt => {
        return appt.time === timeString; 
      });

      slots.push({
        time: timeString,
        available: !isTaken
      });

      // Increment by 30 mins
      current.setMinutes(current.getMinutes() + 30);
    }
    setAvailableSlots(slots);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedTime) return;

    setIsSubmitting(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      customerName: name,
      customerPhone: phone,
      date: selectedDate,
      time: selectedTime,
      status: AppointmentStatus.PENDING,
      notes,
      createdAt: Date.now()
    };

    StorageService.addAppointment(newAppointment);
    setSuccess(true);
    setIsSubmitting(false);
  };

  const resetFlow = () => {
    setSelectedService(null);
    setSelectedTime(null);
    setStep(1);
    setSuccess(false);
    setName('');
    setPhone('');
    setNotes('');
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border-t-8 border-primary">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-secondary mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-8">
                Your appointment for <strong>{selectedService?.name}</strong> is set for <br/>
                <span className="text-primary font-bold">{selectedDate}</span> at <span className="text-primary font-bold">{selectedTime}</span>.
            </p>
            <Button onClick={resetFlow} className="w-full">Book Another Service</Button>
            <Button variant="ghost" onClick={onBack} className="w-full mt-2">Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={onBack} className="mr-4 text-gray-500 hover:text-secondary">← Back</Button>
            <h1 className="text-3xl font-bold text-secondary">Book an Appointment</h1>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center w-full max-w-lg">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`flex-1 h-1 mx-2 rounded ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <div className={`flex-1 h-1 mx-2 rounded ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
          </div>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div 
                key={service.id}
                onClick={() => { setSelectedService(service); setStep(2); }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col md:flex-row gap-4"
              >
                <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-secondary">{service.name}</h3>
                    <span className="font-bold text-primary text-lg">${service.price}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{service.type}</span>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{service.description}</p>
                  <div className="mt-3 text-sm text-gray-400 flex items-center">
                    <span className="bg-blue-50 text-primary px-2 py-1 rounded text-xs font-semibold">{service.durationMinutes} mins</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && selectedService && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-secondary text-center">Select Date & Time</h2>
            <p className="text-center text-gray-500 mb-8">For <span className="font-bold text-primary">{selectedService.name}</span> (${selectedService.price})</p>
            
            <div className="mb-8 max-w-xs mx-auto">
              <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
              <input 
                type="date" 
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3 text-center">Available Time Slots</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-2 px-1 text-sm font-medium rounded-lg border transition-all ${
                      !slot.available 
                        ? 'bg-gray-50 text-gray-300 border-transparent cursor-not-allowed'
                        : selectedTime === slot.time
                          ? 'bg-primary text-white border-primary shadow-md transform scale-105'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
              {availableSlots.every(s => !s.available) && (
                <p className="text-red-500 text-sm mt-4 text-center">Sorry, fully booked for this day.</p>
              )}
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button disabled={!selectedTime} onClick={() => setStep(3)} className="px-8">Next Step</Button>
            </div>
          </div>
        )}

        {step === 3 && selectedService && selectedTime && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-primary max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-secondary">Final Details</h2>
            
            <div className="bg-surface p-5 rounded-xl mb-8 flex justify-between items-center border border-blue-50">
               <div>
                 <p className="font-bold text-secondary text-lg">{selectedService.name}</p>
                 <p className="text-sm text-gray-500 mt-1">{selectedDate} @ {selectedTime}</p>
                 <p className="text-xs text-gray-400 mt-1">{selectedService.durationMinutes} mins</p>
               </div>
               <p className="font-bold text-primary text-2xl">${selectedService.price}</p>
            </div>

            <form onSubmit={handleBooking} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                <input 
                  required
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="(555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Special Requests (Optional)</label>
                <textarea 
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Allergies, preferences, etc."
                />
              </div>

              <div className="flex justify-between mt-8 pt-6">
                <Button type="button" variant="secondary" onClick={() => setStep(2)}>Back</Button>
                <Button type="submit" isLoading={isSubmitting} className="px-8 shadow-lg shadow-blue-100">Confirm Booking</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};