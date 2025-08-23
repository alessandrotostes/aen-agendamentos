"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebaseConfig";
import {
  Establishment,
  CreateServiceData,
  CreateProfessionalData,
  Service,
  Professional,
  UpdateEstablishmentData,
} from "../types";
import { useAuth } from "../contexts/AuthContext";
import { firestoreOperations, useFirestore } from "./useFirestore";
import { errorUtils } from "../lib/utils";

// ========== ESTABLISHMENT HOOK (VERSÃO ROBUSTA) ==========
export function useEstablishment() {
  const { userData } = useAuth();
  const [establishment, setEstablishment] = useState<Establishment | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Criamos uma função de busca de dados com useCallback para ser estável
  const fetchEstablishment = useCallback(async () => {
    if (!userData?.uid || userData.role !== "owner") {
      setEstablishment(null);
      setLoading(false);
      return;
    }

    console.log("Buscando os dados mais recentes do estabelecimento...");
    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, "establishments", userData.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const establishmentData = {
          id: docSnap.id,
          ...docSnap.data(),
        } as Establishment;
        setEstablishment(establishmentData);
        console.log("Dados do estabelecimento atualizados.", establishmentData);
      } else {
        setEstablishment(null);
        console.log("Nenhum documento de estabelecimento encontrado.");
      }
    } catch (err) {
      const errorMessage = errorUtils.getFirebaseErrorMessage(err);
      setError(errorMessage);
      console.error("Erro ao buscar estabelecimento:", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userData?.uid, userData?.role]);

  // useEffect agora apenas chama a nossa função de busca uma vez quando o usuário muda
  useEffect(() => {
    fetchEstablishment();
  }, [fetchEstablishment]);

  const updateEstablishment = async (
    data: Partial<UpdateEstablishmentData>
  ) => {
    if (!userData?.uid) throw new Error("Usuário não autenticado");

    const { imageFile, ...restOfData } = data;
    const dataToUpdate: Partial<Establishment> = { ...restOfData };

    if (imageFile) {
      const storageRef = ref(
        storage,
        `establishments/${userData.uid}/logo/${imageFile.name}`
      );
      await uploadBytes(storageRef, imageFile);
      dataToUpdate.imageURL = await getDownloadURL(storageRef);
    }

    await firestoreOperations.update<Establishment>(
      "establishments",
      userData.uid,
      dataToUpdate
    );

    // Após a atualização, buscamos os dados novamente para garantir consistência
    await fetchEstablishment();
  };

  return {
    establishment,
    loading,
    error,
    updateEstablishment,
    refreshEstablishment: fetchEstablishment, // A função de refresh agora é a própria fetchEstablishment
  };
}

// ========== SERVICES HOOK ==========
export function useServices(establishmentId?: string) {
  const { userData } = useAuth();
  const ownerId = establishmentId || userData?.uid;
  const collectionPath = ownerId ? `establishments/${ownerId}/services` : null;

  const {
    data: services,
    loading,
    error,
    refresh,
  } = useFirestore<Service>(collectionPath, {
    realtime: true,
    orderByField: "name",
    orderDirection: "asc",
  });

  const createService = async (data: CreateServiceData) => {
    if (!collectionPath || !userData?.uid)
      throw new Error("Usuário não autenticado");
    const serviceData = { ...data, establishmentId: userData.uid };
    await firestoreOperations.create<Omit<Service, "id">>(
      collectionPath,
      serviceData
    );
  };

  const updateService = async (id: string, data: Partial<Service>) => {
    if (!collectionPath) throw new Error("Usuário não autenticado");
    await firestoreOperations.update<Service>(collectionPath, id, data);
  };

  const deleteService = async (id: string) => {
    if (!collectionPath) throw new Error("Usuário não autenticado");
    await firestoreOperations.delete(collectionPath, id);
  };

  return {
    services,
    loading,
    error,
    refresh,
    createService,
    updateService,
    deleteService,
  };
}

// ========== PROFESSIONALS HOOK ==========
export function useProfessionals(establishmentId?: string) {
  const { userData } = useAuth();
  const ownerId = establishmentId || userData?.uid;
  const collectionPath = ownerId
    ? `establishments/${ownerId}/professionals`
    : null;

  const {
    data: professionals,
    loading,
    error,
    refresh,
  } = useFirestore<Professional>(collectionPath, {
    realtime: true,
    orderByField: "name",
    orderDirection: "asc",
  });

  const handleImageUpload = async (
    imageFile: File,
    professionalId: string
  ): Promise<string> => {
    const storageRef = ref(
      storage,
      `professionals/${userData!.uid}/${professionalId}/${imageFile.name}`
    );
    await uploadBytes(storageRef, imageFile);
    return await getDownloadURL(storageRef);
  };

  const createProfessional = async (data: CreateProfessionalData) => {
    if (!collectionPath || !userData?.uid)
      throw new Error("Usuário não autenticado");

    const { imageFile, ...restOfData } = data;

    // O objeto 'restOfData' já contém: name, email, phone, bio, serviceIds
    // A sua lógica para a imagem está perfeita.
    let finalPhotoURL = restOfData.photoURL || "";
    if (imageFile) {
      // Usamos um ID temporário para a imagem, o que é ótimo.
      const tempId = doc(collection(db, "temp")).id;
      finalPhotoURL = await handleImageUpload(imageFile, tempId);
    }

    // --- CORREÇÃO APLICADA AQUI ---
    // O objeto final a ser salvo agora inclui todos os dados do formulário.
    const professionalData = {
      ...restOfData, // Inclui name, email, phone, bio, e os serviceIds do form
      establishmentId: userData.uid,
      photoURL: finalPhotoURL,
      // A linha 'serviceIds: []' foi removida, pois ela estava a apagar os serviços selecionados.
    };

    await firestoreOperations.create<Omit<Professional, "id">>(
      collectionPath,
      professionalData
    );
  };

  // A sua função 'updateProfessional' já está correta e vai salvar
  // o email e telefone durante a edição, pois ela já usa o 'restOfData'.
  const updateProfessional = async (
    id: string,
    data: Partial<CreateProfessionalData>
  ) => {
    if (!collectionPath) throw new Error("Usuário não autenticado");

    const { imageFile, ...restOfData } = data;
    const professionalData: Partial<Professional> = { ...restOfData };
    if (imageFile) {
      professionalData.photoURL = await handleImageUpload(imageFile, id);
    }
    await firestoreOperations.update<Professional>(
      collectionPath,
      id,
      professionalData
    );
  };

  const deleteProfessional = async (id: string) => {
    if (!collectionPath) throw new Error("Usuário não autenticado");
    await firestoreOperations.delete(collectionPath, id);
  };

  return {
    professionals,
    loading,
    error,
    refresh,
    createProfessional,
    updateProfessional,
    deleteProfessional,
  };
}
