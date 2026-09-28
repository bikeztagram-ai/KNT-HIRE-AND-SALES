import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const required = [
  "knt-logo-real.webp",
  "manifest.webmanifest",
  "stock/mitsubishi-grendia-20.webp",
  "stock/mitsubishi-fg25.webp"
];

function isValidMedia(file, relative) {
  const data = fs.readFileSync(file);
  if (data.length < 80) return false;
  if (relative.endsWith(".webp")) return data.subarray(0, 4).toString("ascii") === "RIFF" && data.subarray(8, 12).toString("ascii") === "WEBP";
  if (relative.endsWith(".png")) return data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (relative.endsWith(".jpg") || relative.endsWith(".jpeg")) return data.subarray(0, 2).equals(Buffer.from([255,216]));
  if (relative.endsWith(".svg")) return data.toString("utf8").includes("<svg");
  return true;
}

const missing = required.filter(p => !fs.existsSync(path.join(publicDir, p)));
if (missing.length) {
  console.error("Public asset smoke failed. Missing:");
  for (const item of missing) console.error(" - " + item);
  process.exit(1);
}
for (const item of required) {
  const file = path.join(publicDir, item);
  if (!isValidMedia(file, item)) throw new Error("Invalid or corrupt public asset: " + item);
}

const site = fs.readFileSync(path.join(root, "src/PublicSite.jsx"), "utf8");
for (const match of site.matchAll(/["'](\/[^"']+\.(?:svg|webp|png|jpg|jpeg))["']/g)) {
  const asset = match[1].replace(/^\//, "");
  const file = path.join(publicDir, asset);
  if (!fs.existsSync(file)) throw new Error("PublicSite references missing asset: " + match[1]);
  if (!isValidMedia(file, asset)) throw new Error("PublicSite references corrupt asset: " + match[1]);
}

const css = fs.readFileSync(path.join(root, "src/public-site.css"), "utf8");
for (const match of css.matchAll(/url\(["']?(\/[^"')]+\.(?:svg|webp|png|jpg|jpeg))["']?\)/g)) {
  const asset = match[1].replace(/^\//, "");
  const file = path.join(publicDir, asset);
  if (!fs.existsSync(file)) throw new Error("CSS references missing asset: " + match[1]);
  if (!isValidMedia(file, asset)) throw new Error("CSS references corrupt asset: " + match[1]);
}

console.log("Public asset smoke passed: required, JSX and CSS media are present and structurally valid.");
