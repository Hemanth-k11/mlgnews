import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";

// Images are stored one of two ways:
//   • Cloudinary  — if CLOUDINARY_CLOUD_NAME + CLOUDINARY_UPLOAD_PRESET are set
//                   (required in production / on Vercel, where the disk is not persistent)
//   • local disk  — otherwise: written to /public/uploads, served at /uploads/<name>
//                   (fine for local development and a single long-running server)
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const EXT_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;
const useCloudinary = Boolean(CLOUD_NAME && UPLOAD_PRESET);

// Accepts a web File (from formData.get("file")). Returns { url } or { error }.
// maxBytes lets callers tighten the limit (e.g. profile photos).
export async function saveUpload(file, maxBytes = MAX_BYTES) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return { error: "Choose an image file to upload." };
  }
  if (!EXT_BY_TYPE[file.type]) {
    return { error: "Use a JPG, PNG, WebP, GIF or AVIF image." };
  }
  if (file.size > maxBytes) {
    const label =
      maxBytes >= 1024 * 1024
        ? `${(maxBytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")} MB`
        : `${Math.round(maxBytes / 1024)} KB`;
    return { error: `Image must be ${label} or smaller.` };
  }

  return useCloudinary ? saveToCloudinary(file) : saveToDisk(file);
}

async function saveToCloudinary(file) {
  try {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: form }
    );
    if (!res.ok) {
      return { error: "The image host rejected the upload — check your Cloudinary settings." };
    }
    const data = await res.json();
    return { url: data.secure_url };
  } catch {
    return { error: "Could not reach the image host. Try again." };
  }
}

async function saveToDisk(file) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = EXT_BY_TYPE[file.type];
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${name}` };
}

// Removes a locally stored file. Cloudinary assets are left in place
// (deleting those needs the signed Admin API — not worth it for v1).
export async function deleteUpload(url) {
  if (typeof url === "string" && url.startsWith("/uploads/")) {
    try {
      await unlink(path.join(process.cwd(), "public", url));
    } catch {
      /* already gone — fine */
    }
  }
}
