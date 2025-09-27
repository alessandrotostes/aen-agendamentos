// eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/no-unused-vars
if (!self.define) {
  let e,
    s = {};
  const a = (a, c) => (
    (a = new URL(a + ".js", c).href),
    s[a] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = a), (e.onload = s), document.head.appendChild(e);
        } else (e = a), importScripts(a), s();
      }).then(() => {
        let e = s[a];
        if (!e) throw new Error(`Module ${a} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, n) => {
    const t =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[t]) return;
    let i = {};
    const r = (e) => a(e, t),
      f = { module: { uri: t }, exports: i, require: r };
    s[t] = Promise.all(c.map((e) => f[e] || r(e))).then((e) => (n(...e), i));
  };
}
define(["./workbox-f1770938"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/static/4QjNzihB4k2xDpqwUUEW2/_buildManifest.js",
          revision: "d1c5478de751e091cabfe07dc5998306",
        },
        {
          url: "/_next/static/4QjNzihB4k2xDpqwUUEW2/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/1255-2175513a22f71a9a.js",
          revision: "2175513a22f71a9a",
        },
        {
          url: "/_next/static/chunks/2379-fe37823b2450d878.js",
          revision: "fe37823b2450d878",
        },
        {
          url: "/_next/static/chunks/2474.f6e87b8dc7df2628.js",
          revision: "f6e87b8dc7df2628",
        },
        {
          url: "/_next/static/chunks/2845.f2e8a8d0f319d595.js",
          revision: "f2e8a8d0f319d595",
        },
        {
          url: "/_next/static/chunks/2960.36e5a95f680dc362.js",
          revision: "36e5a95f680dc362",
        },
        {
          url: "/_next/static/chunks/316-2e36554ff0e6d27f.js",
          revision: "2e36554ff0e6d27f",
        },
        {
          url: "/_next/static/chunks/3469.6da30119fdafc1fe.js",
          revision: "6da30119fdafc1fe",
        },
        {
          url: "/_next/static/chunks/3641.3053381abb4e4a98.js",
          revision: "3053381abb4e4a98",
        },
        {
          url: "/_next/static/chunks/3651-e601f5fb5a096779.js",
          revision: "e601f5fb5a096779",
        },
        {
          url: "/_next/static/chunks/382-bdb1fedd231bc372.js",
          revision: "bdb1fedd231bc372",
        },
        {
          url: "/_next/static/chunks/4504-ea15a13baf4887d7.js",
          revision: "ea15a13baf4887d7",
        },
        {
          url: "/_next/static/chunks/472.22ae8d327779584b.js",
          revision: "22ae8d327779584b",
        },
        {
          url: "/_next/static/chunks/4bd1b696-dc4e0dc2932f6dcb.js",
          revision: "dc4e0dc2932f6dcb",
        },
        {
          url: "/_next/static/chunks/52774a7f-3593dff9bc3fe7f7.js",
          revision: "3593dff9bc3fe7f7",
        },
        {
          url: "/_next/static/chunks/5984.47ef0e4e23a3591f.js",
          revision: "47ef0e4e23a3591f",
        },
        {
          url: "/_next/static/chunks/6727-998f6164e4865ec9.js",
          revision: "998f6164e4865ec9",
        },
        {
          url: "/_next/static/chunks/6766-d1ad389a4ee15a5f.js",
          revision: "d1ad389a4ee15a5f",
        },
        {
          url: "/_next/static/chunks/6874-92ee110b8c84edd1.js",
          revision: "92ee110b8c84edd1",
        },
        {
          url: "/_next/static/chunks/7508b87c-a8740fcd3b5d0eb9.js",
          revision: "a8740fcd3b5d0eb9",
        },
        {
          url: "/_next/static/chunks/8354-65d2e4145e631806.js",
          revision: "65d2e4145e631806",
        },
        {
          url: "/_next/static/chunks/8540.483eb6ae17313ea6.js",
          revision: "483eb6ae17313ea6",
        },
        {
          url: "/_next/static/chunks/9292-bd480f469264aff2.js",
          revision: "bd480f469264aff2",
        },
        {
          url: "/_next/static/chunks/9341.bb344f93969b5311.js",
          revision: "bb344f93969b5311",
        },
        {
          url: "/_next/static/chunks/9438-ceb55dad18192bac.js",
          revision: "ceb55dad18192bac",
        },
        {
          url: "/_next/static/chunks/9971-594037db184bf8c2.js",
          revision: "594037db184bf8c2",
        },
        {
          url: "/_next/static/chunks/app/(auth)/layout-8ce2ef28283f5a06.js",
          revision: "8ce2ef28283f5a06",
        },
        {
          url: "/_next/static/chunks/app/(auth)/login/page-8773749960bf93c1.js",
          revision: "8773749960bf93c1",
        },
        {
          url: "/_next/static/chunks/app/(auth)/register/page-bfaf352f631526f6.js",
          revision: "bfaf352f631526f6",
        },
        {
          url: "/_next/static/chunks/app/(auth)/reset-password/page-3e831db4a60d43cd.js",
          revision: "3e831db4a60d43cd",
        },
        {
          url: "/_next/static/chunks/app/(auth)/set-new-password/page-f90aa665f162c977.js",
          revision: "f90aa665f162c977",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-5829ec80330ce005.js",
          revision: "5829ec80330ce005",
        },
        {
          url: "/_next/static/chunks/app/api/sentry-example-api/route-85a65dd32a8cb7c4.js",
          revision: "85a65dd32a8cb7c4",
        },
        {
          url: "/_next/static/chunks/app/checkout/page-c4d708c5b45c4b64.js",
          revision: "c4d708c5b45c4b64",
        },
        {
          url: "/_next/static/chunks/app/client/page-ad01b66e38ae8cc4.js",
          revision: "ad01b66e38ae8cc4",
        },
        {
          url: "/_next/static/chunks/app/client/salon/%5Bslug%5D/page-cbcba1faa2779c78.js",
          revision: "cbcba1faa2779c78",
        },
        {
          url: "/_next/static/chunks/app/global-error-514433ec98fe9ea0.js",
          revision: "514433ec98fe9ea0",
        },
        {
          url: "/_next/static/chunks/app/layout-fc0ab195a0d41ed1.js",
          revision: "fc0ab195a0d41ed1",
        },
        {
          url: "/_next/static/chunks/app/owner/mp-redirect/page-41b8cce56822dd60.js",
          revision: "41b8cce56822dd60",
        },
        {
          url: "/_next/static/chunks/app/owner/page-703e391b625af9ce.js",
          revision: "703e391b625af9ce",
        },
        {
          url: "/_next/static/chunks/app/owner/settings/page-3c3159760661eb19.js",
          revision: "3c3159760661eb19",
        },
        {
          url: "/_next/static/chunks/app/page-ce87b0846a7d9e3e.js",
          revision: "ce87b0846a7d9e3e",
        },
        {
          url: "/_next/static/chunks/app/politica-de-privacidade/page-d870889e9fafdbf1.js",
          revision: "d870889e9fafdbf1",
        },
        {
          url: "/_next/static/chunks/app/professional/dashboard/page-5ed9c6c6bb276035.js",
          revision: "5ed9c6c6bb276035",
        },
        {
          url: "/_next/static/chunks/app/search/page-6bd475ebe3054497.js",
          revision: "6bd475ebe3054497",
        },
        {
          url: "/_next/static/chunks/app/termos-de-uso/page-9abe86038005b972.js",
          revision: "9abe86038005b972",
        },
        {
          url: "/_next/static/chunks/c16f53c3-1d9714fd15510969.js",
          revision: "1d9714fd15510969",
        },
        {
          url: "/_next/static/chunks/dd8162e8-dff14861e626f4c2.js",
          revision: "dff14861e626f4c2",
        },
        {
          url: "/_next/static/chunks/framework-2757ad4ed5f8198a.js",
          revision: "2757ad4ed5f8198a",
        },
        {
          url: "/_next/static/chunks/main-0af1a9f0c3f0c9db.js",
          revision: "0af1a9f0c3f0c9db",
        },
        {
          url: "/_next/static/chunks/main-app-06885b225ebcfb8b.js",
          revision: "06885b225ebcfb8b",
        },
        {
          url: "/_next/static/chunks/pages/_app-15182d0e520c7b54.js",
          revision: "15182d0e520c7b54",
        },
        {
          url: "/_next/static/chunks/pages/_error-ec16b3e2fb104681.js",
          revision: "ec16b3e2fb104681",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-ef23c03030c93c98.js",
          revision: "ef23c03030c93c98",
        },
        {
          url: "/_next/static/css/7e7d96b1e6991756.css",
          revision: "7e7d96b1e6991756",
        },
        {
          url: "/_next/static/css/b4998bd64e5f1f65.css",
          revision: "b4998bd64e5f1f65",
        },
        {
          url: "/_next/static/css/e475e039112f7c53.css",
          revision: "e475e039112f7c53",
        },
        {
          url: "/_next/static/media/19cfc7226ec3afaa-s.woff2",
          revision: "9dda5cfc9a46f256d0e131bb535e46f8",
        },
        {
          url: "/_next/static/media/21350d82a1f187e9-s.woff2",
          revision: "4e2553027f1d60eff32898367dd4d541",
        },
        {
          url: "/_next/static/media/8e9860b6e62d6359-s.woff2",
          revision: "01ba6c2a184b8cba08b0d57167664d75",
        },
        {
          url: "/_next/static/media/ba9851c3c22cd980-s.woff2",
          revision: "9e494903d6b0ffec1a1e14d34427d44d",
        },
        {
          url: "/_next/static/media/c5fe6dc8356a8c31-s.woff2",
          revision: "027a89e9ab733a145db70f09b8a18b42",
        },
        {
          url: "/_next/static/media/df0a9ae256c0569c-s.woff2",
          revision: "d54db44de5ccb18886ece2fda72bdfe0",
        },
        {
          url: "/_next/static/media/e4af272ccee01ff0-s.p.woff2",
          revision: "65850a373e258f1c897a2b3d75eb74de",
        },
        { url: "/file.svg", revision: "d09f95206c3fa0bb9bd9fefabfd0ea71" },
        { url: "/globe.svg", revision: "2aaafa6a49b6563925fe440891e32717" },
        {
          url: "/icons/icon-192x192.png",
          revision: "e83089ad3ff2efc1ff9ebd2a7f041637",
        },
        {
          url: "/icons/icon-512x512.png",
          revision: "dce70b2ec28a708458c907b0cb81fd35",
        },
        {
          url: "/images/default-avatar.png",
          revision: "2fd8f95f1810e153852f7017b2152f17",
        },
        {
          url: "/images/fundo-auth1.jpg",
          revision: "c34dd63ca0750879b96dfef1351085fe",
        },
        {
          url: "/images/mercado-pago-logo.svg",
          revision: "9a43219173eed70a379e116013abb9a6",
        },
        { url: "/manifest.json", revision: "2978ba882896d7d4c0c040ef47786a81" },
        { url: "/next.svg", revision: "8e061864f388b47f33a1c3780831193e" },
        { url: "/vercel.svg", revision: "c0af2f507b369b085b35ef4bbe3bcf1e" },
        { url: "/window.svg", revision: "a2760511c65806022ad20adf74370ff3" },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: function (e) {
              var s = e.response;
              return _async_to_generator(function () {
                return _ts_generator(this, function (e) {
                  return [
                    2,
                    s && "opaqueredirect" === s.type
                      ? new Response(s.body, {
                          status: 200,
                          statusText: "OK",
                          headers: s.headers,
                        })
                      : s,
                  ];
                });
              })();
            },
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/static.+\.js$/i,
      new e.CacheFirst({
        cacheName: "next-static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp4|webm)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      function (e) {
        var s = e.sameOrigin,
          a = e.url.pathname;
        return !(
          !s ||
          a.startsWith("/api/auth/callback") ||
          !a.startsWith("/api/")
        );
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      function (e) {
        var s = e.request,
          a = e.url.pathname,
          c = e.sameOrigin;
        return (
          "1" === s.headers.get("RSC") &&
          "1" === s.headers.get("Next-Router-Prefetch") &&
          c &&
          !a.startsWith("/api/")
        );
      },
      new e.NetworkFirst({
        cacheName: "pages-rsc-prefetch",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      function (e) {
        var s = e.request,
          a = e.url.pathname,
          c = e.sameOrigin;
        return "1" === s.headers.get("RSC") && c && !a.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "pages-rsc",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      function (e) {
        var s = e.url.pathname;
        return e.sameOrigin && !s.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "pages",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      function (e) {
        return !e.sameOrigin;
      },
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET"
    );
});
//# sourceMappingURL=sw.js.map
