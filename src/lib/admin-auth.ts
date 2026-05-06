const ADMIN_USERNAME = "urban media";
const ADMIN_PASSWORD = "roshan";
export const COOKIE_NAME = "admin-session";

const SECRET = process.env.ADMIN_SECRET || "admin-secret-roshan-adfix";
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// Hash password with SHA-256 for constant-time comparison
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "adfix-admin-salt-v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Constant-time string comparison
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const expectedHash = await hashPassword(ADMIN_PASSWORD);
  const providedHash = await hashPassword(password);
  return username === ADMIN_USERNAME && timingSafeEqual(expectedHash, providedHash);
}

// Simple signed token: timestamp.signature (HMAC-SHA256)
// Works in both Node.js and Edge Runtime
async function signData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SECRET);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifySignature(data: string, signatureHex: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SECRET);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const signature = new Uint8Array(signatureHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
    return await crypto.subtle.verify("HMAC", cryptoKey, signature, encoder.encode(data));
  } catch {
    return false;
  }
}

export async function createAdminSession(): Promise<string> {
  const timestamp = Date.now();
  const signature = await signData(String(timestamp));
  return `${timestamp}.${signature}`;
}

export async function verifyAdminSession(token: string): Promise<boolean> {
  try {
    const [timestampStr, signature] = token.split(".");
    if (!timestampStr || !signature) return false;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;
    if (Date.now() - timestamp > SESSION_TTL_MS) return false;

    return await verifySignature(timestampStr, signature);
  } catch {
    return false;
  }
}
