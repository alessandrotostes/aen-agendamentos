"use client";

import React, { useState } from "react";
import Image from "next/image";
import { storage, db } from "../../lib/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import type { Establishment } from "../../types";

interface OwnerHeaderProps {
  establishment: Establishment | null;
  onPhotoUpdated: (url: string) => void;
}

export default function OwnerHeader({
  establishment,
  onPhotoUpdated,
}: OwnerHeaderProps) {
  const { logout } = useAuth();
  const [uploading, setUploading] = useState(false);

  async function handleChangePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length || !establishment?.id) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const path = `establishments/${establishment.id}/${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "establishments", establishment.id), {
        imageURL: url,
      });
      onPhotoUpdated(url);
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar foto.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const imgSrc = establishment?.imageURL || "/placeholder.png";

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-teal-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Avatar e nome */}
        <div className="flex items-center space-x-4">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={imgSrc}
              alt={establishment?.name || ""}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {establishment?.name}
            </h1>
            <p className="text-sm text-teal-600">Painel do Proprietário</p>
            <label
              className={`mt-1 text-xs text-blue-600 cursor-pointer ${
                uploading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {uploading ? "Enviando..." : "Trocar Foto"}
              <input
                type="file"
                accept="image/*"
                onChange={handleChangePhoto}
                hidden
              />
            </label>
          </div>
        </div>
        {/* Botão logout */}
        <button
          onClick={logout}
          className="text-sm text-teal-600 hover:text-teal-400 font-medium"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
