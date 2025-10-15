"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Scissors,
  HeartPulse,
  Dumbbell,
  LucideVolleyball,
  Landmark,
  Leaf,
  PawPrint,
  type LucideIcon,
} from "lucide-react";

// A nossa lista de ícones base
const iconList: LucideIcon[] = [
  Scissors,
  HeartPulse,
  Dumbbell,
  Landmark,
  LucideVolleyball,
  Leaf,
  PawPrint,
];

// Interface para as propriedades de cada ícone a ser animado
interface IconProps {
  icon: LucideIcon;
  left: string;
  size: number;
  duration: number;
  delay: number;
}

export default function FallingIcons() {
  // Usamos useMemo para gerar os ícones aleatórios apenas uma vez
  const icons = useMemo(() => {
    const generatedIcons: IconProps[] = [];
    const iconCount = 20; // Quantidade de ícones a cair na tela

    for (let i = 0; i < iconCount; i++) {
      generatedIcons.push({
        icon: iconList[i % iconList.length], // Roda pela lista de ícones
        left: `${Math.random() * 100}%`, // Posição horizontal aleatória
        size: Math.random() * 40 + 20, // Tamanho aleatório entre 20 e 60px
        duration: Math.random() * 5 + 5, // Duração da queda entre 5 e 10s
        delay: Math.random() * 5, // Atraso inicial aleatório até 5s
      });
    }
    return generatedIcons;
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {icons.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={index}
            className="absolute text-white/10"
            style={{
              left: item.left,
              width: item.size,
              height: item.size,
            }}
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            }}
          >
            <Icon strokeWidth={1} className="w-full h-full" />
          </motion.div>
        );
      })}
    </div>
  );
}
