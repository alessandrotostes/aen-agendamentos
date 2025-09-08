import { Calendar, CreditCard, Search } from "lucide-react";

const clientBenefits = [
  {
    icon: <Search className="w-8 h-8 text-teal-500" />,
    title: "Encontre os Melhores Profissionais",
    description:
      "Busque por qualquer tipo de serviço e descubra especialistas perto de você, de professores a esteticistas.",
  },
  {
    icon: <Calendar className="w-8 h-8 text-teal-500" />,
    title: "Agende a Qualquer Hora",
    description:
      "Chega de esperar pelo horário comercial. Reserve seu horário online, 24 horas por dia, 7 dias por semana.",
  },
  {
    icon: <CreditCard className="w-8 h-8 text-teal-500" />,
    title: "Pagamento Fácil e Seguro",
    description:
      "Garanta seu horário pagando online com a segurança do Mercado Pago. Simples, rápido e totalmente confiável.",
  },
];

export const ClientBenefits = () => (
  <section id="clientes" className="py-20 bg-gray-50">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-900">
        Tudo para você, cliente
      </h2>
      <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
        Simplificamos a forma como você acessa os serviços que precisa, quando
        precisa.
      </p>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {clientBenefits.map((benefit) => (
          <div
            key={benefit.title}
            className="bg-white p-8 rounded-xl shadow-md text-left"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mb-5">
              {benefit.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {benefit.title}
            </h3>
            <p className="mt-2 text-gray-600">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
