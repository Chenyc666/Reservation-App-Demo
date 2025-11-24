import React, { useState, useEffect } from 'react';
import { Appointment, Service, BusinessSettings, AppointmentStatus, ServiceType } from '../types';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/gemini';
import { Button } from './ui/Button';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'settings'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(StorageService.getSettings());
  const [aiInsight, setAiInsight] = useState('');

  // Service Form State
  const [isEditingService, setIsEditingService] = useState(false);
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({ type: ServiceType.SPA });
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = () => {
    const apps = StorageService.getAppointments();
    const srvs = StorageService.getServices();
    setAppointments(apps);
    setServices(srvs);
    setSettings(StorageService.getSettings());

    if (apps.length > 0) {
        const revenue = apps
            .filter(a => a.status === AppointmentStatus.CONFIRMED)
            .reduce((acc, curr) => {
                const s = srvs.find(s => s.id === curr.serviceId);
                return acc + (s?.price || 0);
            }, 0);
        
        GeminiService.analyzeAppointmentTrend(apps.length, revenue).then(setAiInsight);
    }
  };

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    const appt = appointments.find(a => a.id === id);
    if (appt) {
      const updated = { ...appt, status };
      StorageService.updateAppointment(updated);
      loadData();
    }
  };

  const handleDeleteAppointment = (id: string) => {
    if (window.confirm('Delete this appointment?')) {
      StorageService.deleteAppointment(id);
      loadData();
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(settings);
    alert('Settings Saved!');
  };

  const generateDescription = async () => {
    if (!serviceForm.name || !serviceForm.type) return alert('Enter name and type first');
    setIsGeneratingAi(true);
    const desc = await GeminiService.generateServiceDescription(serviceForm.name, serviceForm.type);
    setServiceForm(prev => ({ ...prev, description: desc }));
    setIsGeneratingAi(false);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.price) return;
    
    const newServices = [...services];
    if (serviceForm.id) {
        const index = newServices.findIndex(s => s.id === serviceForm.id);
        if (index > -1) newServices[index] = serviceForm as Service;
    } else {
        newServices.push({
            ...serviceForm,
            id: Date.now().toString(),
            imageUrl: `https://picsum.photos/400/300?random=${Date.now()}`
        } as Service);
    }
    StorageService.saveServices(newServices);
    setServices(newServices);
    setIsEditingService(false);
    setServiceForm({ type: ServiceType.SPA });
  };

  const handleDeleteService = (id: string) => {
      if (window.confirm("Delete this service?")) {
          const updated = services.filter(s => s.id !== id);
          StorageService.saveServices(updated);
          setServices(updated);
      }
  }

  return (
    <div className="bg-surface min-h-screen pb-10">
      <header className="bg-secondary text-white p-6 shadow-md border-b-4 border-primary">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold tracking-wide">Admin Portal</h1>
            <div className="text-sm font-medium bg-primary/20 px-3 py-1 rounded">{settings.name}</div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        
        {aiInsight && (
            <div className="mb-8 p-4 bg-white border-l-4 border-primary shadow-sm rounded-r-lg flex items-start space-x-3">
                 <span className="text-2xl">💡</span>
                 <div>
                     <p className="text-sm font-bold text-secondary uppercase tracking-wider mb-1">Business Insight</p>
                     <p className="text-gray-600 italic">"{aiInsight}"</p>
                 </div>
            </div>
        )}

        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm w-fit mb-8">
          {['appointments', 'services', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-md text-sm font-medium capitalize transition-all duration-200 ${
                activeTab === tab 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-gray-500 hover:text-secondary hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary text-white text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Date / Time</th>
                    <th className="p-4 font-semibold">Customer</th>
                    <th className="p-4 font-semibold">Service</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-gray-400">No appointments scheduled yet.</td></tr>
                  ) : appointments.sort((a,b) => b.createdAt - a.createdAt).map(appt => (
                    <tr key={appt.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4 text-gray-800">
                        <div className="font-bold">{appt.date}</div>
                        <div className="text-sm text-primary font-medium">{appt.time}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{appt.customerName}</div>
                        <div className="text-xs text-gray-400">{appt.customerPhone}</div>
                      </td>
                      <td className="p-4 text-gray-700">{appt.serviceName}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border ${
                          appt.status === AppointmentStatus.CONFIRMED ? 'bg-green-50 text-green-700 border-green-200' :
                          appt.status === AppointmentStatus.CANCELLED ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {appt.status === AppointmentStatus.PENDING && (
                           <Button onClick={() => handleStatusChange(appt.id, AppointmentStatus.CONFIRMED)} variant="primary" className="text-xs px-3 py-1">Approve</Button>
                        )}
                        <Button onClick={() => handleDeleteAppointment(appt.id)} variant="ghost" className="text-xs px-3 py-1 text-red-500 hover:bg-red-50 hover:text-red-600">Cancel</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-secondary">Service Menu</h2>
              <Button onClick={() => { setServiceForm({ type: ServiceType.SPA }); setIsEditingService(true); }}>+ Add Service</Button>
            </div>

            {isEditingService && (
                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-primary/20 mb-8 animate-fade-in">
                    <h3 className="font-bold text-lg mb-4 text-primary">{serviceForm.id ? 'Edit' : 'Create New'} Service</h3>
                    <form onSubmit={handleSaveService} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Service Name</label>
                            <input required className="w-full border-gray-200 border rounded p-2 focus:ring-2 focus:ring-primary outline-none" value={serviceForm.name || ''} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Category</label>
                            <select className="w-full border-gray-200 border rounded p-2 focus:ring-2 focus:ring-primary outline-none" value={serviceForm.type} onChange={e => setServiceForm({...serviceForm, type: e.target.value as ServiceType})}>
                                {Object.values(ServiceType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Price ($)</label>
                            <input required type="number" className="w-full border-gray-200 border rounded p-2 focus:ring-2 focus:ring-primary outline-none" value={serviceForm.price || ''} onChange={e => setServiceForm({...serviceForm, price: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Duration (Min)</label>
                            <input required type="number" className="w-full border-gray-200 border rounded p-2 focus:ring-2 focus:ring-primary outline-none" value={serviceForm.durationMinutes || ''} onChange={e => setServiceForm({...serviceForm, durationMinutes: parseInt(e.target.value)})} />
                        </div>
                        <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs uppercase font-bold text-gray-400">Description</label>
                                <button type="button" onClick={generateDescription} className="text-xs text-primary font-bold hover:underline flex items-center">
                                    <span className="mr-1">✨</span> Auto-Write with AI
                                </button>
                            </div>
                            <textarea required className="w-full border-gray-200 border rounded p-2 focus:ring-2 focus:ring-primary outline-none" rows={2} value={serviceForm.description || ''} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} placeholder={isGeneratingAi ? "AI is thinking..." : "Enter description..."} disabled={isGeneratingAi}/>
                        </div>
                        <div className="md:col-span-2 flex justify-end space-x-2 mt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsEditingService(false)}>Cancel</Button>
                            <Button type="submit">Save Service</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <div key={service.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:border-primary/50 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-secondary">{service.name}</h3>
                                <span className="bg-surface text-primary text-xs font-bold px-2 py-1 rounded uppercase">{service.type}</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{service.description}</p>
                            <div className="text-sm font-bold text-gray-800 mb-4 bg-gray-50 inline-block px-3 py-1 rounded-full">${service.price} • {service.durationMinutes} min</div>
                        </div>
                        <div className="flex space-x-2 pt-4 border-t border-gray-50">
                            <Button variant="secondary" className="flex-1 text-sm py-1" onClick={() => { setServiceForm(service); setIsEditingService(true); }}>Edit</Button>
                            <Button variant="ghost" className="text-red-500 text-sm py-1 hover:bg-red-50" onClick={() => handleDeleteService(service.id)}>Remove</Button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md border-t-4 border-primary">
             <h2 className="text-xl font-bold text-secondary mb-6 text-center">Business Hours</h2>
             <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Business Name</label>
                    <input type="text" value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Open</label>
                        <input type="time" value={settings.openTime} onChange={e => setSettings({...settings, openTime: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Close</label>
                        <input type="time" value={settings.closeTime} onChange={e => setSettings({...settings, closeTime: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                </div>
                <div className="pt-4">
                    <Button type="submit" className="w-full">Update Settings</Button>
                </div>
             </form>
          </div>
        )}

      </main>
    </div>
  );
};