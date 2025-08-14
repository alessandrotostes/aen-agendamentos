import { Timestamp } from "firebase/firestore";

// USER & AUTH
export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  role: "owner" | "client";
  createdAt: Date | null;
}

// ESTABLISHMENT & RELATED
export interface Establishment {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  imageURL?: string;
  mainService?: string;
  rating?: number;
  stripeAccountId?: string;
  stripeAccountOnboarded?: boolean;
  availability?: Availability; // <-- ADICIONE ESTA LINHA
}

export interface Service {
  id: string;
  establishmentId: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // em minutos
}

export interface Professional {
  id: string;
  establishmentId: string;
  name: string;
  photoURL?: string;
  bio?: string;
  specialties?: string[];
  serviceIds: string[];
  availability?: Availability;
}

// APPOINTMENT
export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  establishmentId: string;
  serviceId: string;
  professionalId: string;
  dateTime: Timestamp;
  duration: number;
  price: number;
  status: "confirmado" | "cancelado";
  serviceName: string;
  professionalName: string;
}

// FORM & API DATA TYPES
export interface CreateServiceData {
  name: string;
  description: string;
  price: number;
  duration: number;
}

export interface CreateProfessionalData {
  name: string;
  photoURL: string;
  bio: string;
  serviceIds: string[];
  imageFile?: File | null;
}

export interface UpdateEstablishmentData {
  name: string;
  description: string;
  address: string;
  phone: string;
  imageURL: string;
  mainService: string;
  imageFile?: File | null;
  availability?: Availability;
}

export interface PendingAppointment {
  establishmentId: string;
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  professionalId: string;
  professionalName: string;
  bookingTimestamp: string;
}

export interface AvailabilityData {
  establishmentId: string;
  weeklySchedule: WeeklyDay[];
  specialDays?: SpecialDay[];
  autoAcceptBookings: boolean;
  advanceBookingDays: number;
  minimumNoticeHours: number;
}

// CLOUD FUNCTIONS TYPES (Estava faltando)
export interface CreateConnectedAccountResult {
  success: boolean;
  accountId: string;
}

export interface CreateAccountLinkResult {
  success: boolean;
  url: string;
}

export interface CreatePaymentIntentData {
  amount: number;
  paymentMethodId: string;
  appointmentDetails: PendingAppointment;
}

// OUTROS TIPOS
export interface Availability {
  [key: string]: { start: string; end: string } | null;
}
export interface TimeSlot {
  start: string;
  end: string;
}
export interface WeeklyDay {
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  timeSlots: TimeSlot[];
}
export interface SpecialDay {
  date: string;
  isOpen: boolean;
  timeSlots?: TimeSlot[];
  reason?: string;
}
export interface Salon {
  id: string;
  name: string;
  address: string;
  imageURL: string;
  rating: number;
}
