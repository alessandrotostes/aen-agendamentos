import React from "react";

export default function DetailPageSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen animate-pulse">
      {/* Esqueleto do Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="h-10 bg-gray-200 rounded-md w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded-md w-full mb-2"></div>
          <div className="h-5 bg-gray-200 rounded-md w-1/3"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Esqueleto da Coluna de Serviços */}
        <section className="lg:col-span-2">
          <div className="h-9 bg-gray-200 rounded-md w-1/2 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Repetir o esqueleto de um item de serviço 3 vezes */}
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex justify-between items-center border-b pb-4 last:border-b-0"
              >
                <div>
                  <div className="h-6 bg-gray-200 rounded-md w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-24"></div>
                </div>
                <div className="text-right">
                  <div className="h-7 bg-gray-200 rounded-md w-20 mb-2"></div>
                  <div className="h-9 bg-gray-300 rounded-lg w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Esqueleto da Coluna de Profissionais */}
        <aside className="lg:col-span-1">
          <div className="h-9 bg-gray-200 rounded-md w-3/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            {[1, 2].map((item) => (
              <div key={item} className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="h-6 bg-gray-200 rounded-md w-full"></div>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
