import React from "react";
import Link from "next/link";
// ✅ Removido import não usado: Image

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S&B</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Salões & Barbearias
                </h1>
                <p className="text-sm text-gray-500">Sistema de Agendamento</p>
              </div>
            </Link>
          </div>

          {/* Form Content */}
          <div>{children}</div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2025 Sistema de Agendamento. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Hero Image/Info */}
      <div className="hidden lg:block relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700">
          <div className="absolute inset-0 bg-black opacity-20" />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-center h-full p-12 text-white">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold mb-6">
              Gerencie seu negócio com facilidade
            </h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span>Agendamentos online automáticos</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span>Pagamentos seguros integrados</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span>Dashboard completo de gestão</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span>Relatórios e análises detalhadas</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
              <p className="text-sm">
                {/* ✅ Aspas escapadas corretamente */}
                <strong>&ldquo;Revolucionou minha barbearia!&rdquo;</strong>
                <br />
                &ldquo;Desde que comecei a usar, meus agendamentos aumentaram
                300% e não perco mais nenhum cliente.&rdquo;
              </p>
              <p className="text-xs mt-2 opacity-80">
                — João Silva, Barbearia Central
              </p>
            </div>
          </div>
        </div>

        {/* Background pattern */}
        <div className="absolute bottom-0 right-0 p-8 opacity-10">
          <div className="grid grid-cols-6 gap-4">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-white rounded-full"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
