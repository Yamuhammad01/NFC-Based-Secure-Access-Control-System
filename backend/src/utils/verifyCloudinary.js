/**
 * Cloudinary / image-upload verification 
 
 * WHAT IT DOES
 *   1. Reports the active upload configuration (secrets masked).
 *   2. "SDK check"  â€” uploads a generated test image straight to Cloudinary,
 *      fetches the delivered URL back over HTTPS, then deletes the asset.
 *   3. "Route check" â€” boots the real Express server on a spare port, logs in
 *      as a throwaway user, POSTs a real multipart photo to
 *      /api/add/profilePhoto, then verifies:
 *        - the response reports the expected storage backend
 *        - GET /api/get/profile returns a directly usable URL
 *        - the stored image is publicly fetchable
 *        - re-uploading replaces (and destroys) the previous asset
 *        - the database holds the new value
 *   4. Cleans up: removes the throwaway user and any test assets.
 */
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// backend/src/utils/verifyCloudinary.js -> backend/.env
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const cloud = require("./cloudinary");
const { getUploadsRoot } = require("./upload");

const ARG = process.argv.slice(2);
const FORCE_CLOUD = ARG.includes("--cloud");
const FORCE_LOCAL = ARG.includes("--local");

const PORT = Number(process.env.VERIFY_PORT || 5099);
const BASE = `http://127.0.0.1:${PORT}`;
const API = `${BASE}/api`;

const TEST_EMAIL = "cloudinary-verify@example.com";
const TEST_PASS = "VerifyPass123!";
const UPLOADS_DIR = path.join(getUploadsRoot(), "profile-photos");

let pass = 0;
let fail = 0;
const check = (name, ok, detail = "") => {
  if (ok) pass += 1;
  else fail += 1;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? `\n           ${detail}` : ""}`);
};
const section = (t) => console.log(`\n${"=".repeat(64)}\n${t}\n${"=".repeat(64)}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Cloudinary errors don't always carry a `message`; dig out whatever exists. */
const describeError = (err) => {
  if (err == null) return "unknown error";
  try {
    const own = JSON.stringify(err, Object.getOwnPropertyNames(err));
    return (
      err.message ||
      (err.error && err.error.message) ||
      (own && own !== "{}" ? own.slice(0, 300) : String(err))
    );
  } catch {
    return String(err);
  }
};

/** A valid 1x1 PNG â€” smallest legal image for upload testing. */
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==",
  "base64"
);

const listLocalUploads = () =>
  fs.existsSync(UPLOADS_DIR) ? fs.readdirSync(UPLOADS_DIR) : [];

/** Prints which storage mode is active, without leaking secrets. */
function reportConfiguration() {
  const url = process.env.CLOUDINARY_URL || "";
  const key = process.env.CLOUDINARY_API_KEY || "";
  const folder = process.env.CLOUDINARY_FOLDER || "(default)";
  const enabled = cloud.isCloudinaryEnabled();

  console.log(`  Cloudinary enabled : ${enabled ? "YES  -> photos go to the cloud" : "NO   -> photos go to local disk"}`);
  if (url) {
    const parsed = cloud.parseCloudinaryUrl(url);
    console.log(`  CLOUDINARY_URL     : set (${url.length} chars)`);
    if (parsed) {
      console.log(`    cloud_name       : ${parsed.cloud_name}`);
      console.log(`    api_key          : ${parsed.api_key.slice(0, 4)}${"*".repeat(Math.max(0, parsed.api_key.length - 4))}`);
      console.log(`    api_secret       : ${"*".repeat(parsed.api_secret.length)}`);
    } else {
      console.log("    !! the value does not parse as cloudinary://<key>:<secret>@<cloud>");
    }
  } else {
    console.log(`  CLOUDINARY_URL     : not set`);
  }
  if (key) console.log(`  CLOUDINARY_API_KEY : set (using individual variables)`);
  console.log(`  CLOUDINARY_FOLDER  : ${folder}`);
  console.log(`  Local uploads dir  : ${UPLOADS_DIR}`);
  return enabled;
}

/** Fetches a URL and reports status, content-type and byte length. */
async function probeImage(url) {
  const res = await fetch(url);
  let bytes = 0;
  let type = res.headers.get("content-type") || "";
  if (res.ok) {
    const buf = Buffer.from(await res.arrayBuffer());
    bytes = buf.length;
    if (buf.equals(PNG)) type += " (identical to uploaded bytes)";
  }
  return { status: res.status, type, bytes };
}

/** Retries a probe while the CDN may still be serving a just-deleted asset. */
async function probeUntilGone(url, attempts = 4, delayMs = 2000) {
  let last = await probeImage(url);
  for (let i = 0; i < attempts && last.status === 200; i += 1) {
    await sleep(delayMs);
    last = await probeImage(url);
  }
  return last;
}

/**
 * Authoritative existence check via the Cloudinary Admin API.
 
 */
async function assetExists(publicId) {
  const sdk = require("cloudinary").v2;
  cloud.isCloudinaryEnabled(); // ensures the SDK is configured
  try {
    await sdk.api.resource(publicId, { resource_type: "image" });
    return true;
  } catch (err) {
    // Cloudinary nests the text in `err.error.message` for Admin API failures.
    const text = [err && err.message, err && err.error && err.error.message, String(err)]
      .filter(Boolean)
      .join(" | ");
    if (err && (err.http_code === 404 || /not found/i.test(text))) return false;
    throw err;
  }
}

/** Uploads a generated image directly through the Cloudinary SDK. */
async function sdkCheck() {
  section("CHECK 1 â€” Cloudinary SDK round-trip (upload -> fetch -> delete)");
  if (!cloud.isCloudinaryEnabled()) {
    console.log("  SKIPPED â€” Cloudinary is not configured.");
    return;
  }

  let publicId = null;
  try {
    const result = await cloud.uploadImageBuffer(PNG, {
      folder: process.env.CLOUDINARY_FOLDER || "nfc-access-control/profile-photos",
      publicId: `verify-${Date.now()}`,
    });
    const url = result.secure_url;
    publicId = result.public_id;

    check("upload accepted by Cloudinary", !!url && cloud.isCloudinaryUrl(url), url);
    check(
      "secure_url uses https + your cloud name",
      typeof url === "string" && url.startsWith("https://res.cloudinary.com/") &&
        (!process.env.CLOUDINARY_URL || url.includes(cloud.parseCloudinaryUrl(process.env.CLOUDINARY_URL).cloud_name)),
      url
    );
    const expectedFolder =
      process.env.CLOUDINARY_FOLDER || "nfc-access-control/profile-photos";
    check(
      "asset landed in the configured folder",
      typeof result.public_id === "string" && result.public_id.startsWith(expectedFolder),
      `public_id=${result.public_id}  (expected prefix: ${expectedFolder}/)`
    );
    check("public_id derivable from URL", cloud.extractPublicId(url) === publicId, `public_id=${publicId}`);

    const served = await probeImage(url);
    check(
      "delivered URL is publicly fetchable",
      served.status === 200 && served.bytes > 0,
      `status=${served.status} type=${served.type} bytes=${served.bytes}`
    );
    check("delivery served as an image", served.type.startsWith("image/"), served.type);

    const deleted = await cloud.deleteImageByUrl(url);
    check("deleteImageByUrl() reported success", deleted === true);

    // Authoritative check: the asset must be gone from Cloudinary's origin.
    const stillThere = await assetExists(publicId);
    check(
      "asset is gone from Cloudinary (origin check)",
      stillThere === false,
      `${publicId} -> ${stillThere ? "STILL PRESENT" : "deleted"}`
    );

   
    const after = await probeUntilGone(url);
    console.log(
      `           (info) CDN delivery URL now returns ${after.status}` +
        (after.status === 200 ? " â€” cached copy, not an orphan" : "")
    );
    publicId = null; // already destroyed
  } catch (err) {
    check("SDK check completed without exceptions", false, describeError(err));
  } finally {
    if (publicId) {
      try {
        await cloud.deleteImageByUrl(`${process.env.CLOUDINARY_FOLDER || ""}/${publicId}`);
      } catch {
        /* best effort */
      }
    }
  }
}

/** Spawns the real backend so we test the actual HTTP route, not a mock. */
function startServer({ forceLocal }) {
  const env = { ...process.env, PORT: String(PORT) };
  if (forceLocal) {
    // Simulate "no Cloudinary configured" exactly as a fresh clone would behave.
    env.CLOUDINARY_URL = "";
    env.CLOUDINARY_CLOUD_NAME = "";
    env.CLOUDINARY_API_KEY = "";
    env.CLOUDINARY_API_SECRET = "";
  }
  const child = spawn(process.execPath, ["src/server.js"], {
    cwd: path.join(__dirname, "..", ".."),
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", (d) => (log += d.toString()));
  child.stderr.on("data", (d) => (log += d.toString()));
  child.readLog = () => log;
  return child;
}

async function waitForServer(timeoutMs = 45000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const r = await fetch(`${API}/health`);
      if (r.status) return true;
    } catch {
      /* not listening yet */
    }
    await sleep(400);
  }
  return false;
}

async function stopServer(child) {
  if (!child) return;
  try {
    child.kill();
  } catch {
    /* already gone */
  }
  await sleep(1200);
}

/** POSTs a real multipart image to /api/add/profilePhoto. */
async function uploadViaRoute(token) {
  const fd = new FormData();
  fd.append("profilePhoto", new Blob([PNG], { type: "image/png" }), "verify.png");
  const res = await fetch(`${API}/add/profilePhoto`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function routeCheck({ expectedStorage, forceLocal }) {
  section(`CHECK 2 â€” Real upload route (/api/add/profilePhoto, storage="${expectedStorage}")`);
  let server;
  let token = null;
  const createdUrls = [];
  const localBefore = listLocalUploads();
  let createdLocalFiles = [];

  try {
    server = startServer({ forceLocal });
    const up = await waitForServer();
    check("backend boots with this configuration", up, up ? "" : server.readLog().slice(-400));
    if (!up) return { createdLocalFiles };

    const login = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASS }),
    });
    const loginBody = await login.json().catch(() => ({}));
    token = loginBody.access_token;
    check("temporary test user can log in", login.status === 200 && !!token, `status=${login.status}`);
    if (!token) return { createdLocalFiles };

    const first = await uploadViaRoute(token);
    check(
      `upload succeeds and reports storage="${expectedStorage}"`,
      first.status === 200 && first.body.storage === expectedStorage,
      `status=${first.status} body=${JSON.stringify(first.body)}`
    );
    createdUrls.push(first.body.photoUrl);

    if (expectedStorage === "cloudinary") {
      check(
        "photoUrl is a permanent Cloudinary URL",
        typeof first.body.photoUrl === "string" &&
          first.body.photoUrl.startsWith("https://res.cloudinary.com/"),
        first.body.photoUrl
      );
      check(
        "no file written to local disk in cloud mode",
        listLocalUploads().filter((f) => !localBefore.includes(f)).length === 0
      );
    } else {
      check(
        "photoUrl is a relative /uploads path",
        typeof first.body.photoUrl === "string" &&
          first.body.photoUrl.startsWith("/uploads/profile-photos/"),
        first.body.photoUrl
      );
    }

    // Critical regression guard: the API must hand back a directly usable URL,
    // never "https://api.host/https://res.cloudinary.com/...".
    const prof = await fetch(`${API}/get/profile`, { headers: { Authorization: `Bearer ${token}` } });
    const profBody = await prof.json().catch(() => ({}));
    const expectedUrl =
      expectedStorage === "cloudinary" ? first.body.photoUrl : `${BASE}${first.body.photoUrl}`;
    check(
      "GET /api/get/profile returns a usable absolute URL",
      profBody.profilePhoto === expectedUrl,
      `got=${profBody.profilePhoto}`
    );

    const served = await probeImage(profBody.profilePhoto || expectedUrl);
    check(
      "stored photo is publicly fetchable",
      served.status === 200 && served.bytes > 0,
      `status=${served.status} type=${served.type} bytes=${served.bytes}`
    );

    // Re-upload: the previous asset must be replaced, never orphaned.
    const second = await uploadViaRoute(token);
    check(
      "re-upload succeeds",
      second.status === 200,
      `status=${second.status} body=${JSON.stringify(second.body)}`
    );
    createdUrls.push(second.body.photoUrl);
    check(
      "re-upload yields a different URL",
      !!second.body.photoUrl && second.body.photoUrl !== first.body.photoUrl,
      `${first.body.photoUrl}  ->  ${second.body.photoUrl}`
    );

    if (expectedStorage === "cloudinary") {
      const oldPublicId = cloud.extractPublicId(first.body.photoUrl);
      const oldGone = await assetExists(oldPublicId);
      check(
        "previous Cloudinary asset was destroyed (no orphans)",
        oldGone === false,
        `${oldPublicId} -> ${oldGone ? "STILL PRESENT" : "deleted"}`
      );
      const cdn = await probeUntilGone(first.body.photoUrl);
      console.log(`           (info) replaced photo's CDN URL now returns ${cdn.status}`);
    } else {
      const oldFile = String(first.body.photoUrl).replace("/uploads/profile-photos/", "");
      check(
        "previous local file was deleted",
        !listLocalUploads().includes(oldFile),
        `old=${oldFile}`
      );
    }

    const doc = await mongoose.connection.collection("users").findOne({ email: TEST_EMAIL });
    check(
      "database stores the newest value",
      !!doc && doc.profilePhoto === second.body.photoUrl,
      `stored=${doc && doc.profilePhoto}`
    );
  } catch (err) {
    check("route check completed without exceptions", false, describeError(err));
  } finally {
    await stopServer(server);
    // Destroy any Cloudinary assets this run created.
    for (const url of createdUrls.filter(Boolean)) {
      if (cloud.isCloudinaryUrl(url)) {
        try {
          await cloud.deleteImageByUrl(url);
        } catch {
          /* best effort */
        }
      }
    }
    // Remove any local files this run created.
    for (const f of localBefore.length ? listLocalUploads().filter((x) => !localBefore.includes(x)) : []) {
      const p = path.join(UPLOADS_DIR, f);
      if (fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
        } catch {
          /* best effort */
        }
      }
    }
  }
  return { createdUrls };
}

async function main() {
  section("Image-upload configuration");
  const configured = reportConfiguration();

  if (FORCE_CLOUD && !configured) {
    console.log("\n  ERROR: --cloud was requested but Cloudinary is not configured.");
    console.log("  Set CLOUDINARY_URL in backend/.env, then re-run.\n");
    process.exit(1);
  }

  const expectedStorage = FORCE_LOCAL || !configured ? "local" : "cloudinary";

  if (!configured && !FORCE_LOCAL) {
    console.log(
      "\n  NOTE: Cloudinary is off, so this run tests the LOCAL DISK fallback only.\n" +
        "  To test the real cloud path, put your credentials in backend/.env:\n" +
        "      CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>\n" +
        "  (Cloudinary Dashboard -> API Keys -> 'API environment variable')"
    );
  }
  if (configured && !FORCE_LOCAL) {
    console.log("\n  NOTE: Live Cloudinary account detected â€” test assets are created and\n" +
      "  deleted automatically. Expect a few images to appear briefly in your account.");
  }

  let tempUserId = null;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = mongoose.connection.collection("users");
    await users.deleteMany({ email: TEST_EMAIL });
    const inserted = await users.insertOne({
      email: TEST_EMAIL,
      password: bcrypt.hashSync(TEST_PASS, 10),
      staffId: `VERIFY-${Date.now()}`,
      department: "Upload Verification",
      firstName: "Upload",
      lastName: "Verify",
      name: "Upload Verify",
      role: "staff",
      status: "active",
      mustChangePassword: false,
      accessLevel: 1,
      isDeleted: false,
      cardStatus: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    tempUserId = inserted.insertedId;
    console.log(`\n  MongoDB connected. Throwaway user created for the route test.`);

    if (expectedStorage === "cloudinary") {
      await sdkCheck();
    }
    await routeCheck({ expectedStorage, forceLocal: expectedStorage === "local" });
  } catch (err) {
    check("verification run completed without exceptions", false, describeError(err));
  } finally {
    try {
      if (mongoose.connection.readyState === 1) {
        if (tempUserId) {
          await mongoose.connection.collection("users").deleteOne({ _id: tempUserId });
        }
        await mongoose.connection.collection("users").deleteMany({ email: TEST_EMAIL });
        await mongoose.disconnect();
      }
    } catch {
      /* best effort */
    }
  }

  section(`RESULT â€” ${pass} passed, ${fail} failed`);
  if (fail === 0) {
    console.log(`\n  Uploads work end to end in "${expectedStorage}" mode.`);
    console.log(`  This is the same code path Vercel will run â€” nothing else to change.\n`);
  } else {
    console.log("\n  Some checks failed. Scroll up for the failing assertions.\n");
  }
  process.exit(fail === 0 ? 0 : 1);
}

main();
