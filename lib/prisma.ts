import { PrismaClient } from "@prisma/client";
import { getAuditActor } from "@/lib/audit-context";
import { getAdminSession } from "@/lib/admin-session";

const mutationActions: Record<string, string | undefined> = {
  create: "CREATE",
  createMany: "CREATE",
  createManyAndReturn: "CREATE",
  delete: "DELETE",
  deleteMany: "DELETE",
  update: "UPDATE",
  updateMany: "UPDATE",
  updateManyAndReturn: "UPDATE",
  upsert: "UPDATE",
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function getEntityLabel(args: unknown, result: unknown) {
  const argumentRecord = asRecord(args);
  const data = asRecord(argumentRecord?.data);
  const where = asRecord(argumentRecord?.where);
  const resultRecord = asRecord(result);
  for (const key of ["title", "name", "email", "slug", "location", "id"]) {
    const value = resultRecord?.[key] ?? data?.[key] ?? where?.[key];
    if (typeof value === "string" && value.trim()) return value.slice(0, 200);
  }
  return undefined;
}

function getSafeDetails(args: unknown) {
  const argumentRecord = asRecord(args);
  const data = asRecord(argumentRecord?.data);
  const where = asRecord(argumentRecord?.where);
  const changedFields = data ? Object.keys(data).filter((key) => !["password", "passwordHash"].includes(key)) : [];
  const targetId = typeof where?.id === "string" ? where.id : undefined;
  const details = {
    ...(changedFields.length > 0 ? { changedFields } : {}),
    ...(targetId ? { targetId } : {}),
  };
  return Object.keys(details).length > 0 ? JSON.stringify(details) : undefined;
}

async function resolveAuditActor(baseClient: PrismaClient) {
  const contextActor = getAuditActor();
  if (contextActor) return contextActor;

  try {
    const session = await getAdminSession();
    if (!session) return undefined;

    const user = await baseClient.user.findUnique({
      where: { email: session.email },
      select: { email: true, role: true },
    });

    return user ? { email: user.email, role: user.role } : undefined;
  } catch {
    return undefined;
  }
}

function createPrismaClient() {
  const baseClient = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, model, operation, query }) {
          const result = await query(args);
          const action = mutationActions[operation];

          if (action && model !== "AuditLog") {
            try {
              const actor = await resolveAuditActor(baseClient);
              if (!actor) return result;

              await baseClient.auditLog.create({
                data: {
                  action,
                  actorEmail: actor.email,
                  actorRole: actor.role,
                  details: getSafeDetails(args),
                  entityLabel: getEntityLabel(args, result),
                  entityType: model,
                },
              });
            } catch (error) {
              console.error("Az auditnapló bejegyzése sikertelen:", error);
            }
          }
          return result;
        },
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;
const globalForPrisma = globalThis as unknown as { prisma?: ExtendedPrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function recordFileAudit(action: "CREATE" | "UPDATE" | "DELETE", entityType: string, entityLabel?: string) {
  let actor = getAuditActor();

  if (!actor) {
    try {
      const session = await getAdminSession();
      if (session) {
        const user = await prisma.user.findUnique({
          where: { email: session.email },
          select: { email: true, role: true },
        });
        actor = user ? { email: user.email, role: user.role } : undefined;
      }
    } catch {
      actor = undefined;
    }
  }

  if (!actor) return;
  await prisma.auditLog.create({
    data: { action, actorEmail: actor.email, actorRole: actor.role, entityLabel, entityType },
  });
}
