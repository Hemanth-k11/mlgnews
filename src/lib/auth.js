import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-only-change-me-to-a-32+char-random-string"
);

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// Create a signed cookie that keeps the user logged in for 7 days.
export async function createSession(user) {
  const token = await new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function destroySession() {
  cookies().delete(COOKIE_NAME);
}

// Returns { id, email, name, role } or null.
export async function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

// ---------- Reader sessions ----------
// A separate cookie from the admin session above, so a reader signed in on
// the public site and a staff member signed in on /admin don't collide.

const READER_COOKIE_NAME = "reader_session";

export async function createReaderSession(reader) {
  const token = await new SignJWT({
    email: reader.email,
    name: reader.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(reader.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  cookies().set(READER_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function destroyReaderSession() {
  cookies().delete(READER_COOKIE_NAME);
}

// Returns { id, email, name } or null.
export async function getReaderSession() {
  const token = cookies().get(READER_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}
