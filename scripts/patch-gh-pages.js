/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const outDir = path.join(projectRoot, "web-build");

function loadEnvFile(fileName) {
  const envPath = path.join(projectRoot, fileName);
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    value = value.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
    if (process.env[key] == null) process.env[key] = value;
  }
}

function normalizeBasePath(input) {
  if (!input) return "";
  let base = input.trim();
  if (!base || base === "/") return "";
  if (!base.startsWith("/")) base = `/${base}`;
  base = base.replace(/\/+$/, "");
  return base;
}

// Ensure this script sees the same env vars as `expo export`.
loadEnvFile(".env");
loadEnvFile(".env.production");

const basePath = normalizeBasePath(process.env.EXPO_PUBLIC_WEB_BASE_PATH);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function patchTextFile(filePath, patcher) {
  const before = fs.readFileSync(filePath, "utf8");
  const after = patcher(before);
  if (after !== before) fs.writeFileSync(filePath, after);
}

function ensureNoJekyll() {
  const file = path.join(outDir, ".nojekyll");
  if (!fs.existsSync(file)) fs.writeFileSync(file, "");
}

function ensure404Fallback() {
  const indexFile = path.join(outDir, "index.html");
  const notFound = path.join(outDir, "404.html");
  if (fs.existsSync(indexFile)) {
    fs.copyFileSync(indexFile, notFound);
  }
}

function prefixAbsoluteUrls(htmlOrJs) {
  if (!basePath) return htmlOrJs;

  // 1) src/href attributes like src="/foo" -> src="/base/foo"
  let out = htmlOrJs.replace(/\b(href|src)=\"\/(?!\/)/g, `$1=\"${basePath}/`);

  // 2) JSON/string references to /_expo/* inside JS bundles
  out = out.replace(/\"\/_expo\//g, `\"${basePath}/_expo/`);

  return out;
}

function run() {
  if (!fs.existsSync(outDir)) {
    console.warn("web-build not found, skipping patch");
    return;
  }

  ensureNoJekyll();
  ensure404Fallback();

  const files = walk(outDir);
  for (const file of files) {
    if (file.endsWith(".html") || file.endsWith(".js")) {
      patchTextFile(file, prefixAbsoluteUrls);
    }
  }

  console.log(`GitHub Pages patch applied. basePath=${basePath || "(root)"}`);
}

run();
