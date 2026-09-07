import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "hargita_admin_session";
const SESSION_DURATION_MS = 60 * 60 * 8 * 1000;

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

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const tokenParts = token.split(".");
  if (tokenParts.length !== 2) return null;

  const [encodedPayload, signature] = tokenParts;
  if (!encodedPayload || !signature) return null;

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
    if (payload.createdAt > now || now - payload.createdAt >= SESSION_DURATION_MS) return null;

    return { createdAt: payload.createdAt, email: payload.email };
  } catch {
    return null;
  }
}
