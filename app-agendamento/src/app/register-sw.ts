"use client";

import { Workbox } from "workbox-window";

export function registerServiceWorker() {
  if (
    process.env.NODE_ENV === "production" &&
    typeof window !== "undefined" &&
    "serviceWorker" in navigator
  ) {
    const wb = new Workbox("/sw.js");

    wb.register()
      .then((registration) => {
        console.log("Service Worker registered successfully:", registration);
      })
      .catch((error) => {
        // Esta é a correção de resiliência! Apanhamos o erro aqui.
        console.warn("Service Worker registration failed:", error);
      });
  }
}
