import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const port = Number(process.env.PORT || 3000);
const indexFile = "web-prezantim-parcelimi.html";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8"
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const clean = decoded === "/" ? `/${indexFile}` : decoded;
  const candidate = resolve(root, `.${normalize(clean)}`);
  return candidate.startsWith(root) ? candidate : null;
}

createServer((req, res) => {
  const target = safePath(req.url || "/");
  if (!target) return send(res, 403, "Forbidden");

  const file = existsSync(target) && statSync(target).isDirectory()
    ? join(target, indexFile)
    : target;

  if (!existsSync(file) || !statSync(file).isFile()) {
    return send(res, 404, "Not found");
  }

  res.writeHead(200, {
    "Content-Type": types[extname(file).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "public, max-age=3600"
  });
  createReadStream(file).pipe(res);
}).listen(port, "0.0.0.0", () => {
  console.log(`Parcelimi web presentation running on port ${port}`);
});
