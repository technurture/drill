import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  root: path.resolve(__dirname, "client"),
  envDir: path.resolve(__dirname),
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: !!process.env.REPLIT_DEPLOYMENT,
    allowedHosts: true,
    hmr: process.env.REPL_OWNER
      ? {
        protocol: "wss",
        clientPort: 443,
      }
      : true,
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw-custom.ts",
      registerType: "autoUpdate",
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      includeAssets: [
        "Shebanlace_favicon.png",
        "favicon.ico",
        "robots.txt",
      ],
      injectManifest: {
        maximumFileSizeToCacheInBytes: 7000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,mp3,json}'],
      },
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: undefined,
      },
      manifest: {
        name: "SheBalance",
        short_name: "SheBalance",
        description: "Empowering women entrepreneurs with business and inventory management",
        display: "standalone",
        theme_color: "#16a34a",
        background_color: "#ffffff",
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
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
}));
