import express, { type Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`${req.method} ${req.path} - ${Date.now() - start}ms`);
    return originalSend.call(this, data);
  };
  next();
});

if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.resolve(__dirname, "..");

  if (!fs.existsSync(clientDistPath)) {
    throw new Error(
      `Client build directory not found at ${clientDistPath}. ` +
      `Please run 'npm run build' before starting the production server.`
    );
  }

  app.use(express.static(clientDistPath));

  app.get("/.replit-status-check", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Serve index.html for all other routes (SPA support)
  app.use((_req, res) => {
    res.sendFile(path.resolve(clientDistPath, "index.html"));
  });
} else {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      host: "0.0.0.0",
      hmr: {
        protocol: 'ws',
        host: '0.0.0.0',
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

const PORT = parseInt(process.env.PORT || "5000", 10);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
