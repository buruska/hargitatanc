import { cookies, headers } from "next/headers";
import { createHmac } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setAuditActor } from "@/lib/audit-context";
import { getAdminSession } from "@/lib/admin-session";

const SESSION_COOKIE = "hargita_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

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

  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",", 1)[0]?.trim().toLowerCase();
  const originProtocol = (() => {
    try {
      return new URL(requestHeaders.get("origin") ?? "").protocol.replace(":", "").toLowerCase();
    } catch {
      return undefined;
    }
  })();
  const isHttps = (forwardedProtocol ?? originProtocol) === "https";

  cookieStore.set(SESSION_COOKIE, `${encodedPayload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export { getAdminSession } from "@/lib/admin-session";

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
