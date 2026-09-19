/**
 * Cloudinary integration for persistent image uploads.
 *
 * Configuration (env):
 *   CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
 *      OR the individual vars:
 *   CLOUDINARY_CLOUD_NAME=...
 *   CLOUDINARY_API_KEY=...
 *   CLOUDINARY_API_SECRET=...
 *
 * If none are set, isCloudinaryEnabled() returns false and callers fall back
 * to local disk storage (development behaviour is unchanged).
 */
const cloudinary = require("cloudinary").v2;

let configured = false;

/** Parses `cloudinary://key:secret@cloud` into config parts. */
function parseCloudinaryUrl(url) {
  try {
    const parsed = new URL(url);
    const cloudName = parsed.hostname;
    const apiKey = decodeURIComponent(parsed.username || "");
    const apiSecret = decodeURIComponent(parsed.password || "");
    if (!cloudName || !apiKey || !apiSecret) return null;
    return { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret };
  } catch {
    return null;
  }
}

/** Reads credentials from env (either form). Returns null when absent. */
function readCredentials() {
  const { CLOUDINARY_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;

  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    return {
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    };
  }
  if (CLOUDINARY_URL) {
    return parseCloudinaryUrl(CLOUDINARY_URL);
  }
  return null;
}

/** True when Cloudinary credentials are present and usable. */
function isCloudinaryEnabled() {
  if (configured) return true;
  const creds = readCredentials();
  if (!creds) return false;
  cloudinary.config({ ...creds, secure: true });
  configured = true;
  return true;
}

/** True when a stored value is already a Cloudinary asset URL. */
function isCloudinaryUrl(url) {
  return typeof url === "string" && url.includes("res.cloudinary.com/");
}

/**
 * Extracts the public_id from a Cloudinary delivery URL so the asset can be
 * destroyed later.
 * https://res.cloudinary.com/<cloud>/image/upload/v1712/folder/name.jpg
 *   -> folder/name
 */
function extractPublicId(url) {
  if (!isCloudinaryUrl(url)) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?(?:[?#].*)?$/);
  return match ? match[1] : null;
}

/** Streams an in-memory buffer to Cloudinary and resolves with the result. */
async function uploadImageBuffer(buffer, { folder, publicId, transformation } = {}) {
  if (!isCloudinaryEnabled()) {
    throw new Error("Cloudinary is not configured");
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        overwrite: true,
        // Keep uploads small/fast: cap at 800x800 and let Cloudinary optimise.
        transformation: transformation || [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}

/**
 * Deletes a previously stored photo from Cloudinary.
 * Never throws: a failed cleanup must not break the upload response.
 */
async function deleteImageByUrl(url) {
  if (!isCloudinaryUrl(url) || !isCloudinaryEnabled()) return false;
  const publicId = extractPublicId(url);
  if (!publicId) return false;
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      // Ask Cloudinary to purge CDN-cached copies immediately. Without this the
      // deleted asset can keep being served from the edge for a while, which
      // matters when a photo is deliberately replaced or removed.
      invalidate: true,
    });
    return result && (result.result === "ok" || result.result === "not found");
  } catch (err) {
    // Cloudinary nests Admin/Upload API messages in `err.error.message`.
    const detail =
      (err && err.message) || (err && err.error && err.error.message) || String(err);
    console.error(`[cloudinary] Failed to delete "${publicId}":`, detail);
    return false;
  }
}

module.exports = {
  isCloudinaryEnabled,
  isCloudinaryUrl,
  extractPublicId,
  uploadImageBuffer,
  deleteImageByUrl,
  parseCloudinaryUrl,
};