import { Service, Appointment, BusinessSettings } from '../types';
import { INITIAL_SERVICES, INITIAL_SETTINGS } from '../constants';

const KEYS = {
  SERVICES: 'luxebook_services',
  APPOINTMENTS: 'luxebook_appointments',
  SETTINGS: 'luxebook_settings'
};

export const StorageService = {
  getServices: (): Service[] => {
    const data = localStorage.getItem(KEYS.SERVICES);
    return data ? JSON.parse(data) : INITIAL_SERVICES;
  },

  saveServices: (services: Service[]) => {
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
  },

  getAppointments: (): Appointment[] => {
    const data = localStorage.getItem(KEYS.APPOINTMENTS);
    return data ? JSON.parse(data) : [];
  },

  saveAppointments: (appointments: Appointment[]) => {
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));
  },

  addAppointment: (appointment: Appointment) => {
    const current = StorageService.getAppointments();
    const updated = [appointment, ...current];
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(updated));
  },

  updateAppointment: (updatedAppt: Appointment) => {
    const current = StorageService.getAppointments();
    const updated = current.map(a => a.id === updatedAppt.id ? updatedAppt : a);
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(updated));
  },

  deleteAppointment: (id: string) => {
    const current = StorageService.getAppointments();
    const updated = current.filter(a => a.id !== id);
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(updated));
  },

  getSettings: (): BusinessSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : INITIAL_SETTINGS;
  },

  saveSettings: (settings: BusinessSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }
};