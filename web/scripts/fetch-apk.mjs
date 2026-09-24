// Copies the Android app from the latest GitHub release into the built site (dist/ojt-track.apk),
// so "Download App" downloads from this website instead of opening github.com.
// Runs after `vite build` on Vercel (or when FETCH_APK=1). A failed download fails the build,
// which keeps the previous deployment (with its working download) live.
import { createWriteStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

if (!process.env.VERCEL && !process.env.FETCH_APK) {
  console.log("fetch-apk: skipped (not a Vercel build)");
  process.exit(0);
}

const url =
  process.env.APK_SOURCE_URL ||
  "https://github.com/migs-tech/ojt-track/releases/latest/download/ojt-track.apk";
const out = new URL("../dist/ojt-track.apk", import.meta.url);

if (!existsSync(new URL("../dist/", import.meta.url))) {
  console.error("fetch-apk: dist/ not found; run vite build first");
  process.exit(1);
}

const res = await fetch(url, { redirect: "follow" });
if (!res.ok || !res.body) {
  console.error(`fetch-apk: download failed (${res.status}) from ${url}`);
  process.exit(1);
}
await pipeline(Readable.fromWeb(res.body), createWriteStream(out));

const { size } = await stat(out);
if (size < 1_000_000) {
  console.error(`fetch-apk: file is too small (${size} bytes); not an APK?`);
  process.exit(1);
}
console.log(`fetch-apk: saved dist/ojt-track.apk (${(size / 1048576).toFixed(1)} MB)`);
