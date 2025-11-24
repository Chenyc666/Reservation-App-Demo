import { Service, ServiceType, BusinessSettings } from './types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Luxury Swedish Massage',
    description: 'A relaxing full-body massage using gentle strokes to improve circulation and relieve tension.',
    durationMinutes: 60,
    price: 85,
    type: ServiceType.MASSAGE,
    imageUrl: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: '2',
    name: 'Gel Manicure Deluxe',
    description: 'Premium gel polish application with cuticle care, hand massage, and exfoliation.',
    durationMinutes: 45,
    price: 50,
    type: ServiceType.NAILS,
    imageUrl: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: '3',
    name: 'Deep Cleansing Facial',
    description: 'Rejuvenating facial treatment that cleanses pores, exfoliates dead skin cells, and treats common skin concerns.',
    durationMinutes: 75,
    price: 120,
    type: ServiceType.SPA,
    imageUrl: 'https://picsum.photos/400/300?random=3'
  },
  {
    id: '4',
    name: 'Omakase Dinner',
    description: 'Chef\'s choice seasonal tasting menu featuring the finest ingredients available today.',
    durationMinutes: 120,
    price: 150,
    type: ServiceType.RESTAURANT,
    imageUrl: 'https://picsum.photos/400/300?random=4'
  }
];

export const INITIAL_SETTINGS: BusinessSettings = {
  name: "LuxeBook Sanctuary",
  openTime: "09:00",
  closeTime: "20:00"
};

export const MOCK_APPOINTMENTS = []; // Start empty or pre-fill if needed