import Link from "next/link";

export const HeroSection = () => (
  <section className="relative flex items-center justify-center text-center text-white min-h-[calc(100vh-4rem)] py-16 sm:py-24">
    <div
      className="absolute inset-0 bg-cover bg-center animate-kenburns" // Fundo com leve animação
      style={{ backgroundImage: "url('/images/fundo-auth1.jpg')" }}
    />
    <div className="absolute inset-0 bg-black/60" />{" "}
    {/* Um pouco mais escuro para melhor contraste */}
    <div className="relative z-10 p-4">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
        A sua agenda, simplificada.
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-200">
        Conectamos você aos melhores serviços e oferecemos a ferramenta
        definitiva para profissionais e negócios gerenciarem seus agendamentos.
      </p>
      <div className="mt-8">
        {/* ALTERAÇÃO: Cartão central com borda de gradiente */}
        <div className="max-w-md mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-1 bg-gradient-to-br from-indigo-500 to-teal-500">
          <div className="bg-white rounded-xl p-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Por que All & None?
              </h2>
              <div className="text-left">
                <p className="text-lg text-teal-700 font-semibold">All:</p>
                <p className="text-gray-700">
                  Todas as ferramentas que você precisa para gerir e crescer o
                  seu negócio, na palma da sua mão.
                </p>
              </div>
              <div className="text-left">
                <p className="text-lg text-indigo-700 font-semibold">None:</p>
                <p className="text-gray-700">
                  Nenhuma preocupação com agendamentos perdidos ou dificuldade
                  de ter insights sobre o seu negócio. Nós cuidamos disso para
                  você.
                </p>
              </div>
            </div>
            <Link
              href="/register"
              className="mt-6 block w-full py-3 px-6 bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-lg font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Comece a usar gratuitamente
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);
