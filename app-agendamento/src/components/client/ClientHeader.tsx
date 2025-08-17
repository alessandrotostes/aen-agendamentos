"use client";

import React, { Fragment } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, Transition } from "@headlessui/react";
import {
  Heart as HeartIcon,
  Search as MagnifyingGlassIcon,
  LogOut as LogOutIcon,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

type ClientHeaderProps = {
  onSearchClick: () => void;
  onFavoritesClick: () => void;
};

export default function ClientHeader({
  onSearchClick,
  onFavoritesClick,
}: ClientHeaderProps) {
  // Pegamos a função 'logout' do nosso AuthContext
  const { userData, logout } = useAuth();

  return (
    <div className="flex items-center gap-3">
      {/* --- ALTERAÇÃO: Menu de Usuário --- */}
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="flex items-center gap-3 min-w-0 rounded-lg p-1 hover:bg-slate-100 transition-colors">
            <div className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-teal-600 text-white flex items-center justify-center font-semibold text-lg">
              {userData?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-xs text-slate-500">Bem-vindo(a)</p>
              <h1 className="text-base md:text-lg font-semibold text-slate-900 truncate">
                {userData?.name || "Cliente"}
              </h1>
            </div>
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onFavoritesClick}
                    className={`${
                      active ? "bg-teal-500 text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    <HeartIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                    Meus Favoritos
                  </button>
                )}
              </Menu.Item>
            </div>
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={logout}
                    className={`${
                      active ? "bg-red-500 text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    <LogOutIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                    Sair
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Ação de Busca (mantida para fácil acesso) */}
      <div className="ml-auto flex items-center">
        <button
          onClick={onSearchClick}
          className="h-10 md:h-11 px-3 md:px-4 rounded-lg bg-teal-600 text-white font-medium inline-flex items-center gap-2 hover:bg-teal-700 active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          type="button"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
          <span className="hidden sm:inline text-sm md:text-base">Buscar</span>
        </button>
      </div>
    </div>
  );
}
