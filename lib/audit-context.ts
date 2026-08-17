import { AsyncLocalStorage } from "node:async_hooks";

export type AuditActor = { email: string; role: string };

const auditActorStorage = new AsyncLocalStorage<AuditActor>();

export function setAuditActor(actor: AuditActor) {
  auditActorStorage.enterWith(actor);
}

export function getAuditActor() {
  return auditActorStorage.getStore();
}
