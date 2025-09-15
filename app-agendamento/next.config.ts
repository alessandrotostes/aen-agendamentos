// next.config.ts

import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // A opção 'register: true' é o padrão, então não precisamos de a especificar.
  // A opção 'skipWaiting: true' está a causar o conflito, então removemo-la por agora.
  // O comportamento padrão já é excelente.
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default withPWA(nextConfig);
