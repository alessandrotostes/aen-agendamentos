// src/components/client/ClientHeader.tsx (VERSÃO FINAL CORRIGIDA)
"use client";

import React, { Fragment } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, Transition } from "@headlessui/react";
// ALTERAÇÃO: Removido o 'User as UserIcon' que não estava a ser usado.
import { Home, Search, Settings, LogOut } from "lucide-react";
import Link from "next/link";

type ActiveView = "dashboard" | "search" | "settings";

type ClientHeaderProps = {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
};

// Componente para os botões de navegação principais (Painel, Explorar)
const NavButton = ({
  onClick,
  Icon,
  label,
  isActive,
}: {
  onClick: () => void;
  Icon: React.ElementType;
  label: string;
  isActive: boolean;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out
      ${
        isActive
          ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
      }`}
  >
    <Icon className="w-5 h-5" />
    <span className="hidden sm:inline-block">{label}</span>
  </button>
);

export default function ClientHeader({
  activeView,
  onNavigate,
}: ClientHeaderProps) {
  const { userData, logout } = useAuth();

  return (
    <div className="flex items-center justify-between h-16 px-4">
      {/* Logo */}
      <Link href="#" className="flex items-center gap-2 mr-6 flex-shrink-0">
        <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
          <span className="text-white font-extrabold text-lg">A&N</span>
        </div>
        <span className="hidden sm:inline-block font-extrabold text-xl text-slate-800 tracking-tight">
          All & None
        </span>
      </Link>

      {/* Navegação Principal - Centralizada e mais proeminente */}
      <nav className="flex-grow flex justify-center">
        <div className="flex items-center gap-3 bg-slate-100 rounded-full p-1 shadow-inner">
          <NavButton
            onClick={() => onNavigate("dashboard")}
            Icon={Home}
            label="Meu Painel"
            isActive={activeView === "dashboard"}
          />
          <NavButton
            onClick={() => onNavigate("search")}
            Icon={Search}
            label="Explorar"
            isActive={activeView === "search"}
          />
        </div>
      </nav>

      {/* Menu do Utilizador à Direita */}
      <div className="ml-6 flex-shrink-0">
        <Menu as="div" className="relative text-left">
          <Menu.Button className="flex items-center gap-3 rounded-full p-1 lg:p-2 bg-white hover:bg-slate-100 transition-colors duration-200 ease-in-out shadow-sm border border-slate-200">
            <div className="h-9 w-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold text-base flex-shrink-0">
              {userData?.firstName?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="hidden min-w-0 text-left lg:block pr-2">
              <p className="text-xs text-slate-500 leading-none">
                Bem-vindo(a)
              </p>
              <h1 className="text-sm font-semibold text-slate-900 truncate max-w-[120px] leading-snug">
                {userData?.firstName || "Cliente"}
              </h1>
            </div>
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-30">
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onNavigate("settings")}
                      className={`${
                        active
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-700"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                    >
                      <Settings className="mr-2 h-5 w-5 text-indigo-500" />
                      Configurações
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
                        active ? "bg-red-500 text-white" : "text-red-500"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Sair
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}
