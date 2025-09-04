//src/lib/utils.ts
import { Timestamp } from "firebase/firestore";

// ========== TAILWIND UTILITIES (sem dependências externas) ==========
export function cn(
  ...classes: (string | undefined | null | boolean)[]
): string {
  return classes.filter(Boolean).join(" ");
}

// ========== TIMESTAMP UTILITIES ==========
export const timestampUtils = {
  // Converter Timestamp do Firebase para Date
  toDate: (timestamp: Timestamp | null | undefined): Date | null => {
    if (!timestamp) return null;
    return timestamp.toDate();
  },

  // Converter Date para Timestamp do Firebase
  fromDate: (date: Date | null | undefined): Timestamp | null => {
    if (!date) return null;
    return Timestamp.fromDate(date);
  },

  // Converter para string formatada
  format: (
    timestamp: Timestamp | null | undefined,
    options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ): string => {
    const date = timestampUtils.toDate(timestamp);
    if (!date) return "";
    return date.toLocaleDateString("pt-BR", options);
  },

  // Verificar se é hoje
  isToday: (timestamp: Timestamp): boolean => {
    const date = timestamp.toDate();
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  },

  // Agora
  now: (): Timestamp => Timestamp.now(),
};

// ========== CURRENCY UTILITIES ==========
export const currencyUtils = {
  // Formatar valor para Real brasileiro
  format: (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  },

  // Converter centavos para reais
  fromCents: (cents: number): number => {
    return cents / 100;
  },

  // Converter reais para centavos (Stripe usa centavos)
  toCents: (reais: number): number => {
    return Math.round(reais * 100);
  },

  // Parse string para número
  parse: (value: string): number => {
    const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".");
    return parseFloat(cleaned) || 0;
  },
};

// ========== TIME UTILITIES ==========
export const timeUtils = {
  // Formatar duração em minutos para string legível
  formatDuration: (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  },

  // Adicionar minutos a uma data
  addMinutes: (date: Date, minutes: number): Date => {
    return new Date(date.getTime() + minutes * 60000);
  },

  // Verificar se horário está disponível (entre 8h e 18h)
  isBusinessHour: (date: Date): boolean => {
    const hour = date.getHours();
    return hour >= 8 && hour < 18;
  },
};

// ========== VALIDATION UTILITIES ==========
export const validationUtils = {
  // Validar email
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar telefone brasileiro
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  },

  // Formatar telefone
  formatPhone: (phone: string): string => {
    const numbers = phone.replace(/\D/g, "");
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
        7
      )}`;
    }
    if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(
        6
      )}`;
    }
    return phone;
  },

  // Validar preço
  isValidPrice: (price: number): boolean => {
    return price > 0 && price <= 10000;
  },

  // Validar duração de serviço
  isValidDuration: (duration: number): boolean => {
    return duration >= 15 && duration <= 480; // 15min a 8h
  },
};

// ========== STRING UTILITIES ==========
export const stringUtils = {
  // Capitalizar primeira letra
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Truncar string com ellipsis
  truncate: (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + "...";
  },

  // Gerar slug a partir de string
  generateSlug: (str: string): string => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
      .replace(/\s+/g, "-") // Substitui espaços por hífens
      .replace(/-+/g, "-") // Remove hífens duplicados
      .trim();
  },
};

// ========== ERROR HANDLING UTILITIES ==========
interface FirebaseError {
  code?: string;
  message?: string;
}

export const errorUtils = {
  // Extrair mensagem de erro Firebase
  getFirebaseErrorMessage: (
    error: FirebaseError | Error | string | unknown
  ): string => {
    if (typeof error === "string") return error;

    if (error && typeof error === "object" && "message" in error) {
      const firebaseError = error as FirebaseError;
      switch (firebaseError.code) {
        case "auth/user-not-found":
          return "Usuário não encontrado.";
        case "auth/wrong-password":
          return "Senha incorreta.";
        case "auth/email-already-in-use":
          return "Este email já está em uso.";
        case "auth/weak-password":
          return "Senha muito fraca.";
        case "auth/network-request-failed":
          return "Erro de conexão. Verifique sua internet.";
        case "permission-denied":
          return "Permissão negada.";
        case "unavailable":
          return "Serviço indisponível no momento.";
        default:
          return firebaseError.message || "Erro inesperado.";
      }
    }
    return "Erro inesperado. Tente novamente.";
  },
};

// ========== ARRAY UTILITIES ==========
export const arrayUtils = {
  // Remover item por ID
  removeById: <T extends { id: string }>(array: T[], id: string): T[] => {
    return array.filter((item) => item.id !== id);
  },

  // Atualizar item por ID
  updateById: <T extends { id: string }>(
    array: T[],
    id: string,
    updates: Partial<T>
  ): T[] => {
    return array.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
  },

  // Encontrar por ID
  findById: <T extends { id: string }>(
    array: T[],
    id: string
  ): T | undefined => {
    return array.find((item) => item.id === id);
  },

  // Ordenar por data (mais recente primeiro)
  sortByDate: <T extends { createdAt?: Timestamp }>(array: T[]): T[] => {
    return [...array].sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.seconds - a.createdAt.seconds;
    });
  },
};

// ========== STORAGE UTILITIES ==========
export const storageUtils = {
  // Gerar path para upload de imagem
  generateImagePath: (
    userId: string,
    type: "avatar" | "establishment" | "service",
    filename: string
  ): string => {
    const timestamp = Date.now();
    const extension = filename.split(".").pop() || "jpg";
    return `${type}s/${userId}/${timestamp}.${extension}`;
  },

  // Verificar se arquivo é imagem válida
  isValidImageFile: (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024; // 5MB
  },
};
