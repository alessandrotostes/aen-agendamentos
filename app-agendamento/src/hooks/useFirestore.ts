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
  QueryConstraint,
} from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import { errorUtils } from "../lib/utils";

// Interface para as opções do hook
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

// Interface para o estado retornado pelo hook
interface FirestoreState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useFirestore<T extends { id: string }>(
  collectionName: string | null,
  options: UseFirestoreOptions = {}
): FirestoreState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    realtime = false,
    orderByField,
    orderDirection = "desc",
    whereConditions = [],
  } = options;

  useEffect(() => {
    // CORREÇÃO: A verificação agora permite que a busca prossiga se houver um nome de coleção,
    // mesmo que não haja filtros 'where', como é o caso dos serviços e profissionais.
    if (!collectionName) {
      setData([]);
      setLoading(false);
      return;
    }

    const buildQuery = (): Query<DocumentData> => {
      const q: Query<DocumentData> = collection(db, collectionName);

      const queryConstraints: QueryConstraint[] = whereConditions.map(
        ({ field, operator, value }) => where(field, operator, value)
      );

      if (orderByField) {
        queryConstraints.push(orderBy(orderByField, orderDirection));
      }

      return query(q, ...queryConstraints);
    };

    const q = buildQuery();
    setLoading(true);

    if (realtime) {
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
      return () => unsubscribe();
    } else {
      const fetchData = async () => {
        try {
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
      fetchData();
    }
  }, [
    collectionName,
    realtime,
    orderByField,
    orderDirection,
    JSON.stringify(whereConditions),
  ]);

  const refresh = async () => {};

  return { data, loading, error, refresh };
}

// ========== FIRESTORE OPERATIONS (SEM ALTERAÇÕES) ==========
export const firestoreOperations = {
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

  delete: async (collectionName: string, id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(`Erro ao deletar ${collectionName}:`, error);
      throw new Error(errorUtils.getFirebaseErrorMessage(error));
    }
  },

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
