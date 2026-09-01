"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Panel } from "../../../components/ui";
import {
  clearOfflineQueue,
  flushOfflineQueue,
  getOfflineQueue,
  isOnline,
  type QueuedOfflineAction
} from "../../../lib/offline-storage";
import { apiRequest } from "../../../lib/api";

export default function MobileSettingsPage() {
  const [online, setOnline] = useState(true);
  const [queue, setQueue] = useState<QueuedOfflineAction[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setOnline(isOnline());
    setQueue(getOfflineQueue());

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check push permission
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  async function handleFlushQueue() {
    setSyncing(true);
    setStatusMsg(null);
    try {
      const { synced, failed } = await flushOfflineQueue(apiRequest);
      setQueue(getOfflineQueue());
      setStatusMsg(`Sync complete: ${synced} synced successfully, ${failed} failed.`);
    } catch {
      setStatusMsg("Failed to synchronize offline queue.");
    } finally {
      setSyncing(false);
    }
  }

  async function handleTogglePush() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("Push notifications are not supported on this browser.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setPushEnabled(true);
      setStatusMsg("Push notifications enabled on this mobile device!");
    } else {
      setPushEnabled(false);
      setStatusMsg("Push notifications permission was denied.");
    }
  }

  function handleClearCache() {
    if (typeof window !== "undefined" && "caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
      clearOfflineQueue();
      setQueue([]);
      setStatusMsg("Offline cache and pending queues cleared.");
    }
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950">Mobile PWA & Offline Workplace Settings</h1>
        <p className="text-sm text-zinc-500">
          Configure offline caching, service worker background sync, and device push notifications
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-control bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-sm">
          {statusMsg}
        </div>
      )}

      {/* Network Connectivity */}
      <Panel className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-zinc-900 text-base">Network Connectivity Status</h3>
            <p className="text-xs text-zinc-500">Live heartbeat monitor for offline sync</p>
          </div>
          <Badge tone={online ? "success" : "warning"}>{online ? "Online (Connected)" : "Offline Mode"}</Badge>
        </div>
        <p className="text-sm text-zinc-700">
          {online
            ? "Your device is connected to the cloud. All requests are synced immediately."
            : "You are currently offline. Changes are saved locally and will auto-sync when online."}
        </p>
      </Panel>

      {/* Offline Sync Queue */}
      <Panel className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-zinc-900 text-base">Pending Offline Actions</h3>
            <p className="text-xs text-zinc-500">{queue.length} action(s) waiting in queue</p>
          </div>
          <Button variant="primary" onClick={handleFlushQueue} disabled={syncing || queue.length === 0 || !online}>
            {syncing ? "Syncing..." : "🔄 Flush Queue Now"}
          </Button>
        </div>

        {queue.length > 0 ? (
          <div className="space-y-2 border-t border-border pt-3">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-control border border-border bg-surface text-xs"
              >
                <div>
                  <span className="font-semibold text-zinc-900">{item.endpoint}</span>
                  <p className="text-zinc-500">Queued: {new Date(item.queuedAt).toLocaleTimeString()}</p>
                </div>
                <Badge tone="neutral">{item.method}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">Queue is clean. No pending offline requests.</p>
        )}
      </Panel>

      {/* Push Notifications */}
      <Panel className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-zinc-900 text-base">Push Notifications</h3>
            <p className="text-xs text-zinc-500">Receive instant alerts for payslips, leaves, and approvals</p>
          </div>
          <Badge tone={pushEnabled ? "success" : "neutral"}>{pushEnabled ? "Enabled" : "Disabled"}</Badge>
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={handleTogglePush}>
            {pushEnabled ? "Manage Permissions" : "🔔 Enable Push Notifications"}
          </Button>
        </div>
      </Panel>

      {/* Cache Management */}
      <Panel className="p-6 space-y-4 border-rose-500/20">
        <div className="space-y-0.5">
          <h3 className="font-semibold text-zinc-900 text-base">Storage & Cache Maintenance</h3>
          <p className="text-xs text-zinc-500">Clear cached payslips, offline profiles, and temporary storage</p>
        </div>
        <div className="flex justify-end">
          <Button variant="danger" onClick={handleClearCache}>
            🗑️ Clear Local App Cache
          </Button>
        </div>
      </Panel>
    </div>
  );
}
