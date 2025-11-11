import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8082,
    strictPort: true,
    hmr: {
      host: "localhost",
      port: 8082,
      protocol: "ws",
    },
    origin: "http://localhost:8082",
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "Shebanlace_favicon.png",
        "favicon.ico",
        "robots.txt",
      ],
      workbox: {
        maximumFileSizeToCacheInBytes: 7000000,
      },
      devOptions: {
        enabled: false,
      },
      manifest: {
        name: "SheBalance",
        short_name: "SheBalance",
        description: "Keeping your day to day stock",
        display: "standalone",
        theme_color: "#ffffff",
        icons: [
          {
            src: "Shebanlace_favicon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "Shebanlace_favicon.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "Shebanlace_favicon.png",
            sizes: "180x180",
            type: "image/png",
          },
        ],
      },
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
