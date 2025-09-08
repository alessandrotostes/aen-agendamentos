"use client";

import Link from "next/link";

export const CTASection = () => {
  return (
    <section className="bg-gradient-to-r from-teal-500 to-indigo-600 py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
          Pronto para simplificar sua agenda?
        </h2>
        <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
          Junte-se a centenas de clientes e profissionais que já otimizaram seu
          tempo com a A&N Agendamentos.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-block px-8 py-4 bg-white text-teal-600 font-bold text-lg rounded-lg shadow-lg hover:scale-105 transition-transform"
          >
            Cadastre-se Gratuitamente
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-block px-8 py-4 text-white font-semibold hover:bg-white/10 rounded-lg transition"
          >
            Já tenho uma conta
          </Link>
        </div>
      </div>
    </section>
  );
};
