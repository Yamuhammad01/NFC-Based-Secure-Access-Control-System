const path = require("path");
const fs = require("fs");

/**
 * Resolves the writable uploads root directory.
 * - Local dev:  <backend>/uploads
 * - Vercel:     /tmp/uploads  — Vercel serverless functions mount the code at
 *               /var/task (read-only) and only /tmp is writable/ephemeral.
 */
function getUploadsRoot() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "uploads");
  }
  return path.join(__dirname, "..", "..", "uploads");
}

/**
 * Returns (and ensures) a subdirectory inside the uploads root,
 * e.g. getUploadSubdir("profile-photos") -> <root>/profile-photos.
 
 */
function getUploadSubdir(subDir) {
  const dir = path.join(getUploadsRoot(), subDir);
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (err) {
    console.error(`[upload] Could not create uploads dir "${dir}":`, err.message);
  }
  return dir;
}

/**
 * True for values that are already fully qualified URLs (Cloudinary assets,
 * external links, data URIs) 
 */
function isRemoteUrl(value) {
  return (
    typeof value === "string" &&
    (/^https?:\/\//i.test(value) || /^\/\//.test(value) || value.startsWith("data:"))
  );
}

/**
 * Resolves a stored `profilePhoto` value into a URL the browser can load.
 *
 * - Legacy/disk storage: value is a relative path ("/uploads/profile-photos/x.jpg")
 *   -> prefixed with the request's protocol + host (unchanged behaviour).
 * - Cloudinary storage: value is already "https://res.cloudinary.com/..."
 *   -> returned as-is (prevents "https://api.host/https://res.cloudinary.com/...").
 */
function resolvePhotoUrl(req, stored) {
  if (!stored) return null;
  if (isRemoteUrl(stored)) return stored;
  const base = `${req.protocol}://${req.get("host")}`;
  return stored.startsWith("/") ? `${base}${stored}` : `${base}/${stored}`;
}

module.exports = { getUploadsRoot, getUploadSubdir, isRemoteUrl, resolvePhotoUrl };