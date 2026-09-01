"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Badge, Button, Panel } from "../../../../components/ui";

export default function EmployeeCatalogPage() {
  const [catalog] = useState([
    {
      id: "cat-1",
      name: "Amazon Pay ₹1,000 E-Voucher",
      category: "GIFT_CARD",
      points: 1000,
      cashValue: "₹1,000",
      icon: "💳",
      desc: "Instant digital redemption for shopping, bill payments, and recharge."
    },
    {
      id: "cat-2",
      name: "Flipkart ₹2,000 Gift Card",
      category: "GIFT_CARD",
      points: 2000,
      cashValue: "₹2,000",
      icon: "🛍️",
      desc: "E-gift card for electronics, apparel, and home essentials."
    },
    {
      id: "cat-3",
      name: "Swiggy / Zomato ₹500 Dining Card",
      category: "EXPERIENCE",
      points: 500,
      cashValue: "₹500",
      icon: "🍕",
      desc: "Treat yourself or your family to delicious restaurant meals delivered."
    },
    {
      id: "cat-4",
      name: "Udemy / Coursera Learning Voucher",
      category: "LEARNING_VOUCHER",
      points: 1500,
      cashValue: "₹1,500",
      icon: "🎓",
      desc: "Sponsor professional upskilling, cloud certifications, or coding tracks."
    },
    {
      id: "cat-5",
      name: "Cult.fit / Gym 1-Month Pass",
      category: "WELLNESS",
      points: 1200,
      cashValue: "₹1,200",
      icon: "🏋️",
      desc: "Access premier fitness centers, yoga studios, and wellness classes."
    },
    {
      id: "cat-6",
      name: "Company Branded Premium Hoodie & Tumbler",
      category: "MERCHANDISE",
      points: 800,
      cashValue: "₹800",
      icon: "👕",
      desc: "Custom high-quality organic cotton fleece hoodie and insulated mug."
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={"/engagement/rewards" as Route} className="text-sm font-medium text-slate-500 hover:text-slate-800">
              ← Rewards Center
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">🛍️ Rewards Catalog</h1>
          <p className="text-sm text-slate-600">
            Redeem your accrued reward points for premium gift cards, fitness passes, tech courses, and company gear.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg font-mono">
          <span className="text-xs font-sans text-slate-600">My Balance:</span>
          <span className="text-base font-bold text-primary">1,250 Pts</span>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {catalog.map((item) => (
          <Panel key={item.id} className="p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-3xl">{item.icon}</span>
                <Badge tone="neutral">{item.category}</Badge>
              </div>
              <h2 className="text-base font-bold text-slate-900">{item.name}</h2>
              <p className="text-xs text-slate-600">{item.desc}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between font-mono">
                <span className="text-xs font-sans text-slate-500">Value: {item.cashValue}</span>
                <span className="text-sm font-bold text-slate-900">{item.points} Pts</span>
              </div>
              <Button
                variant={1250 >= item.points ? "primary" : "secondary"}
                disabled={1250 < item.points}
              >
                {1250 >= item.points ? "Redeem Now 🎁" : "Insufficient Pts"}
              </Button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
