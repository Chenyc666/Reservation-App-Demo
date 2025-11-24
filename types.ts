export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export enum ServiceType {
  SPA = 'SPA',
  NAILS = 'NAILS',
  MASSAGE = 'MASSAGE',
  RESTAURANT = 'RESTAURANT',
  OTHER = 'OTHER'
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  type: ServiceType;
  imageUrl?: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  date: string; // ISO Date String YYYY-MM-DD
  time: string; // HH:mm format
  status: AppointmentStatus;
  notes?: string;
  createdAt: number;
}

export interface BusinessSettings {
  name: string;
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
}

export interface TimeSlot {
  time: string;
  available: boolean;
}