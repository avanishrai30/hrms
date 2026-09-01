"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

const DB_PREFIX = "vc_wms_offline_";

export interface QueuedOfflineAction {
  id: string;
  endpoint: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  payload: any;
  queuedAt: string;
  status: "PENDING" | "SYNCING" | "FAILED";
}

export function saveOfflineData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const item = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(`${DB_PREFIX}${key}`, JSON.stringify(item));
  } catch {
    // Storage full or unavailable
  }
}

export function getOfflineData<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${DB_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.data as T;
  } catch {
    return null;
  }
}

export function removeOfflineData(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${DB_PREFIX}${key}`);
}

export function queueOfflineAction(endpoint: string, method: "POST" | "PUT" | "PATCH" | "DELETE", payload: any): QueuedOfflineAction {
  const queue = getOfflineQueue();
  const action: QueuedOfflineAction = {
    id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    endpoint,
    method,
    payload,
    queuedAt: new Date().toISOString(),
    status: "PENDING"
  };
  queue.push(action);
  saveOfflineData("action_queue", queue);
  return action;
}

export function getOfflineQueue(): QueuedOfflineAction[] {
  return getOfflineData<QueuedOfflineAction[]>("action_queue") || [];
}

export function clearOfflineQueue(): void {
  removeOfflineData("action_queue");
}

export async function flushOfflineQueue(apiFetch: (endpoint: string, options: any) => Promise<any>): Promise<{ synced: number; failed: number }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining: QueuedOfflineAction[] = [];

  for (const item of queue) {
    try {
      await apiFetch(item.endpoint, {
        method: item.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload)
      });
      synced++;
    } catch {
      failed++;
      remaining.push(item);
    }
  }

  saveOfflineData("action_queue", remaining);
  return { synced, failed };
}

export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}
