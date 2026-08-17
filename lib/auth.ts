import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setAuditActor } from "@/lib/audit-context";

const SESSION_COOKIE = "hargita_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;
const SESSION_DURATION_MS = SESSION_DURATION_SECONDS * 1000;

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export async function createSession(email: string) {
  const payload = JSON.stringify({
    email,
    createdAt: Date.now(),
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = sign(encodedPayload);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, `${encodedPayload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const tokenParts = token.split(".");

  if (tokenParts.length !== 2) {
    return null;
  }

  const [encodedPayload, signature] = tokenParts;

  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = sign(encodedPayload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as unknown;

    if (
      !payload
      || typeof payload !== "object"
      || !("email" in payload)
      || typeof payload.email !== "string"
      || !payload.email
      || !("createdAt" in payload)
      || typeof payload.createdAt !== "number"
      || !Number.isFinite(payload.createdAt)
    ) {
      return null;
    }

    const now = Date.now();

    if (payload.createdAt > now || now - payload.createdAt >= SESSION_DURATION_MS) {
      return null;
    }

    return {
      createdAt: payload.createdAt,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

/**
 * Authorization boundary for every admin Server Action.
 * Page-level protection is not sufficient because Server Actions can be
 * invoked independently of the page that renders their form.
 */
export async function requireAdmin(options?: { allowRequiredPasswordChange?: boolean }) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.email },
    select: { email: true, mustChangePassword: true, role: true },
  });

  if (!user) {
    redirect("/admin");
  }

  if (user.mustChangePassword && !options?.allowRequiredPasswordChange) {
    redirect("/admin/jelszocsere");
  }

  setAuditActor({ email: user.email, role: user.role });

  return user;
}
