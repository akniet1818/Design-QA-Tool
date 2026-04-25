import { v4 as uuidv4 } from "uuid";

// Anchored to globalThis so Turbopack HMR module reloads don't wipe the Map
declare global { var __dqa_sessions: Map<string, { url: string; cookies: string }> | undefined; }
if (!globalThis.__dqa_sessions) globalThis.__dqa_sessions = new Map();
const sessions = globalThis.__dqa_sessions;

export function createSession(url: string, cookies: string): string {
  const id = uuidv4();
  sessions.set(id, { url, cookies });
  const t = setTimeout(() => sessions.delete(id), 60 * 60 * 1000);
  t.unref?.();
  return id;
}

export function getSession(id: string) {
  return sessions.get(id) ?? null;
}
