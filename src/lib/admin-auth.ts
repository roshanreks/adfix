import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const ADMIN_USERNAME = "urban media";
const ADMIN_PASSWORD = "roshan";
const COOKIE_NAME = "admin-session";

// Generate a secret from the password (or env var)
function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SECRET || `admin-secret-${ADMIN_PASSWORD}-adfix`;
  return new TextEncoder().encode(secret);
}

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

export async function createAdminSession(): Promise<string> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(getSecret());
  return token;
}

export async function verifyAdminSession(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      clockTolerance: 60,
    });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function getAdminSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getAdminSessionCookie();
  if (!token) return false;
  return verifyAdminSession(token);
}

export function setAdminSessionCookie(token: string): void {
  // This must be called in a Route Handler where cookies() is writable
  // We'll set cookies directly in the route handlers
}

export { COOKIE_NAME };
