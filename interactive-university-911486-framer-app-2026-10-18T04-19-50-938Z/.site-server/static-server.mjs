// Serves a replay or a saved site. Runs as its own process so a slow or broken
// page can never stall the studio.
//
//   node static-server.mjs --directory <folder> --port 8080 [--host 127.0.0.1]
//
//   --recover        fetch a file the capture missed from the original site,
//                    keep it, and serve it (the studio turns this on; a saved
//                    site opened on its own stays fully offline)
//   --mirror <dir>   also store recovered files there

import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { localAssetPath, postAssetPath, hashBody, EXTERNAL_PREFIX, INDEX_FILE } from "./asset-path.mjs";

const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : args[index + 1];
};

const root = path.resolve(valueAfter("--directory", process.cwd()));
const port = Number(valueAfter("--port", "8080"));
const host = valueAfter("--host", "127.0.0.1");
const recover = args.includes("--recover");
const mirror = valueAfter("--mirror", null);

const MIME_TYPES = new Map(Object.entries({
  ".html": "text/html; charset=utf-8", ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".cjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json", ".wasm": "application/wasm",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".gif": "image/gif", ".webp": "image/webp", ".avif": "image/avif", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf",
  ".mp4": "video/mp4", ".m4v": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".ogg": "audio/ogg", ".m4a": "audio/mp4",
  ".pdf": "application/pdf", ".riv": "application/octet-stream", ".lottie": "application/zip",
}));

// Image optimisers (/_next/image, /_vercel/image, /cdn-cgi/image) answer at a
// path without an extension. A browser refuses an SVG served as a generic
// download, so look at the first bytes to name the type.
async function sniffType(file) {
  const handle = await fsp.open(file, "r").catch(() => null);
  if (!handle) return null;
  try {
    const { buffer, bytesRead } = await handle.read(Buffer.alloc(512), 0, 512, 0);
    const head = buffer.subarray(0, bytesRead);
    const text = head.toString("utf8").trimStart().toLowerCase();
    if (head[0] === 0x89 && head[1] === 0x50) return "image/png";
    if (head[0] === 0xff && head[1] === 0xd8) return "image/jpeg";
    if (text.startsWith("gif8")) return "image/gif";
    if (head.subarray(0, 4).toString() === "RIFF" && head.subarray(8, 12).toString() === "WEBP") return "image/webp";
    if (head.subarray(4, 12).toString().startsWith("ftypavif")) return "image/avif";
    if (head.subarray(4, 8).toString() === "ftyp") return "video/mp4";
    if (head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3) return "video/webm";
    if (head.subarray(0, 4).toString() === "wOF2") return "font/woff2";
    if (head.subarray(0, 4).toString() === "wOFF") return "font/woff";
    if (text.startsWith("<svg") || (text.startsWith("<?xml") && text.includes("<svg"))) return "image/svg+xml";
    if (text.startsWith("<!doctype html") || text.startsWith("<html")) return "text/html; charset=utf-8";
    if (text.startsWith("{") || text.startsWith("[")) return "application/json; charset=utf-8";
    return null;
  } finally {
    await handle.close();
  }
}

function insideRoot(relative) {
  const candidate = path.resolve(root, `.${relative.startsWith("/") ? relative : `/${relative}`}`);
  return candidate === root || candidate.startsWith(`${root}${path.sep}`) ? candidate : null;
}

async function fileAt(candidate) {
  const info = await fsp.stat(candidate).catch(() => null);
  if (!info) return null;
  if (info.isFile()) return { file: candidate, size: info.size };
  if (info.isDirectory()) {
    const index = path.join(candidate, "index.html");
    const indexInfo = await fsp.stat(index).catch(() => null);
    if (indexInfo?.isFile()) return { file: index, size: indexInfo.size };
  }
  return null;
}

// The capture index names the original site and every query-string variant
// that was saved. Reloaded when the file changes (a rebuild rewrites it).
let indexCache = { mtimeMs: -1, data: null };
async function captureIndex() {
  const file = path.join(root, INDEX_FILE);
  const info = await fsp.stat(file).catch(() => null);
  if (!info) return null;
  if (info.mtimeMs !== indexCache.mtimeMs) {
    try { indexCache = { mtimeMs: info.mtimeMs, data: JSON.parse(await fsp.readFile(file, "utf8")) }; }
    catch { indexCache = { mtimeMs: info.mtimeMs, data: null }; }
  }
  return indexCache.data;
}

// Parameters that say WHICH picture an optimiser endpoint should return, as
// opposed to how large or how compressed.
const IDENTITY_PARAMS = ["url", "src", "image", "img", "u", "path", "file", "href", "id", "name", "key"];
const SIZE_PARAMS = ["w", "width", "h", "height", "q", "quality", "dpr", "fm", "format", "auto", "fit", "v", "ver", "version", "t", "ts", "cb", "_"];

// A request whose query was not captured exactly: /_next/image?url=a.png&w=3840
// on a retina screen when only w=1920 was saved. Serve the closest capture of
// the same thing — never a different picture that happens to share the path.
function closestVariant(candidates, search, hasExtension) {
  if (!candidates?.length) return null;
  const wanted = new URLSearchParams(search);
  const identity = IDENTITY_PARAMS.filter((name) => wanted.has(name));
  const width = Number(wanted.get("w") || wanted.get("width")) || 0;
  let best = null;
  for (const candidate of candidates) {
    const params = new URLSearchParams(candidate.search);
    if (identity.some((name) => params.get(name) !== wanted.get(name))) continue;
    let score = 0;
    for (const [name, value] of wanted) {
      if (params.get(name) === value) score += SIZE_PARAMS.includes(name) ? 1 : 4;
      else if (!SIZE_PARAMS.includes(name) && !identity.includes(name)) score -= 2;
    }
    // Prefer the smallest captured width that is at least what was asked for
    // (sharp on any screen); a smaller one only when nothing larger exists.
    const candidateWidth = Number(params.get("w") || params.get("width")) || 0;
    if (width && candidateWidth) score -= candidateWidth >= width ? Math.log2(candidateWidth / width) * 0.25 : 2 + Math.log2(width / candidateWidth);
    if (!best || score > best.score) best = { candidate, score };
  }
  if (!best) return null;
  // Without an extension or an identity parameter there is nothing tying the
  // request to the capture, so only an otherwise positive match counts.
  if (!hasExtension && !identity.length && best.score <= 0 && candidates.length > 1) return null;
  return best.candidate;
}

async function variantFromIndex(decoded, search) {
  const index = await captureIndex();
  const plain = localAssetPath(decoded, "");
  const match = closestVariant(index?.variants?.[plain], search, Boolean(path.extname(decoded)));
  const target = match && insideRoot(match.file);
  return target ? fileAt(target) : null;
}

// For replays built before the index existed: a versioned file (logo.svg?v=2)
// can answer for any other version of itself.
async function anyQueryVariant(relative) {
  const target = insideRoot(relative);
  const extension = target && path.extname(target);
  if (!extension) return null;
  const base = path.basename(target.slice(0, -extension.length));
  const entries = await fsp.readdir(path.dirname(target)).catch(() => []);
  const match = entries.find((name) => name.startsWith(`${base}~`) && name.endsWith(extension) && !name.includes("~post-"));
  return match ? fileAt(path.join(path.dirname(target), match)) : null;
}

// Whatever the capture missed — a chunk loaded on hover, a font weight used
// only on mobile — is fetched once from the site it came from and kept.
// Only ever for sub-resources: a page load must be answered by the replay's
// own index.html, never by a fresh copy of the live page (which would lose
// the trimming and the offline patches).
// A failure is remembered only briefly: the network may simply have been
// down for a moment, and the next look at the page should try again.
const RECOVERY_RETRY_AFTER = Number(process.env.RECOVERY_RETRY_MS || 60_000);
const recoveryFailures = new Map();
async function recoverFromOrigin(decoded, search) {
  if (!recover || Date.now() - (recoveryFailures.get(decoded + search) || 0) < RECOVERY_RETRY_AFTER) return null;
  const index = await captureIndex();
  if (!index?.origin) return null;

  const external = decoded.match(new RegExp(`^/${EXTERNAL_PREFIX}/([^/]+)(/.*)$`));
  if (external && !index.externalHosts?.includes(external[1])) return null;
  const source = external
    ? `${/^(localhost|127\.|\[)/.test(external[1]) ? "http" : "https"}://${external[1]}${encodeURI(external[2])}${search ? `?${search}` : ""}`
    : `${index.origin}${encodeURI(decoded)}${search ? `?${search}` : ""}`;

  try {
    const isMedia = /\.(mp4|webm|mov|m4v|mp3|wav)$/i.test(decoded);
    const response = await fetch(source, { signal: AbortSignal.timeout(isMedia ? 45_000 : 12_000), redirect: "follow" });
    if (!response.ok) throw new Error(String(response.status));
    const type = response.headers.get("content-type") || "";
    // A sub-resource answered with an HTML page is the site's 404 screen or
    // its app shell, not the file that was asked for.
    if (/text\/html/i.test(type)) throw new Error("html");
    const body = Buffer.from(await response.arrayBuffer());
    if (!body.length) throw new Error("empty");
    const relative = localAssetPath(decoded, search);
    for (const base of [root, mirror].filter(Boolean)) {
      const destination = path.resolve(base, relative);
      if (!destination.startsWith(`${path.resolve(base)}${path.sep}`)) continue;
      await fsp.mkdir(path.dirname(destination), { recursive: true }).catch(() => {});
      await fsp.writeFile(destination, body).catch(() => {});
    }
    console.log(`RECOVERED ${decoded}`);
    const target = insideRoot(relative);
    return target ? fileAt(target) : null;
  } catch {
    recoveryFailures.set(decoded + search, Date.now());
    return null;
  }
}

// A request for a page (address bar, iframe, link) as opposed to something a
// page loads. Browsers label it; anything unlabelled that prefers HTML counts.
function isNavigation(headers) {
  const dest = headers["sec-fetch-dest"];
  if (dest) return ["document", "iframe", "frame", "embed", "object"].includes(dest) || headers["sec-fetch-mode"] === "navigate";
  return /^\s*text\/html/i.test(headers.accept || "");
}

async function findFile(requestUrl, headers = {}) {
  const [rawPath, search = ""] = String(requestUrl).split("?");
  let decoded;
  try { decoded = decodeURIComponent(rawPath); } catch { decoded = rawPath; }
  const hasExtension = Boolean(path.extname(decoded));
  const plain = insideRoot(localAssetPath(decoded, ""));

  // Loading a page always gets the page. Its query string (a cache-buster, a
  // campaign tag) must never select a captured data response that happens to
  // share the path, and must never be fetched afresh from the live site.
  if (isNavigation(headers) && !hasExtension) {
    const page = plain && await fileAt(plain);
    if (page) return page;
    const html = insideRoot(`${decoded.replace(/\/$/, "")}.html`);
    return (html && await fileAt(html)) || fileAt(path.join(root, "index.html"));
  }

  if (search) {
    const exact = insideRoot(localAssetPath(decoded, search));
    const found = (exact && await fileAt(exact))
      || await variantFromIndex(decoded, search)
      || (hasExtension && plain && await fileAt(plain))
      || await anyQueryVariant(decoded)
      || await recoverFromOrigin(decoded, search);
    if (found) return found;
  } else {
    const found = plain && await fileAt(plain);
    if (found) return found;
  }

  if (hasExtension) return search ? null : recoverFromOrigin(decoded, "");

  // Pretty URLs (/pricing) are often saved as pricing.html; a client-side
  // route without its own file belongs to the single page app.
  const html = insideRoot(`${decoded.replace(/\/$/, "")}.html`);
  return (html && await fileAt(html)) || fileAt(path.join(root, "index.html"));
}

// Content the page asked for with POST was saved under a hash of the request
// body. An unknown body gets the saved answer only when there is exactly one.
async function findPostResponse(requestUrl, body) {
  const [rawPath, search = ""] = String(requestUrl).split("?");
  let decoded;
  try { decoded = decodeURIComponent(rawPath); } catch { decoded = rawPath; }
  const exact = insideRoot(postAssetPath(decoded, search, hashBody(body)));
  const found = exact && await fileAt(exact);
  if (found) return found;

  const plain = insideRoot(localAssetPath(decoded, search));
  if (!plain) return null;
  const prefix = `${path.basename(plain)}~post-`;
  const matches = (await fsp.readdir(path.dirname(plain)).catch(() => [])).filter((name) => name.startsWith(prefix));
  return matches.length === 1 ? fileAt(path.join(path.dirname(plain), matches[0])) : null;
}

async function readBody(request, limit = 1_000_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) return null;
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

// Browsers ask for media in byte ranges and refuse to seek — Safari refuses to
// play at all — when a server ignores the Range header.
function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(String(header || "").trim());
  if (!match || (!match[1] && !match[2])) return null;
  let start = match[1] ? Number(match[1]) : size - Number(match[2]);
  let end = match[1] && match[2] ? Number(match[2]) : size - 1;
  start = Math.max(0, start);
  end = Math.min(size - 1, end);
  return start <= end ? { start, end } : "invalid";
}

const server = http.createServer(async (request, response) => {
  const method = request.method || "GET";
  // Analytics beacons and form posts have nowhere to go offline. Answer them
  // quietly so the page does not retry or log errors.
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "*" };
  if (!request.url || !["GET", "HEAD"].includes(method)) {
    if (method === "POST") {
      const body = await readBody(request).catch(() => null);
      const saved = body == null ? null : await findPostResponse(request.url, body).catch(() => null);
      if (saved) {
        const data = await fsp.readFile(saved.file);
        response.writeHead(200, { ...cors, "Content-Type": await sniffType(saved.file) || "application/json; charset=utf-8", "Content-Length": data.length, "Cache-Control": "no-store" });
        response.end(data);
        return;
      }
    } else request.resume();
    response.writeHead(204, cors).end();
    return;
  }

  // Lets the studio confirm that a port it remembers is still this server.
  if (request.url.split("?")[0] === "/__capture-studio") {
    const body = JSON.stringify({ root, pid: process.pid });
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    response.end(method === "HEAD" ? undefined : body);
    return;
  }

  const found = await findFile(request.url, request.headers).catch(() => null);
  if (!found) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
    return;
  }

  const { file, size } = found;
  const headers = {
    "Content-Type": MIME_TYPES.get(path.extname(file).toLowerCase()) || await sniffType(file) || "application/octet-stream",
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*",
  };

  const range = request.headers.range ? parseRange(request.headers.range, size) : null;
  if (range === "invalid") {
    response.writeHead(416, { ...headers, "Content-Range": `bytes */${size}` }).end();
    return;
  }

  const start = range ? range.start : 0;
  const end = range ? range.end : size - 1;
  const length = size === 0 ? 0 : end - start + 1;
  response.writeHead(range ? 206 : 200, {
    ...headers,
    "Content-Length": length,
    ...(range ? { "Content-Range": `bytes ${start}-${end}/${size}` } : {}),
  });

  if (method === "HEAD" || length === 0) {
    response.end();
    return;
  }

  const stream = fs.createReadStream(file, { start, end });
  stream.on("error", () => response.destroy());
  response.on("close", () => stream.destroy());
  stream.pipe(response);
});

server.on("error", (error) => {
  // The studio reads this line to pick another port instead of guessing.
  console.error(`LISTEN_FAILED ${error.code || error.message}`);
  process.exit(error.code === "EADDRINUSE" ? 98 : 1);
});

server.listen(port, host, () => {
  console.log(`READY http://${host}:${port}`);
  console.log(`Serving ${root}`);
});

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
