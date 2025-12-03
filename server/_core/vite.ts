import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Try multiple possible paths
  const possiblePaths = [
    path.resolve(import.meta.dirname, "../..", "dist", "public"),
    path.resolve(import.meta.dirname, "..", "dist", "public"),
    path.resolve(import.meta.dirname, "dist", "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "dist/public"),
  ];
  
  console.log(`[Static Files] Current working directory: ${process.cwd()}`);
  console.log(`[Static Files] import.meta.dirname: ${import.meta.dirname}`);
  console.log(`[Static Files] __dirname equivalent: ${path.dirname(import.meta.url)}`);
  
  let distPath: string | null = null;
  for (const testPath of possiblePaths) {
    console.log(`[Static Files] Testing path: ${testPath}`);
    if (fs.existsSync(testPath)) {
      console.log(`[Static Files] ✅ FOUND! Using: ${testPath}`);
      distPath = testPath;
      const files = fs.readdirSync(testPath);
      console.log(`[Static Files] Contains ${files.length} items:`, files.slice(0, 10));
      break;
    } else {
      console.log(`[Static Files] ❌ Not found: ${testPath}`);
    }
  }
  
  if (!distPath) {
    console.error(
      `[Static Files] ERROR: Could not find dist/public in any of the expected locations!`
    );
    console.error(`[Static Files] Tried paths:`, possiblePaths);
    // Serve a helpful error page
    app.use("*", (_req, res) => {
      res.status(500).send(`Build directory not found. Paths tried: ${possiblePaths.join(', ')}`);
    });
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath!, "index.html"));
  });
}
