"use client";

import { useState, useEffect } from "react";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  Query,
  DocumentData,
} from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import { errorUtils } from "../lib/utils";

// ========== BASE FIRESTORE HOOK ==========
interface UseFirestoreOptions {
  realtime?: boolean;
  orderByField?: string;
  orderDirection?: "asc" | "desc";
  whereConditions?: Array<{
    field: string;
    operator:
      | "=="
      | "!="
      | "<"
      | "<="
      | ">"
      | ">="
      | "array-contains"
      | "in"
      | "array-contains-any";
    value: unknown;
  }>;
}

interface FirestoreState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useFirestore<T extends { id: string }>(
  collectionName: string | null, // MODIFICADO: Aceita null
  options: UseFirestoreOptions = {}
): FirestoreState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    realtime = false,
    orderByField = "createdAt",
    orderDirection = "desc",
    whereConditions = [],
  } = options;

  const buildQuery = (): Query<DocumentData> | null => {
    // MODIFICADO: Retorna null se não houver nome da coleção
    if (!collectionName) return null;

    let q: Query<DocumentData> = collection(db, collectionName);
    whereConditions.forEach(({ field, operator, value }) => {
      q = query(q, where(field, operator, value));
    });
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }
    return q;
  };

  const fetchData = async () => {
    const q = buildQuery();
    if (!q) {
      setData([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const snapshot = await getDocs(q);
      const results: T[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      setData(results);
    } catch (err) {
      console.error(`Erro ao buscar ${collectionName}:`, err);
      setError(errorUtils.getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchData();
  };

  useEffect(() => {
    // MODIFICADO: Verifica se o nome da coleção é válido antes de prosseguir
    if (!collectionName) {
      setData([]);
      setLoading(false);
      return;
    }

    if (realtime) {
      const q = buildQuery();
      if (!q) return;

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const results: T[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          setData(results);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`Erro no listener de ${collectionName}:`, err);
          setError(errorUtils.getFirebaseErrorMessage(err));
          setLoading(false);
        }
      );
      return unsubscribe;
    } else {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]); // Simplificado para re-rodar apenas quando o caminho muda

  return { data, loading, error, refresh };
}

// ========== FIRESTORE OPERATIONS ==========
export const firestoreOperations = {
  // Criar documento
  create: async <T>(
    collectionName: string,
    data: Omit<T, "id">
  ): Promise<string> => {
    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, collectionName), docData);
      return docRef.id;
    } catch (error) {
      console.error(`Erro ao criar ${collectionName}:`, error);
      throw new Error(errorUtils.getFirebaseErrorMessage(error));
    }
  },

  // Atualizar documento
  update: async <T>(
    collectionName: string,
    id: string,
    data: Partial<T>
  ): Promise<void> => {
    try {
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(doc(db, collectionName, id), updateData);
    } catch (error) {
      console.error(`Erro ao atualizar ${collectionName}:`, error);
      throw new Error(errorUtils.getFirebaseErrorMessage(error));
    }
  },

  // Deletar documento
  delete: async (collectionName: string, id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(`Erro ao deletar ${collectionName}:`, error);
      throw new Error(errorUtils.getFirebaseErrorMessage(error));
    }
  },

  // Buscar documento por ID
  getById: async <T extends { id: string }>(
    collectionName: string,
    id: string
  ): Promise<T | null> => {
    try {
      const docSnap = await getDoc(doc(db, collectionName, id));
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as T;
      }
      return null;
    } catch (error) {
      console.error(`Erro ao buscar ${collectionName} por ID:`, error);
      throw new Error(errorUtils.getFirebaseErrorMessage(error));
    }
  },
};
