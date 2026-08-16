import type { RoleBrief, WorkflowAuditEvent } from "../domain/types";

const storageKey = "nexus-hire-role-briefs-v1";
const auditStorageKey = "nexus-hire-role-brief-audit-v1";
let inMemoryRoles: RoleBrief[] = [];

function canUseStorage(): boolean {
  return typeof window !== "undefined" && "localStorage" in window;
}

function readAll(): RoleBrief[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    return rawValue ? (JSON.parse(rawValue) as RoleBrief[]) : inMemoryRoles;
  } catch {
    return inMemoryRoles;
  }
}

export function saveRole(role: RoleBrief): RoleBrief {
  if (!canUseStorage()) {
    return role;
  }

  const roles = readAll();
  const existingIndex = roles.findIndex((item) => item.id === role.id);
  const nextRoles = [...roles];

  if (existingIndex >= 0) {
    nextRoles[existingIndex] = role;
  } else {
    nextRoles.unshift(role);
  }

  inMemoryRoles = nextRoles;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(nextRoles));
  } catch {
    // Some embedded browser contexts block localStorage. The active local session still works.
  }

  return role;
}

export function getRole(roleId: string): RoleBrief | null {
  return readAll().find((item) => item.id === roleId) ?? null;
}

export function listRoles(): RoleBrief[] {
  return readAll();
}

export function appendAuditEvent(event: WorkflowAuditEvent): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    const rawValue = window.localStorage.getItem(auditStorageKey);
    const events = rawValue ? (JSON.parse(rawValue) as WorkflowAuditEvent[]) : [];
    window.localStorage.setItem(auditStorageKey, JSON.stringify([event, ...events]));
  } catch {
    // Audit persistence is non-blocking in the local demo.
  }
}
