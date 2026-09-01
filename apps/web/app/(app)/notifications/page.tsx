"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Input, Panel } from "../../../components/ui";
import { apiRequest } from "../../../lib/api";
import type { NotificationChannel, NotificationPreferenceView, NotificationView } from "@vc-wms/shared-types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationView[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [search, setSearch] = useState("");

  // Preferences Modal
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<Array<{ channel: NotificationChannel; isEnabled: boolean }>>([
    { channel: "IN_APP", isEnabled: true },
    { channel: "EMAIL", isEnabled: true },
    { channel: "SMS", isEnabled: false },
    { channel: "WHATSAPP", isEnabled: false },
    { channel: "PUSH", isEnabled: true }
  ]);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (channelFilter !== "ALL") params.set("channel", channelFilter);
      if (unreadOnly) params.set("unreadOnly", "true");

      const queryStr = params.toString() ? `?${params.toString()}` : "";
      const [items, unreadRes] = await Promise.all([
        apiRequest<NotificationView[]>(`/notifications/me${queryStr}`).catch(() => []),
        apiRequest<{ unreadCount: number }>("/notifications/me/unread-count").catch(() => ({ unreadCount: 0 }))
      ]);

      setNotifications(items);
      setUnreadCount(unreadRes.unreadCount ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const res = await apiRequest<{ preferences: NotificationPreferenceView[] }>("/notifications/preferences");
      if (res.preferences && res.preferences.length > 0) {
        setPreferences(
          res.preferences.map((p) => ({
            channel: p.channel,
            isEnabled: p.isEnabled
          }))
        );
      }
    } catch {
      // Use defaults if fetch fails
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, [channelFilter, unreadOnly]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiRequest(`/notifications/me/read/${id}`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "READ" as const, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to mark as read.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiRequest("/notifications/me/read-all", { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: "READ" as const, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to mark all as read.");
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsSavingPrefs(true);
      await apiRequest("/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify({ preferences })
      });
      setShowPreferences(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save preferences.");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (!search) return true;
    const matchSubject = n.subject?.toLowerCase().includes(search.toLowerCase());
    const matchBody = n.body.toLowerCase().includes(search.toLowerCase());
    return matchSubject || matchBody;
  });

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Notification Center</h1>
            {unreadCount > 0 && <Badge tone="warning">{unreadCount} Unread</Badge>}
          </div>
          <p className="mt-1 text-sm text-zinc-600">
            Real-time multi-channel notifications, announcements, and workflow alerts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              void loadPreferences();
              setShowPreferences(true);
            }}
          >
            Preferences
          </Button>
          <Button variant="primary" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            Mark All as Read
          </Button>
        </div>
      </header>

      {error && (
        <div className="rounded-control border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Controls & Filters */}
      <Panel className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "IN_APP", "EMAIL", "SMS", "WHATSAPP", "PUSH"].map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={`rounded-control px-3 py-1.5 text-xs font-medium transition ${
                channelFilter === ch
                  ? "bg-primary text-white"
                  : "border border-border bg-surface text-zinc-600 hover:bg-muted"
              }`}
            >
              {ch.replace("_", " ")}
            </button>
          ))}
          <button
            onClick={() => setUnreadOnly((prev) => !prev)}
            className={`rounded-control px-3 py-1.5 text-xs font-medium transition ${
              unreadOnly ? "bg-amber-600 text-white" : "border border-border bg-surface text-zinc-600 hover:bg-muted"
            }`}
          >
            {unreadOnly ? "Showing Unread Only" : "Filter Unread"}
          </button>
        </div>
        <div className="w-full md:w-72">
          <Input
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Panel>

      {/* Notifications List */}
      <Panel>
        {isLoading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted text-xl text-zinc-400">
              🔔
            </div>
            <h3 className="text-base font-semibold text-zinc-900">No notifications found</h3>
            <p className="mt-1 text-sm text-zinc-500">You are all caught up on your alerts and tasks.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex flex-col gap-3 py-4 transition md:flex-row md:items-start md:justify-between ${
                  notif.status !== "READ" ? "bg-amber-50/30 px-3 rounded-panel" : ""
                }`}
              >
                <div className="grid gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-700 uppercase">
                      [{notif.channel}]
                    </span>
                    {notif.subject && (
                      <span className="font-medium text-zinc-950">{notif.subject}</span>
                    )}
                    <Badge
                      tone={
                        notif.status === "READ"
                          ? "neutral"
                          : notif.status === "DELIVERED" || notif.status === "SENT"
                          ? "success"
                          : notif.status === "FAILED"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {notif.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">{notif.body}</p>
                  <time className="text-xs text-zinc-400">
                    {new Date(notif.createdAt).toLocaleString()}
                  </time>
                </div>
                {notif.status !== "READ" && (
                  <Button
                    variant="ghost"
                    className="self-start text-xs text-zinc-600"
                    onClick={() => void handleMarkAsRead(notif.id)}
                  >
                    Mark as Read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-panel border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-950">Notification Preferences</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Configure which communication channels you wish to receive updates from.
            </p>

            <div className="mt-6 space-y-4">
              {preferences.map((pref, idx) => (
                <div key={pref.channel} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{pref.channel.replace("_", " ")}</p>
                    <p className="text-xs text-zinc-500">
                      Receive alerts and critical events via {pref.channel.toLowerCase()}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                    checked={pref.isEnabled}
                    onChange={(e) => {
                      const updated = [...preferences];
                      if (updated[idx]) {
                        updated[idx].isEnabled = e.target.checked;
                        setPreferences(updated);
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowPreferences(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSavePreferences} disabled={isSavingPrefs}>
                {isSavingPrefs ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
