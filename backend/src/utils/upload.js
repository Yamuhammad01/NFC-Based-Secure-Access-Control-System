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
 *
 * Never throws: a failure to create the dir must NOT crash the server at
 * startup (the exact bug that killed the app on Vercel).
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

module.exports = { getUploadsRoot, getUploadSubdir };