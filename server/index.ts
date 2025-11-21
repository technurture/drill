import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import notificationRoutes from "./routes/notifications.js";
import webhookRoutes from "./routes/webhooks.js";
import { initializeFirebaseAdmin } from "./services/notification.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`${req.method} ${req.path} - ${Date.now() - start}ms`);
    return originalSend.call(this, data);
  };
  next();
});

// Initialize Firebase Admin SDK
initializeFirebaseAdmin();

// API Routes
app.use("/api/notifications", notificationRoutes);
app.use("/api/webhooks", webhookRoutes);

// Async function to handle server startup (handles top-level await safely)
async function startServer() {
  const PORT = parseInt(process.env.PORT || "8080", 10);

  if (process.env.NODE_ENV === "production") {
    // Production: Serve built client
    // Production: Serve built client
    // The server is built to dist/server/index.js
    // The client is built to dist/index.html
    // So we need to serve the parent directory of the server script
    const clientDistPath = path.resolve(__dirname, "..");

    console.log(`Serving static files from: ${clientDistPath}`);

    if (!fs.existsSync(path.join(clientDistPath, "index.html"))) {
      console.error(
        `Client build not found at ${clientDistPath}. Run 'npm run build' before starting.`
      );
      // List files in the directory to help debug
      try {
        console.log("Files in dist:", fs.readdirSync(clientDistPath));
      } catch (e) {
        console.log("Could not list files in dist");
      }
      process.exit(1);
    }

    app.use(express.static(clientDistPath));

    // Status check route
    app.get("/.replit-status-check", (_req, res) => {
      res.json({ status: "ok" });
    });

    // SPA support: serve index.html for other routes
    app.get("/*", (_req, res) => {
      res.sendFile(path.resolve(clientDistPath, "index.html"));
    });
  } else {
    // Development: Use Vite middleware for HMR
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        hmr: {
          protocol: "ws",
          host: "0.0.0.0",
          port: 5000,
        },
      },
      appType: "custom",
    });

    app.use(vite.middlewares);

    app.get("/.replit-status-check", (_req, res) => {
      res.json({ status: "ok" });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Start server
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
