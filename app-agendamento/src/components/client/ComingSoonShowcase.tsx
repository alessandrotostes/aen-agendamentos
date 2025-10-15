"use client";

import {
  ArrowLeft,
  Scissors,
  HeartPulse,
  Dumbbell,
  Landmark,
} from "lucide-react";
import { motion } from "framer-motion";
import FallingIcons from "./FallingIcons"; // Assumindo que o FallingIcons.tsx está na mesma pasta

interface ComingSoonShowcaseProps {
  onNavigateBack: () => void;
}

export default function ComingSoonShowcase({
  onNavigateBack,
}: ComingSoonShowcaseProps) {
  return (
    // ▼▼▼ ALTERAÇÃO 1: Adicionado 'rounded-2xl' para arredondar a secção inteira ▼▼▼
    <div className="bg-gradient-to-br from-teal-500 to-indigo-600 min-h-[calc(100vh-150px)] flex flex-col relative overflow-hidden rounded-2xl shadow-lg">
      <FallingIcons />

      {/* Botão de voltar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          onClick={onNavigateBack}
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur transition-colors hover:bg-white/20 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Voltar ao Painel
        </motion.button>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-grow flex items-center justify-center relative z-10 p-4">
        {/* ▼▼▼ ALTERAÇÃO 2: Aplicado o efeito "Glassmorphism" aqui ▼▼▼ */}
        <div className="text-center p-8 sm:p-12 max-w-2xl mx-auto bg-black/5 rounded-2xl border border-white/10 backdrop-blur-sm">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-bold text-white rounded-2xl"
          >
            Novos Horizontes à Vista
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mt-4 text-lg text-indigo-100 max-w-lg mx-auto"
          >
            Estamos criando uma vitrine exclusiva com os melhores
            estabelecimentos para você. Em breve, explorar e agendar as suas
            próximas experiências será mais fácil e prático do que nunca.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mt-4 text-lg text-indigo-100 max-w-lg mx-auto"
          >
            Por enquanto, utilize o link compartilhado pelo seu estabelecimento
            para agendar seus serviços. Agradecemos a sua paciência e estamos
            ansiosos para revelar essa nova funcionalidade em breve!
          </motion.p>
        </div>
      </div>
    </div>
  );
}
