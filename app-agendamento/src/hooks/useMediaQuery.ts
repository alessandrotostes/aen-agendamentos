"use client";

import { useState, useEffect } from "react";

/**
 * Um hook React para detetar se o tamanho da tela corresponde a uma media query CSS.
 * Ele lida com a renderização no servidor (SSR) de forma segura.
 * @param query A string da media query a ser testada (ex: '(max-width: 768px)')
 * @returns `true` se a query corresponder, `false` caso contrário.
 */
export function useMediaQuery(query: string): boolean {
  // Começamos com 'false' como padrão para a renderização no servidor.
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Este efeito só é executado no navegador (cliente), após a primeira renderização.
    const media = window.matchMedia(query);

    // 1. Sincronizamos o estado com o valor real no primeiro carregamento do cliente.
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // 2. Criamos um listener para observar futuras mudanças (ex: rotação do dispositivo).
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Usamos addEventListener que é o método mais moderno e recomendado.
    media.addEventListener("change", listener);

    // A função de limpeza remove o listener quando o componente é desmontado.
    return () => media.removeEventListener("change", listener);
  }, [matches, query]); // O efeito é re-executado se a query ou o estado mudarem.

  return matches;
}
