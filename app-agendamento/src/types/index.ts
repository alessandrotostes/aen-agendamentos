// Arquivo: src/types/index.ts
import { Timestamp } from "firebase/firestore";

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}
export interface Availability {
  [key: string]: { start: string; end: string } | null;
}
export interface Professional {
  id: string;
  name: string;
  serviceIds: string[];
  photoURL?: string;
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

export interface Appointment {
  id: string;
  dateTime: Timestamp;
  duration: number;
  price: number;
  status: "confirmado" | "cancelado" | "concluido";
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  clientId: string;
  clientName: string;
  establishmentId: string;
}

// A interface vazia foi removida daqui.
