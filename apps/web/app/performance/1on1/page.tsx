"use client";

import { useState } from "react";
import { Badge, Button, Input, Panel } from "../../../components/ui";

export default function OneOnOneMeetingsPage() {
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("m-1");

  const [meetings, setMeetings] = useState([
    {
      id: "m-1",
      employeeName: "Aarav Sharma",
      role: "Senior Backend Engineer",
      scheduledAt: "Tomorrow at 3:30 PM",
      duration: "30 min",
      status: "SCHEDULED",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      agenda: "1. Review sprint deliverables\n2. Q3 OKR progress & blocker removal\n3. Career growth & promotion trajectory",
      notes: "Aarav demonstrated high ownership on latency optimization. Recommend exploring lead architect responsibilities.",
      actionItems: [
        { id: "a1", text: "Finalize Redis cluster benchmark report", done: true },
        { id: "a2", text: "Draft technical proposal for event-driven architecture", done: false },
        { id: "a3", text: "Schedule mentoring session with junior backend engineers", done: false }
      ]
    },
    {
      id: "m-2",
      employeeName: "Meera Nair",
      role: "Product Designer",
      scheduledAt: "Friday at 11:00 AM",
      duration: "45 min",
      status: "SCHEDULED",
      meetingUrl: "https://meet.google.com/xyz-uvwx-rst",
      agenda: "Design system v2 tokens & component audit",
      notes: "Design token alignment with Tailwind config is completed.",
      actionItems: [
        { id: "b1", text: "Review mobile viewport Figma tokens", done: true }
      ]
    }
  ]);

  const activeMeeting = meetings.find((m) => m.id === selectedMeetingId) ?? meetings[0]!;

  const toggleActionItem = (itemId: string) => {
    if (!activeMeeting) return;
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === activeMeeting.id) {
          return {
            ...m,
            actionItems: m.actionItems.map((a) => (a.id === itemId ? { ...a, done: !a.done } : a))
          };
        }
        return m;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">🤝 1:1 Check-ins & Coaching</h1>
          <p className="text-sm text-zinc-500">Regular structured conversations, shared agendas, and persistent action item tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={() => setShowScheduleModal(true)}>+ Schedule 1:1 Meeting</Button>
        </div>
      </div>

      {/* Grid: Meetings Sidebar vs Active Meeting Workspace */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Scheduled Meetings */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Upcoming & Past Meetings</h3>
          {meetings.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedMeetingId(m.id)}
              className="cursor-pointer"
            >
              <Panel
                className={`p-4 transition ${
                  selectedMeetingId === m.id ? "border-indigo-500 bg-indigo-50/20 shadow-sm" : "hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-zinc-900">{m.employeeName}</h4>
                  <Badge tone={m.status === "SCHEDULED" ? "warning" : "success"}>{m.status}</Badge>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{m.role}</p>
                <p className="text-xs font-semibold text-indigo-600 mt-2">🗓️ {m.scheduledAt} ({m.duration})</p>
              </Panel>
            </div>
          ))}
        </div>

        {/* Right Column: Active Meeting Detail Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {activeMeeting && (
            <Panel className="p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900">1:1 with {activeMeeting.employeeName}</h2>
                  <p className="text-xs text-zinc-500">{activeMeeting.role} • {activeMeeting.scheduledAt}</p>
                </div>
                {activeMeeting.meetingUrl && (
                  <a href={activeMeeting.meetingUrl} target="_blank" rel="noreferrer">
                    <Button variant="primary">📹 Join Video Call</Button>
                  </a>
                )}
              </div>

              {/* Agenda */}
              <div className="mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600">Shared Agenda</h3>
                <div className="mt-2 rounded-xl bg-zinc-50 p-4 border border-zinc-100 text-xs text-zinc-800 whitespace-pre-line leading-relaxed">
                  {activeMeeting.agenda}
                </div>
              </div>

              {/* Action Items Checklist */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600">Action Items</h3>
                  <span className="text-xs text-zinc-400 font-semibold">
                    {activeMeeting.actionItems.filter((a) => a.done).length} of {activeMeeting.actionItems.length} Done
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {activeMeeting.actionItems.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                        item.done ? "border-emerald-200 bg-emerald-50/40 line-through text-zinc-400" : "border-zinc-200 bg-white text-zinc-800"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => toggleActionItem(item.id)}
                        className="rounded text-indigo-600"
                      />
                      <span>{item.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Meeting Notes */}
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600">Private Coaching & Discussion Notes</h3>
                <textarea
                  className="mt-2 w-full rounded-xl border border-zinc-200 p-3 text-xs text-zinc-800"
                  rows={4}
                  defaultValue={activeMeeting.notes}
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary">Mark as Completed</Button>
                <Button variant="primary">Save Notes</Button>
              </div>
            </Panel>
          )}
        </div>
      </div>

      {/* Schedule 1:1 Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-900">Schedule 1:1 Check-in</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700">Team Member</label>
                <Input placeholder="Select employee..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Date & Time</label>
                  <Input type="datetime-local" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700">Duration</label>
                  <select className="w-full rounded-lg border border-zinc-200 p-2 text-xs">
                    <option>30 minutes</option>
                    <option>45 minutes</option>
                    <option>60 minutes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700">Meeting Agenda</label>
                <textarea className="w-full rounded-lg border border-zinc-200 p-2 text-xs" rows={3} placeholder="Topics to cover..." />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setShowScheduleModal(false)}>Send Calendar Invite</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
