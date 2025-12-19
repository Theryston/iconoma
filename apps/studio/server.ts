import "dotenv/config";
import fs from "node:fs/promises";
import express from "express";
import { fileURLToPath } from "node:url";
import getPort from "get-port";
import http from "node:http";
import apiRoutes from "./api";
import path, { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = __filename.endsWith(".js");

const templateHtml = isProduction
  ? await fs.readFile(path.join(__dirname, "client", "index.html"), "utf-8")
  : "";

type CreateServerOptions = { port?: number };

export async function createServer({ port }: CreateServerOptions = {}) {
  if (!port) {
    port = await getPort({ port: [4545, 4546, 4547, 4548, 4549, 5173] });
  }

  const app = express();

  app.use("/api", apiRoutes);

  let vite: import("vite").ViteDevServer | undefined;
  if (!isProduction) {
    const { createServer } = await import("vite");
    vite = await createServer({
      server: { middlewareMode: true },
      appType: "custom",
      base: "/",
    });
    app.use(vite.middlewares);
  } else {
    const compression = (await import("compression")).default;
    const sirv = (await import("sirv")).default;
    app.use(compression());
    app.use("/", sirv(path.join(__dirname, "client"), { extensions: [] }));
  }

  app.use("*all", async (req, res) => {
    try {
      const url = req.originalUrl;

      let template: string;
      let render: any;

      if (!isProduction) {
        if (!vite) return res.status(500).end("Internal Server Error");

        template = await fs.readFile("./index.html", "utf-8");
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule("/src/entry-server.jsx")).render;
      } else {
        template = templateHtml;
        // @ts-ignore
        render = (await import("./server/entry-server.js")).render;
      }

      const rendered = await render(url);

      const html = template
        .replace(`<!--app-head-->`, rendered.head ?? "")
        .replace(`<!--app-html-->`, rendered.html ?? "");

      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (e: any) {
      vite?.ssrFixStacktrace(e);
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  });

  const url = `http://localhost:${port}`;
  const httpServer = http.createServer(app);

  await new Promise<void>((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(port, "localhost", () => resolve());
  });

  async function close() {
    if (vite) {
      try {
        await vite.close();
      } catch {}
      vite = undefined;
    }
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  }

  return { url, close };
}

if (!isProduction) {
  createServer().then(({ url }) => console.log(`Server started at ${url}`));
}
