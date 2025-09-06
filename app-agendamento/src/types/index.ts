//src/types/index.ts
import { Timestamp } from "firebase/firestore";

// USER & AUTH
export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  role: "owner" | "client" | "professional";
  createdAt: Date | null;
}

// ESTABLISHMENT & RELATED

// Define a estrutura para um único intervalo de tempo
type TimeSlotType = {
  start: string;
  end: string;
};

// --- TIPO CORRIGIDO ---
// Define a estrutura para o objeto completo de horários de funcionamento
export type OperatingHours = {
  [key: string]: TimeSlotType | null | undefined; // <-- Adicionamos '| undefined' aqui para alinhar com as props opcionais
  segunda?: TimeSlotType | null;
  terca?: TimeSlotType | null;
  quarta?: TimeSlotType | null;
  quinta?: TimeSlotType | null;
  sexta?: TimeSlotType | null;
  sabado?: TimeSlotType | null;
  domingo?: TimeSlotType | null;
};

export interface Establishment {
  id: string;
  slug: string;
  ownerId: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  imageURL?: string;
  mainService?: string;
  rating?: number;
  mpCredentials?: MpCredentials;
  availability?: Availability;
  operatingHours?: OperatingHours;
}

export interface MpCredentials {
  mp_user_id: number;
  mp_access_token: string;
  mp_refresh_token: string;
  mp_public_key: string;
  mp_connected_at: Timestamp;
}

export interface Service {
  id: string;
  establishmentId: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // em minutos
  category?: string;
}

export interface Professional {
  id: string;
  establishmentId: string;
  name: string;
  email?: string;
  authUid?: string;
  phone?: string;
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
  cancelledBy?: "owner" | "client";
  serviceName: string;
  professionalName: string;
  cancellationRequest?: CancellationRequest;
}

export interface CancellationRequest {
  requestedBy: "client" | "owner";
  timestamp: Timestamp;
  acceptedPartialRefund: boolean;
}

// FORM & API DATA TYPES
export interface CreateServiceData {
  name: string;
  description: string;
  price: number;
  duration: number;
  category?: string;
}

export interface CreateProfessionalData {
  name: string;
  email: string;
  phone: string;
  serviceIds: string[];
  photoURL?: string;
  availability?: Availability;
  imageFile?: File | null;
  bio?: string; //
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
  operatingHours?: OperatingHours;
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

// CLOUD FUNCTIONS TYPES
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
  slug: string;
  name: string;
  address: string;
  imageURL?: string;
  phone?: string;
  rating?: number;
  favoritesCount?: number;
}
