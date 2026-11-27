// Bargain Beacon — a tiny static server for app/, so the site can be run
// locally without a build step: `node serve.ts` serves app/ on
// http://localhost:8080 (`--port <n>` for another port). Development
// convenience only; the entry itself is static files.

import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("./app", import.meta.url)));
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const requested = portIndex === -1 ? 8080 : Number(args[portIndex + 1]);
const port = Number.isInteger(requested) && requested > 0 && requested < 65536 ? requested : 8080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  const file = resolve(join(root, normalize(pathname).replace(/^(\.\.[/\\])+/, "")));
  if (!file.startsWith(root + sep) && file !== root) {
    response.writeHead(403).end("forbidden");
    return;
  }
  const target = file === root ? join(root, "index.html") : file;
  let stat;
  try {
    stat = statSync(target);
  } catch {
    response.writeHead(404).end("not found");
    return;
  }
  if (!stat.isFile()) {
    response.writeHead(404).end("not found");
    return;
  }
  response.writeHead(200, { "content-type": MIME[extname(target)] ?? "application/octet-stream" });
  createReadStream(target).pipe(response);
}).listen(port, () => console.log(`Bargain Beacon on http://localhost:${port}`));
