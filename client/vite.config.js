import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: ["icons/icon192.png", "icons/icon512.png"],

      manifest: {
        name: "Chalk Notes",
        short_name: "Chalk",
        description: "A minimalist offline-first note app",
        start_url: "/",
        display: "standalone",
        background_color: "#0f0f0f",
        theme_color: "#0f0f0f",
        orientation: "portrait",
        scope: "/",

        icons: [
          {
            src: "/icons/icon192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },

      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === "document",
            handler: "NetworkFirst"
          },
          {
            urlPattern: ({ request }) =>
              ["script", "style", "image"].includes(request.destination),
            handler: "CacheFirst"
          }
        ]
      }
    })
  ]
});