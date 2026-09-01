"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Badge, Button, Panel } from "../../../../components/ui";
import { apiRequest } from "../../../../lib/api";

interface WalletData {
  rewardPointsBalance: number;
  rewardPointsValueInInr: number;
  totalPendingClaimsInr: number;
  totalApprovedClaimsInr: number;
  latestNetSalaryPaidInr: number;
  totalLiquidHoldingsInr: number;
  currency: string;
}

export default function EssWalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWallet() {
      try {
        setLoading(true);
        const res = await apiRequest<WalletData>("/wallet");
        setWallet(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadWallet();
  }, []);

  if (loading || !wallet) {
    return <div className="p-8 text-center text-muted-foreground">Loading employee digital wallet...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employee Digital Wallet</h1>
          <p className="text-sm text-muted-foreground">
            Unified financial balances across reward points, recognition awards, expense claims, and payroll payouts.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/ess" as Route}>
            <Button variant="secondary">Back to ESS</Button>
          </Link>
          <Link href={"/engagement/catalog" as Route}>
            <Button>Redeem Points</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Panel className="space-y-2 bg-primary/5 border-primary/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Reward Points Balance</span>
          <div className="text-3xl font-extrabold text-primary">
            {wallet.rewardPointsBalance.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">pts</span>
          </div>
          <p className="text-xs text-muted-foreground">≈ ₹{wallet.rewardPointsValueInInr.toLocaleString()} INR Value</p>
        </Panel>

        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Approved Reimbursements</span>
          <div className="text-3xl font-extrabold text-foreground">
            ₹{wallet.totalApprovedClaimsInr.toLocaleString()}
          </div>
          <p className="text-xs text-success font-medium">Ready for next payroll credit</p>
        </Panel>

        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Pending Claims</span>
          <div className="text-3xl font-extrabold text-warning">
            ₹{wallet.totalPendingClaimsInr.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Under manager review</p>
        </Panel>

        <Panel className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Latest Net Salary Paid</span>
          <div className="text-3xl font-extrabold text-foreground">
            ₹{wallet.latestNetSalaryPaidInr.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Disbursed via bank transfer</p>
        </Panel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel className="space-y-4">
          <h3 className="text-base font-bold text-foreground">Points & Recognition Ledger</h3>
          <div className="space-y-3">
            {[
              { id: "1", desc: "Spot Award - Q3 Architecture Excellence", pts: "+500 pts", type: "credit", date: "28 Aug 2026" },
              { id: "2", desc: "Peer Kudos from Priya Sharma", pts: "+100 pts", type: "credit", date: "24 Aug 2026" },
              { id: "3", desc: "Amazon E-Gift Voucher Redemption", pts: "-300 pts", type: "debit", date: "15 Aug 2026" },
              { id: "4", desc: "Quarterly Pulse Survey Participation", pts: "+50 pts", type: "credit", date: "10 Aug 2026" }
            ].map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 border border-border rounded">
                <div>
                  <p className="text-sm font-medium">{item.desc}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <Badge tone={item.type === "credit" ? "success" : "neutral"}>{item.pts}</Badge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="space-y-4">
          <h3 className="text-base font-bold text-foreground">Reimbursement & Claim History</h3>
          <div className="space-y-3">
            {[
              { id: "1", title: "Client Travel (Flight + Hotel)", amount: "₹4,200", status: "APPROVED", date: "26 Aug 2026" },
              { id: "2", title: "Internet & Mobile Allowance", amount: "₹1,400", status: "APPROVED", date: "01 Aug 2026" },
              { id: "3", title: "Certification Exam Fee Reimbursement", amount: "₹2,450", status: "PENDING", date: "29 Aug 2026" }
            ].map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 border border-border rounded">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{item.amount}</p>
                  <Badge tone={item.status === "APPROVED" ? "success" : "warning"}>{item.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
