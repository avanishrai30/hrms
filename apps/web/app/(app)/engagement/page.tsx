"use client";

import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../components/ui";

export default function EngagementOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🌟 Employee Experience & Culture Hub</h1>
          <p className="text-sm text-slate-600">
            Celebrate colleagues, redeem reward points, voice your perspective in pulse surveys, and connect in interest communities.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/engagement/recognition" as Route}>
            <Button variant="primary">✨ Send Kudos</Button>
          </Link>
          <Link href={"/engagement/pulse" as Route}>
            <Button variant="secondary">⚡ Quick Pulse</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 font-mono">
        <Panel className="p-4 border-l-4 border-l-primary">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">My Reward Wallet</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">1,250 Pts</div>
          <span className="text-xs font-sans text-emerald-600 font-medium">₹1,250 Value</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Recognitions Received</span>
          <div className="mt-1 text-2xl font-bold text-emerald-700">18 Kudos</div>
          <span className="text-xs font-sans text-slate-500">Rank: Culture Champion</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-blue-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Active Surveys</span>
          <div className="mt-1 text-2xl font-bold text-blue-700">2 Pending</div>
          <span className="text-xs font-sans text-blue-600">Q3 Pulse & eNPS</span>
        </Panel>
        <Panel className="p-4 border-l-4 border-l-purple-500">
          <span className="text-xs font-sans font-medium text-slate-500 uppercase">Unlocked Badges</span>
          <div className="mt-1 text-2xl font-bold text-purple-700">6 Badges</div>
          <span className="text-xs font-sans text-slate-500">Next: Innovation Star</span>
        </Panel>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href={"/engagement/recognition" as Route} className="group">
          <Panel className="p-5 h-full transition hover:border-primary hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🏆</span>
              <Badge tone="success">PEER RECOGNITION</Badge>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-primary">Peer Kudos & Awards</h3>
            <p className="mt-1 text-xs text-slate-600">
              Appreciate team members with values-based badges and reward points.
            </p>
          </Panel>
        </Link>

        <Link href={"/engagement/social-wall" as Route} className="group">
          <Panel className="p-5 h-full transition hover:border-primary hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl">📱</span>
              <Badge tone="neutral">COMPANY FEED</Badge>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-primary">Social Wall & Community</h3>
            <p className="mt-1 text-xs text-slate-600">
              Engage with company celebrations, milestone announcements, and team discussions.
            </p>
          </Panel>
        </Link>

        <Link href={"/engagement/catalog" as Route} className="group">
          <Panel className="p-5 h-full transition hover:border-primary hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🎁</span>
              <Badge tone="success">REWARD STORE</Badge>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-primary">Rewards Catalog</h3>
            <p className="mt-1 text-xs text-slate-600">
              Redeem your points for gift cards, merchandise, learning vouchers, and experiences.
            </p>
          </Panel>
        </Link>

        <Link href={"/engagement/pulse" as Route} className="group">
          <Panel className="p-5 h-full transition hover:border-primary hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl">⚡</span>
              <Badge tone="warning">WEEKLY CHECK-IN</Badge>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-primary">Pulse Surveys & Happiness</h3>
            <p className="mt-1 text-xs text-slate-600">
              Share quick 30-second happiness, stress, and energy ratings anonymously.
            </p>
          </Panel>
        </Link>

        <Link href={"/engagement/suggestions" as Route} className="group">
          <Panel className="p-5 h-full transition hover:border-primary hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl">💡</span>
              <Badge tone="neutral">INNOVATION</Badge>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-primary">Employee Voice & Ideas</h3>
            <p className="mt-1 text-xs text-slate-600">
              Submit ideas for workplace and process improvements; upvote peer proposals.
            </p>
          </Panel>
        </Link>

        <Link href={"/engagement/challenges" as Route} className="group">
          <Panel className="p-5 h-full transition hover:border-primary hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🚀</span>
              <Badge tone="success">HACKATHONS</Badge>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-primary">Innovation Challenges</h3>
            <p className="mt-1 text-xs text-slate-600">
              Participate in company hackathons, propose tech solutions, and win point pools.
            </p>
          </Panel>
        </Link>
      </div>
    </div>
  );
}
