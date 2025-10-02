"use client";

import {
  Scissors,
  HeartPulse,
  Dumbbell,
  GraduationCap,
  Volleyball,
  Car,
  Leaf,
  CalendarDays,
  PawPrint,
  type LucideIcon,
} from "lucide-react";
import React from "react";

// Importar o Swiper e os seus módulos
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";

// Importar os estilos do Swiper
import "swiper/css";
import "swiper/css/free-mode";

const audiences = [
  { icon: Scissors, name: "Salões e Barbearias" },
  { icon: HeartPulse, name: "Clínicas e Consultórios" },
  { icon: Dumbbell, name: "Estúdios de Pilates e Yoga" },
  { icon: Volleyball, name: "Quadras Esportivas" },
  { icon: GraduationCap, name: "Professores e Aulas" },
  { icon: Car, name: "Estéticas Automotivas" },
  { icon: Leaf, name: "Massagistas e Terapeutas" },
  { icon: PawPrint, name: "Pet Shops e Banhos" },
  {
    icon: CalendarDays,
    name: "Se o negócio vive de agendamentos, é para você!",
  },
];

const AudienceItem = ({
  icon: IconComponent,
  name,
}: {
  icon: LucideIcon;
  name: string;
}) => (
  <div className="flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-full px-5 py-3 shadow-sm">
    <IconComponent className="w-5 h-5 text-indigo-500" />
    <span className="font-semibold text-slate-700 whitespace-nowrap">
      {name}
    </span>
  </div>
);

export const AudienceSection = () => {
  return (
    <section id="para-quem" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Perfeito para o seu tipo de negócio
        </h2>
        <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
          Se o seu negócio vive de agendamentos, a nossa plataforma é a ideal.
          <br />
          De salões a consultórios, simplificamos a sua rotina.
        </p>
      </div>

      <div className="mt-12">
        <Swiper
          modules={[Autoplay, FreeMode]}
          loop={true}
          freeMode={true}
          slidesPerView="auto"
          spaceBetween={30}
          speed={5500}
          autoplay={{
            delay: 0,
            // ▼▼▼ ALTERAÇÕES APLICADAS AQUI ▼▼▼
            disableOnInteraction: false, // <-- Garante que o autoplay retoma após o "arrastar" //
            // ▲▲▲ FIM DAS ALTERAÇÕES ▲▲▲
          }}
          className="!w-full"
        >
          {audiences.map((item, index) => (
            <SwiperSlide key={index} className="!w-auto">
              <AudienceItem icon={item.icon} name={item.name} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
